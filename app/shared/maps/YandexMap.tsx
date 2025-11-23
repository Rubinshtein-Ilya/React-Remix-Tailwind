import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useYandexConfig } from "~/contexts/YandexConfigContext";

// Типы из официальной библиотеки ymaps3
interface YMapLocationRequest {
  center: [number, number];
  zoom: number;
}

interface YandexMapProps {
  address: string;
  className?: string;
}

// Упрощенная загрузка с официальной библиотекой
const loadYandexMap = async (apiKey: string) => {
  if (typeof window === "undefined") return null;

  // Проверяем доступность ymaps3
  if (!(window as any).ymaps3) {
    // Динамически загружаем скрипт
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    // Ждем готовности
    await (window as any).ymaps3.ready;
  }

  // Загружаем reactify
  const ymaps3Reactify = await (window as any).ymaps3.import('@yandex/ymaps3-reactify');
  
  // Инициализируем reactify с React и ReactDOM
  const ReactModule = await import("react");
  const ReactDOMModule = await import("react-dom");
  
  const reactify = ymaps3Reactify.reactify.bindTo(ReactModule.default, ReactDOMModule);
  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = 
    reactify.module((window as any).ymaps3);
  
  return {
    YMap,
    YMapDefaultSchemeLayer, 
    YMapDefaultFeaturesLayer,
    YMapMarker,
    reactify
  };
};

export function YandexMap({ address, className = "" }: YandexMapProps) {
  const { t } = useTranslation();
  const { apiKey, mapApiKey } = useYandexConfig();
  const [mapComponents, setMapComponents] = useState<any | null>(null);
  const [location, setLocation] = useState<YMapLocationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  // Геокодирование адреса
  const geocodeAddress = async (
    address: string
  ): Promise<YMapLocationRequest | null> => {
    if (!address || address.length < 3) return null;

    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?geocode=${encodedAddress}&format=json&apikey=${mapApiKey}&results=1&lang=ru_RU`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const geoObjects = data.response?.GeoObjectCollection?.featureMember;

      if (!geoObjects || geoObjects.length === 0) {
        throw new Error(t("map.address_not_found"));
      }

      const coordinates = geoObjects[0].GeoObject.Point.pos.split(" ");
      const [lng, lat] = coordinates.map(Number);

      return {
        center: [lng, lat],
        zoom: 16,
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  };

  // Инициализация карты
  useEffect(() => {
    if (!mapApiKey || !address || initRef.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        initRef.current = true;

        // Загружаем компоненты карты
        const components = await loadYandexMap(mapApiKey);
        if (!components) {
          throw new Error(t("map.error_loading"));
        }

        setMapComponents(components);

        // Геокодируем адрес
        const geocoded = await geocodeAddress(address);
        if (!geocoded) {
          throw new Error(t("map.address_not_found"));
        }

        setLocation(geocoded);
      } catch (error) {
        console.error("Map initialization error:", error);
        setError(
          error instanceof Error ? error.message : t("map.error_loading")
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [mapApiKey, address, t]);

  // Обновление локации при изменении адреса
  useEffect(() => {
    if (!mapApiKey || !address || !mapComponents || address.length < 3) return;

    const updateLocation = async () => {
      try {
        setError(null);
        const geocoded = await geocodeAddress(address);
        if (geocoded) {
          setLocation(geocoded);
        }
      } catch (error) {
        console.error("Address update error:", error);
        setError(
          error instanceof Error ? error.message : t("map.address_not_found")
        );
      }
    };

    updateLocation();
  }, [address, mapApiKey, mapComponents, t]);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-sm text-gray-600">{t("map.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-red-50 rounded-lg ${className}`}
      >
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg
              className="w-8 h-8 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!mapComponents || !location) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}
      >
        <p className="text-sm text-gray-600">{t("map.check_address")}</p>
      </div>
    );
  }

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapMarker,
    reactify
  } = mapComponents;

  return (
    <div
      className={`h-64 rounded-lg overflow-hidden border border-gray-200 ${className}`}
    >
      <YMap
        location={reactify.useDefault(location)}
        mode="vector"
        theme="light"
      >
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />

        {location && (
          <YMapMarker coordinates={reactify.useDefault(location.center)}>
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </YMapMarker>
        )}
      </YMap>
    </div>
  );
}
