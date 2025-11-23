import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import { Input } from "~/shared/inputs/Input";
import { StreetInputWithSuggest } from "~/shared/inputs/StreetInputWithSuggest";
import type { UserAddress } from "~/types/user";

interface AddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  address?: UserAddress;
  isLoading?: boolean;
}

export const AddressDialog: React.FC<AddressDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  address,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  // Схема валидации формы с переводами
  const addressSchema = z.object({
    name: z
      .string()
      .min(2, t("profile.addresses.errors.name_min_length"))
      .max(50, t("profile.addresses.errors.name_max_length")),
    street: z
      .string()
      .min(5, t("profile.addresses.errors.street_min_length"))
      .max(200, t("profile.addresses.errors.street_max_length")),
    city: z
      .string()
      .min(2, t("profile.addresses.errors.city_min_length"))
      .max(100, t("profile.addresses.errors.city_max_length")),
    country: z
      .string()
      .min(2, t("profile.addresses.errors.country_min_length"))
      .max(100, t("profile.addresses.errors.country_max_length")),
    postalCode: z.string().regex(/^\d{6}$/, t("profile.addresses.errors.postal_code_format")),
    apartmentNumber: z
      .string()
      .max(20, t("verification_dialog.errors.apartment_number_max_length"))
      .optional(),
    isDefault: z.boolean().optional(),
  });

  type AddressFormData = z.infer<typeof addressSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    control,
    getValues,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      if (address) {
        // Редактирование существующего адреса
        setValue("name", address.name);
        setValue("street", address.street);
        setValue("city", address.city);
        setValue("country", address.country);
        setValue("postalCode", address.postalCode);
        setValue("apartmentNumber", address.apartmentNumber || "");
        setValue("isDefault", address.isDefault);
      } else {
        // Новый адрес
        reset();
      }
    }
  }, [isOpen, address, setValue, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: AddressFormData) => {
    onSave(data);
  };

  // Обработка выбора адреса с автозаполнением полей
  const handleAddressSelect = (suggestion: any) => {
    if (suggestion.components) {
      const { components } = suggestion;

      // Автоматически заполняем остальные поля если они доступны
      if (components.city && !getValues("city")) {
        setValue("city", components.city, { shouldValidate: true });
      }

      if (components.country && !getValues("country")) {
        setValue("country", components.country, { shouldValidate: true });
      }

      if (components.postalCode && !getValues("postalCode")) {
        setValue("postalCode", components.postalCode, { shouldValidate: true });
      }

      if (components.apartmentNumber && !getValues("apartmentNumber")) {
        setValue("apartmentNumber", components.apartmentNumber, { shouldValidate: true });
      }
    }
  };

  // Обработка клавиши Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
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
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Фон */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,.5)] backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
          aria-label="Закрыть"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Содержимое */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: "#121212" }}>
            {address ? t("profile.addresses.edit_address") : t("profile.addresses.add_address")}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.addresses.name")}
              </label>
              <Input
                {...register("name")}
                placeholder={t("profile.addresses.name_placeholder")}
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.addresses.street")}
              </label>
              <Controller
                name="street"
                control={control}
                render={({ field }) => (
                  <StreetInputWithSuggest
                    value={field.value}
                    onChange={field.onChange}
                    onSuggestionSelect={handleAddressSelect}
                    placeholder={t("profile.addresses.street_placeholder")}
                    error={errors.street?.message}
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
                {...register("apartmentNumber")}
                placeholder={t("verification_dialog.step_3.fields.apartment_number_placeholder")}
                error={errors.apartmentNumber?.message}
                maxLength={20}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("profile.addresses.city")}
                </label>
                <Input
                  {...register("city")}
                  placeholder={t("profile.addresses.city_placeholder")}
                  error={errors.city?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("profile.addresses.postal_code")}
                </label>
                <Input
                  {...register("postalCode")}
                  placeholder={t("profile.addresses.postal_code_placeholder")}
                  error={errors.postalCode?.message}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.addresses.country")}
              </label>
              <Input
                {...register("country")}
                placeholder={t("profile.addresses.country_placeholder")}
                error={errors.country?.message}
              />
            </div>

            <div className="hidden ">
              <input
                type="checkbox"
                id="isDefault"
                {...register("isDefault")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                {t("profile.addresses.set_as_default")}
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <AppButton
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                {t("common.cancel")}
              </AppButton>
              <AppButton
                type="submit"
                variant="primary"
                disabled={!isValid || isLoading}
                isLoading={isLoading}
              >
                {address ? t("profile.addresses.save_changes") : t("profile.addresses.add_address")}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
