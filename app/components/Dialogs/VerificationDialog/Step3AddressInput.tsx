import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Input } from "~/shared/inputs/Input";
import { StreetInputWithSuggest } from "~/shared/inputs/StreetInputWithSuggest";
import { AppButton } from "~/shared/buttons/AppButton";
import { YandexMap } from "~/shared/maps/YandexMap";

interface Step3AddressInputProps {
  onNext: (data: {
    name: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
    apartmentNumber?: string;
  }) => void;
  isLoading: boolean;
}

export function Step3AddressInput({
  onNext,
  isLoading,
}: Step3AddressInputProps) {
  const { t } = useTranslation();

  // Схема валидации с переводами для новой структуры адреса
  const addressSchema = z.object({
    name: z
      .string()
      .min(1, t("verification_dialog.errors.name_required"))
      .min(2, t("verification_dialog.errors.name_min_length"))
      .max(100, t("verification_dialog.errors.name_max_length")),
    street: z
      .string()
      .min(1, t("verification_dialog.errors.street_required"))
      .min(5, t("verification_dialog.errors.street_min_length"))
      .max(200, t("verification_dialog.errors.street_max_length")),
    city: z
      .string()
      .min(1, t("verification_dialog.errors.city_required"))
      .min(2, t("verification_dialog.errors.city_min_length"))
      .max(100, t("verification_dialog.errors.city_max_length")),
    country: z
      .string()
      .min(1, t("verification_dialog.errors.country_required"))
      .min(2, t("verification_dialog.errors.country_min_length"))
      .max(100, t("verification_dialog.errors.country_max_length")),
    postalCode: z
      .string()
      .min(1, t("verification_dialog.errors.postal_code_required"))
      .regex(/^\d{6}$/, t("verification_dialog.errors.postal_code_format")),
    apartmentNumber: z
      .string()
      .max(20, t("verification_dialog.errors.apartment_number_max_length"))
      .optional(),
  });

  type AddressFormData = z.infer<typeof addressSchema>;

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: "onChange",
    defaultValues: {
      name: "Основной адрес",
      street: "",
      city: "",
      country: "Россия",
      postalCode: "",
      apartmentNumber: "",
    },
  });

  const handleSubmit = (data: AddressFormData) => {
    onNext({
      name: data.name.trim(),
      street: data.street.trim(),
      city: data.city.trim(),
      country: data.country.trim(),
      postalCode: data.postalCode.trim(),
      apartmentNumber: data.apartmentNumber?.trim(),
    });
  };

  // Обработка выбора адреса с автозаполнением полей
  const handleAddressSelect = (suggestion: any) => {
    if (suggestion.components) {
      const { components } = suggestion;
      
      // Автоматически заполняем остальные поля если они доступны
      if (components.city && !form.getValues('city')) {
        form.setValue('city', components.city, { shouldValidate: true });
      }
      
      if (components.country && !form.getValues('country')) {
        form.setValue('country', components.country, { shouldValidate: true });
      }
      
            if (components.postalCode && !form.getValues('postalCode')) {
        form.setValue('postalCode', components.postalCode, { shouldValidate: true });
      }
      
      if (components.apartmentNumber && !form.getValues('apartmentNumber')) {
        form.setValue('apartmentNumber', components.apartmentNumber, { shouldValidate: true });
      }
    }
  };

  // Получаем текущие значения формы для отображения на карте
  const watchedValues = form.watch();
  const fullAddress = [
    watchedValues.street,
    watchedValues.city,
    watchedValues.country
  ].filter(Boolean).join(", ");

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-[#121212] text-center">
        {t("verification_dialog.step_3.title")}
      </h3>
      <p className="text-gray-600 mb-6 text-center">
        {t("verification_dialog.step_3.description")}
      </p>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("verification_dialog.step_3.fields.name")}
          </label>
          <Input
            {...form.register("name")}
            placeholder={t("verification_dialog.step_3.fields.name_placeholder")}
            error={form.formState.errors.name?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("verification_dialog.step_3.fields.street")}
          </label>
          <Controller
            name="street"
            control={form.control}
            render={({ field }) => (
              <StreetInputWithSuggest
                value={field.value}
                onChange={field.onChange}
                onSuggestionSelect={handleAddressSelect}
                placeholder={t("verification_dialog.step_3.fields.street_placeholder")}
                error={form.formState.errors.street?.message}
                name={field.name}
              />
            )}
          />
          {/* <p className="text-xs text-gray-500 mt-1">
            {t("verification_dialog.step_3.auto_fill_hint")}
          </p> */}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("verification_dialog.step_3.fields.apartment_number")}
          </label>
          <Input
            {...form.register("apartmentNumber")}
            placeholder={t("verification_dialog.step_3.fields.apartment_number_placeholder")}
            error={form.formState.errors.apartmentNumber?.message}
            maxLength={20}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("verification_dialog.step_3.fields.city")}
            </label>
            <Input
              {...form.register("city")}
              placeholder={t("verification_dialog.step_3.fields.city_placeholder")}
              error={form.formState.errors.city?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("verification_dialog.step_3.fields.postal_code")}
            </label>
            <Input
              {...form.register("postalCode")}
              placeholder={t("verification_dialog.step_3.fields.postal_code_placeholder")}
              error={form.formState.errors.postalCode?.message}
              maxLength={6}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("verification_dialog.step_3.fields.country")}
          </label>
          <Input
            {...form.register("country")}
            placeholder={t("verification_dialog.step_3.fields.country_placeholder")}
            error={form.formState.errors.country?.message}
          />
        </div>

        {/* Карта под полями */}
        {/* {fullAddress.length > 10 && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("verification_dialog.step_3.map_preview")}
            </label>
            <YandexMap
              address={fullAddress}
              className="w-full h-64 rounded-lg border border-gray-300"
            />
          </div>
        )} */}

        {form.formState.errors.root && (
          <p className="text-red-500 text-sm mt-2">
            {form.formState.errors.root.message}
          </p>
        )}

        <AppButton
          type="submit"
          disabled={!form.formState.isValid || isLoading}
          variant="secondary"
          isLoading={isLoading}
        >
          {t("verification_dialog.buttons.continue")}
        </AppButton>
      </form>
    </div>
  );
} 
