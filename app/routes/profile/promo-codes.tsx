import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import { Input } from "~/shared/inputs/Input";
import { useActivatePromoCode, useUserPromoCodes } from "~/queries/promoCode";

// Схема валидации для формы промокода
const promoCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Промокод должен содержать минимум 3 символа")
    .max(20, "Промокод не должен превышать 20 символов")
    .regex(/^[A-Z0-9]+$/, "Промокод может содержать только заглавные буквы и цифры"),
});

type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

const PromoCodes: React.FC = () => {
  const { t } = useTranslation();

  // Хуки для работы с промокодами
  const { data: promoCodes = [], isLoading: isLoadingCodes } = useUserPromoCodes();
  const activatePromoCodeMutation = useActivatePromoCode();

  // Форма для активации промокода
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    mode: "onChange",
  });

  // Обработчик активации промокода
  const onSubmit = async (data: PromoCodeFormData) => {
    try {
      await activatePromoCodeMutation.mutateAsync({
        code: data.code.toUpperCase(),
      });
      reset(); // Очищаем форму после успешной активации
    } catch (error) {
      // Ошибка обрабатывается в хуке
    }
  };

  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Заголовок */}
      <h2 className="text-2xl font-bold text-black">{t("profile.promo_codes.title")}</h2>

      {/* Форма активации промокода */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-black mb-4">{t("profile.promo_codes.activate")}</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                {...register("code")}
                placeholder={t("profile.promo_codes.enter_code")}
                error={errors.code?.message}
                className="uppercase text-sm sm:text-base !px-4 sm:px-7.5"
                autoComplete="off"
              />
            </div>
            <AppButton
              type="submit"
              variant="secondary"
              size="md"
              disabled={!isValid || activatePromoCodeMutation.isPending}
              className="!w-auto px-8 flex items-center justify-center gap-2 h-fit "
            >
              {activatePromoCodeMutation.isPending ? (
                t("common.loading")
              ) : (
                <>
                  {t("profile.promo_codes.apply")}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              )}
            </AppButton>
          </div>
        </form>
      </div>

      {/* Таблица активированных промокодов */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-black">{t("profile.promo_codes.title")}</h3>
        </div>

        {isLoadingCodes ? (
          <div className="p-6 text-center">
            <div className="text-gray-500">{t("common.loading")}</div>
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-500 mb-2">{t("profile.promo_codes.no_codes")}</div>
            <div className="text-sm text-gray-400">{t("profile.promo_codes.no_codes_desc")}</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("profile.promo_codes.table.code")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("profile.promo_codes.table.discount")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("profile.promo_codes.table.description")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("profile.promo_codes.table.used_at")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("profile.promo_codes.table.status")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promoCodes.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">{promo.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{promo.discount}%</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{promo.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(promo.usedAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t("profile.promo_codes.used")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Информационный блок */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {t("profile.promo_codes.info_title")}
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>{t("profile.promo_codes.info_desc")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoCodes;
