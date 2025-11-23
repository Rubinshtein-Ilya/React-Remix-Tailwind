import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Input } from "~/shared/inputs/Input";
import { StreetInputWithSuggest } from "~/shared/inputs/StreetInputWithSuggest";
import { AppButton } from "~/shared/buttons/AppButton";
import { type Address } from "~/types/address";

interface EditAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Address) => void;
  isLoading?: boolean;
  currentAddress?: Address | null;
}

export const EditAddressDialog: React.FC<EditAddressDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  currentAddress = null,
}) => {
  const { t } = useTranslation();

  // Схема валидации с переводами для структуры адреса из User.ts
  const addressSchema = z.object({
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
      street: currentAddress?.street || "",
      city: currentAddress?.city || "",
      country: currentAddress?.country || "Россия",
      postalCode: currentAddress?.postalCode || "",
      apartmentNumber: currentAddress?.apartmentNumber || "",
    },
  });

  // Сброс формы при изменении currentAddress
  useEffect(() => {
    if (isOpen) {
      form.reset({
        street: currentAddress?.street || "",
        city: currentAddress?.city || "",
        country: currentAddress?.country || "Россия",
        postalCode: currentAddress?.postalCode || "",
        apartmentNumber: currentAddress?.apartmentNumber || "",
      });
    }
  }, [isOpen, currentAddress, form]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (data: AddressFormData) => {
    onSave({
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Фон */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,.5)] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Модальное окно */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
          aria-label="Закрыть"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Заголовок */}
        <h2
          className="text-2xl font-bold text-center mb-6"
          style={{ color: "#121212" }}
        >
          {t("profile.address.edit_title", "Редактирование адреса")}
        </h2>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

          {form.formState.errors.root && (
            <p className="text-red-500 text-sm mt-2">
              {form.formState.errors.root.message}
            </p>
          )}

          {/* Кнопки */}
          <div className="flex gap-3 mt-6">
            <AppButton
              type="button"
              onClick={onClose}
              variant="ghost"
              disabled={isLoading}
              className="flex-1"
            >
              {t("common.cancel")}
            </AppButton>
            
            <AppButton
              type="submit"
              disabled={!form.formState.isValid || isLoading}
              variant="primary"
              isLoading={isLoading}
              className="flex-1"
            >
              {isLoading 
                ? t("profile.address.saving", "Сохранение...") 
                : t("profile.address.save", "Сохранить")
              }
            </AppButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}; 
