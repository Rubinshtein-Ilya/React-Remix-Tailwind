import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  generateAuthCodes, 
  verifyAuthenticity,
  getExistingAuthCodes,
  type AuthenticationFormData,
  type VerifyAuthenticityParams 
} from "~/api/authentication";
import { useNotifications } from "~/hooks/useNotifications";
import { useTranslation } from "react-i18next";

// Хук для получения существующих кодов аутентификации
export const useGetExistingAuthCodes = (itemId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["existing-auth-codes", itemId],
    queryFn: () => getExistingAuthCodes(itemId),
    enabled: enabled && !!itemId,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

// Хук для генерации кодов аутентификации
export const useGenerateAuthCodes = () => {
  const notifications = useNotifications();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateAuthCodes,
    onSuccess: (data) => {
      notifications.showSuccess(
        t("admin.authentication.codes_generated_success", "Коды аутентификации успешно созданы")
      );
      // Инвалидируем кеш существующих кодов для этого itemId
      queryClient.invalidateQueries({
        queryKey: ["existing-auth-codes"]
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message;
      notifications.showError(t(message, "Ошибка при генерации кодов"));
    },
  });
};

// Хук для проверки подлинности
export const useVerifyAuthenticity = (params: VerifyAuthenticityParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["verify-authenticity", params],
    queryFn: () => verifyAuthenticity(params),
    enabled: enabled && (!!params.serial || !!params.t), // Включаем только если есть необходимые параметры
    retry: false, // Не повторяем запрос при ошибке
    refetchOnWindowFocus: false, // Не перезапрашиваем при фокусе окна
  });
};

// Хук для ручной проверки подлинности (через mutation)
export const useVerifyAuthenticityMutation = () => {
  const notifications = useNotifications();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: verifyAuthenticity,
    onError: (error: any) => {
      console.error('Error verifying authenticity:', error);
      
      const errorMessage = error?.message;
      if (errorMessage) {
        const translatedMessage = t(errorMessage) || errorMessage;
        notifications.showError(translatedMessage);
      } else {
        notifications.showError(t("verification_error", "Ошибка при проверке подлинности"));
      }
    }
  });
}; 