import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNotifications } from "~/hooks/useNotifications";
import {
  getAdminPromoCodes,
  createPromoCode,
  deletePromoCode,
  type CreatePromoCodeData,
} from "~/api/admin/promoCode";

/**
 * Хук для получения списка всех промокодов (админ)
 */
export const useAdminPromoCodes = () => {
  return useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: getAdminPromoCodes,
    retry: (failureCount, error) => {
      // Не повторяем запрос при 401 (Unauthorized) или 403 (Forbidden)
      if (error && "status" in error && (error.status === 401 || error.status === 403)) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Хук для создания промокода (админ)
 */
export const useCreatePromoCode = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPromoCode,
    onSuccess: (response) => {
      // Показываем уведомление об успехе
      showSuccess(
        response.message || 
        t("admin.promo_codes.notifications.created_success")
      );

      // Обновляем кэш
      queryClient.invalidateQueries({
        queryKey: ["admin-promo-codes"],
      });
    },
    onError: (err: any) => {
      // Показываем уведомление об ошибке
      const errorMessage = 
        err?.response?.data?.message ||
        t("admin.promo_codes.notifications.create_error");
      
      showError(errorMessage);
    },
  });
};

/**
 * Хук для удаления промокода (админ)
 */
export const useDeletePromoCode = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePromoCode,
    onSuccess: (response) => {
      // Показываем уведомление об успехе
      showSuccess(
        response.message || 
        t("admin.promo_codes.notifications.deleted_success")
      );

      // Обновляем кэш
      queryClient.invalidateQueries({
        queryKey: ["admin-promo-codes"],
      });
    },
    onError: (err: any) => {
      // Показываем уведомление об ошибке
      const errorMessage = 
        err?.response?.data?.message ||
        t("admin.promo_codes.notifications.delete_error");
      
      showError(errorMessage);
    },
  });
}; 