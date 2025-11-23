import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNotifications } from "~/hooks/useNotifications";
import {
  activatePromoCode,
  getUserPromoCodes,
  validatePromoCode,
  type ActivatePromoCodeData,
  type ValidatePromoCodeData,
} from "~/api/promoCode";

/**
 * Хук для получения списка промокодов пользователя
 */
export const useUserPromoCodes = () => {
  return useQuery({
    queryKey: ["user-promo-codes"],
    queryFn: async () => {
      const response = await getUserPromoCodes();
      return response.data;
    },
    retry: (failureCount, error) => {
      // Не повторяем запрос при 401 (Unauthorized)
      if (error && "status" in error && error.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Хук для активации промокода
 */
export const useActivatePromoCode = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: ActivatePromoCodeData) => activatePromoCode(data),
    onSuccess: (response) => {
      // Инвалидируем кеш промокодов для обновления списка
      queryClient.invalidateQueries({ queryKey: ["user-promo-codes"] });
      
      // Показываем сообщение об успехе
      notifications.showSuccess(
        response.message || t("profile.promo_codes.activated_success", "Промокод активирован успешно!")
      );
    },
    onError: (error: any) => {
      console.error("Activate promo code failed:", error);
      const errorMessage = error?.response?.data?.message || error?.message;
      
      // Показываем сообщение об ошибке
      notifications.showError(
        errorMessage || t("profile.promo_codes.not_found", "Промокод не найден")
      );
    },
  });
};

/**
 * Хук для валидации промокода без активации
 */
export const useValidatePromoCode = () => {
  const notifications = useNotifications();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: ValidatePromoCodeData) => validatePromoCode(data),
    onError: (error: any) => {
      console.error("Validate promo code failed:", error);
      const errorMessage = error?.response?.data?.message || error?.message;
      
      // Показываем сообщение об ошибке
      notifications.showError(
        errorMessage || t("profile.promo_codes.not_found", "Промокод не найден")
      );
    },
  });
}; 