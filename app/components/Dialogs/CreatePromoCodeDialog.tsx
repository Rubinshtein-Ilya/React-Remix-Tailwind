import React, { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Input } from "~/shared/inputs/Input";
import { AppButton } from "~/shared/buttons/AppButton";
import { useCreatePromoCode } from "~/queries/admin/promoCode";

// Схема валидации для создания промокода
const createPromoCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Промокод должен содержать минимум 3 символа")
    .max(20, "Промокод не должен превышать 20 символов")
    .regex(
      /^[\p{L}0-9]+$/u,
      "Промокод может содержать только буквы и цифры"
    ),
  discount: z
    .number()
    .min(1, "Скидка должна быть минимум 1%")
    .max(100, "Скидка не может превышать 100%"),
  description: z
    .string()
    .min(5, "Описание должно содержать минимум 5 символов")
    .max(200, "Описание не должно превышать 200 символов"),
  validUntil: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate > today;
  }, "Дата должна быть в будущем"),
  maxUses: z
    .union([
      z.number().min(1, "Максимальное количество использований должно быть минимум 1"),
      z.null(),
    ])
    .optional(),
  minOrderAmount: z
    .number()
    .min(0, "Минимальная сумма заказа не может быть отрицательной")
    .optional(),
});

type CreatePromoCodeFormData = z.infer<typeof createPromoCodeSchema>;

interface CreatePromoCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePromoCodeDialog: React.FC<CreatePromoCodeDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const createPromoCodeMutation = useCreatePromoCode();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<CreatePromoCodeFormData>({
    resolver: zodResolver(createPromoCodeSchema),
    mode: "onChange",
    defaultValues: {
      discount: 10,
      minOrderAmount: 0,
      maxUses: null,
    },
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
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
  }, [isOpen, handleClose]);

  // Обработчик отправки формы
  const onSubmit = async (data: CreatePromoCodeFormData) => {
    try {
      await createPromoCodeMutation.mutateAsync({
        code: data.code.toUpperCase(),
        discount: data.discount,
        description: data.description,
        validUntil: new Date(data.validUntil),
        maxUses: data.maxUses || undefined,
        minOrderAmount: data.minOrderAmount || 0,
      });
      onSuccess();
    } catch (error) {
      // Ошибка обрабатывается в хуке
    }
  };

  // Автоматическое преобразование кода в верхний регистр
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^\p{L}0-9]/gu, "");
    setValue("code", value, { shouldValidate: true });
  };

  // Получаем значение для минимальной даты (завтра)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Фон */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,.5)] backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Модальное окно */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
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

        {/* Содержимое */}
        <div className="p-6">
          <h2
            className="text-2xl font-bold text-center mb-6"
            style={{ color: "#121212" }}
          >
            {t("admin.promo_codes.create_dialog.title")}
          </h2>

          {/* Форма */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Код промокода */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.promo_codes.create_dialog.code")} *
              </label>
              <Input
                {...register("code")}
                placeholder="WELCOME2024"
                error={errors.code?.message}
                onChange={handleCodeChange}
                className="uppercase"
                maxLength={20}
              />
            </div>

            {/* Скидка */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.promo_codes.create_dialog.discount")} (%) *
              </label>
              <Input
                {...register("discount", { valueAsNumber: true })}
                type="number"
                min={1}
                max={100}
                placeholder="10"
                error={errors.discount?.message}
              />
            </div>

            {/* Описание */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.promo_codes.create_dialog.description")} *
              </label>
              <Input
                {...register("description")}
                placeholder={t(
                  "admin.promo_codes.create_dialog.description_placeholder"
                )}
                error={errors.description?.message}
                maxLength={200}
              />
            </div>

            {/* Срок действия */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.promo_codes.create_dialog.valid_until")} *
              </label>
              <Input
                {...register("validUntil")}
                type="date"
                min={getMinDate()}
                error={errors.validUntil?.message}
              />
            </div>

            {/* Максимальное количество использований */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.promo_codes.create_dialog.max_uses")}
              </label>
              <Input
                {...register("maxUses", {
                  setValueAs: (value) => {
                    if (value === "" || value === null || value === undefined) {
                      return null;
                    }
                    const num = Number(value);
                    return isNaN(num) ? null : num;
                  },
                })}
                type="number"
                min={1}
                placeholder={t(
                  "admin.promo_codes.create_dialog.max_uses_placeholder"
                )}
                error={errors.maxUses?.message}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("admin.promo_codes.create_dialog.max_uses_hint")}
              </p>
            </div>

            {/* Минимальная сумма заказа */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.promo_codes.create_dialog.min_order_amount")} (₽)
              </label>
              <Input
                {...register("minOrderAmount", { valueAsNumber: true })}
                type="number"
                min={0}
                placeholder="0"
                error={errors.minOrderAmount?.message}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("admin.promo_codes.create_dialog.min_order_amount_hint")}
              </p>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-4">
              <AppButton
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={createPromoCodeMutation.isPending}
                className="flex-1"
              >
                {t("common.cancel")}
              </AppButton>
              <AppButton
                type="submit"
                variant="primary"
                disabled={!isValid || createPromoCodeMutation.isPending}
                className="flex-1"
              >
                {createPromoCodeMutation.isPending
                  ? t("admin.promo_codes.create_dialog.creating")
                  : t("admin.promo_codes.create_dialog.create")}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
