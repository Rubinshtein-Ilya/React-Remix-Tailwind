import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useYandexConfig } from "~/contexts/YandexConfigContext";
import { useAuth } from "~/queries/auth";
import {
  type YandexSuggestResponse,
  type YandexSuggestResult,
} from "~/types/address";

interface AddressComponents {
  street?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  house?: string;
}

interface StreetSuggestion {
  title: string;
  subtitle?: string;
  address: string;
  components?: AddressComponents;
  fullAddress?: string;
}

interface StreetInputWithSuggestProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: StreetSuggestion) => void;
  placeholder?: string;
  error?: string;
  name?: string;
}

export const StreetInputWithSuggest = React.forwardRef<
  HTMLInputElement,
  StreetInputWithSuggestProps
>(({ value, onChange, onSuggestionSelect, placeholder, error, name }, ref) => {
  const { t } = useTranslation();
  const { apiKey } = useYandexConfig();
  const [suggestions, setSuggestions] = useState<StreetSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const auth = useAuth();

  // Объединяем рефы
  React.useImperativeHandle(ref, () => inputRef.current!);

  // Функция для парсинга компонентов адреса из ответа Yandex API
  const parseAddressComponents = (
    item: YandexSuggestResult
  ): AddressComponents => {
    const components: AddressComponents = {};

    // Если есть address объект с компонентами
    if (item.address && item.address.component) {
      const addressComponents = item.address.component;

      for (const component of addressComponents) {
        const name = component.name;
        const kinds = component.kind; // kind - это массив строк

        // Обрабатываем каждый тип в массиве kind
        for (const kind of kinds) {
          switch (kind.toLowerCase()) {
            case "house":
              components.house = name;
              break;
            case "street":
              if (!components.street) {
                components.street = name;
              }
              break;
            case "locality":
            case "district":
              if (!components.city) {
                components.city = name;
              }
              break;
            case "province":
            case "area":
            case "region":
              if (!components.city) {
                components.city = name;
              }
              break;
            case "country":
              components.country = name;
              break;
          }
        }
      }
    }

    // Если есть formatted_address, используем его как fallback
    if (item.address && item.address.formatted_address) {
      const formattedAddress = item.address.formatted_address;

      // Простой парсинг из formatted_address если компоненты не найдены
      if (!components.country) {
        if (
          formattedAddress.includes("Россия") ||
          formattedAddress.includes("Russia")
        ) {
          components.country = "Россия";
        } else if (
          formattedAddress.includes("Украина") ||
          formattedAddress.includes("Ukraine")
        ) {
          components.country = "Украина";
        } else if (
          formattedAddress.includes("Беларусь") ||
          formattedAddress.includes("Belarus")
        ) {
          components.country = "Беларусь";
        } else if (
          formattedAddress.includes("Казахстан") ||
          formattedAddress.includes("Kazakhstan")
        ) {
          components.country = "Казахстан";
        }
      }

      // Извлекаем почтовый индекс из formatted_address
      const postalCodeMatch = formattedAddress.match(/\b\d{6}\b/);
      if (postalCodeMatch && !components.postalCode) {
        components.postalCode = postalCodeMatch[0];
      }
    }

    return components;
  };

  // Функция для получения предложений через Yandex Suggest API
  const getSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);

    try {
      // Формируем параметры запроса
      const params = new URLSearchParams({
        text: query,
        type: "house,street,geo",
        lang: "ru_RU",
        results: "5",
        apikey: apiKey,
        sessiontoken: auth.user?._id || "",
        print_address: "1",
      });

      // Используем Yandex Suggest API
      const response = await fetch(
        `https://suggest-maps.yandex.ru/v1/suggest?${params}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: YandexSuggestResponse = await response.json();

      const formattedSuggestions: StreetSuggestion[] =
        data.results?.map((item: YandexSuggestResult) => {
          const components = parseAddressComponents(item);
          const title = item.title?.text || "";
          const subtitle = item.subtitle?.text || "";

          // Формируем полный адрес для отображения
          const addressParts = [title];
          if (subtitle && !title.includes(subtitle)) {
            addressParts.push(subtitle);
          }

          return {
            title,
            subtitle,
            address: title,
            components,
            fullAddress: addressParts.join(", "),
          };
        }) || [];

      setSuggestions(formattedSuggestions);
      setShowSuggestions(formattedSuggestions.length > 0);
    } catch (error) {
      console.error("Ошибка при получении предложений:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка изменения текста
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Очищаем предыдущий таймаут
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Устанавливаем новый таймаут для запроса предложений
    timeoutRef.current = setTimeout(() => {
      getSuggestions(newValue);
    }, 300);
  };

  // Обработка выбора предложения
  const handleSuggestionSelect = (suggestion: StreetSuggestion) => {
    // Формируем адрес для поля улицы
    const streetAddress = suggestion.components?.house
      ? `${suggestion.components.street || suggestion.title}, ${
          suggestion.components.house
        }`
      : suggestion.title;

    onChange(streetAddress);
    setShowSuggestions(false);
    setSuggestions([]);

    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  // Закрытие списка при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500"
        }`}
        autoComplete="street-address"
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="text-sm text-gray-900">{suggestion.title}</div>
              {suggestion.subtitle && (
                <div className="text-xs text-gray-600 mt-1">
                  {suggestion.subtitle}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
