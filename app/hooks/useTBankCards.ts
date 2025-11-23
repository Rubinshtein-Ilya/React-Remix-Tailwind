import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNotifications } from "~/hooks/useNotifications";
import {
  initiateCardAttachment,
  getTBankCards,
  removeTBankCard,
  syncTBankCards,
} from "~/api/tbank";
import {
  attachCardWithHold,
  checkHoldStatus,
} from "~/api/user";

/**
 * Хук для получения списка привязанных карт
 */
export const useTBankCards = () => {
  return useQuery({
    queryKey: ["tbank-cards"],
    queryFn: async () => {
      const response = await getTBankCards();
      return response.data.cards;
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
 * Хук для инициации привязки карты
 */
export const useAttachCard = () => {
  const notifications = useNotifications();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: initiateCardAttachment,
    onError: (error: any) => {
      console.error("Attach card failed:", error);
      const errorMessage = error?.response?.data?.message || error?.message;
      notifications.showError(
        errorMessage || "",
        t(
          "notifications.error.card_attachment_failed",
          "Не удалось инициировать привязку карты"
        )
      );
    },
  });
};

/**
 * Хук для инициации привязки карты через холд на 11 рублей
 */
export const useAttachCardWithHold = () => {
  const notifications = useNotifications();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: attachCardWithHold,
    onError: (error: any) => {
      console.error("Attach card with hold failed:", error);
      const errorMessage = error?.response?.data?.message || error?.message;
      notifications.showError(
        errorMessage || "",
        t(
          "notifications.error.card_attachment_failed",
          "Не удалось инициировать привязку карты"
        )
      );
    },
  });
};

/**
 * Хук для проверки статуса холда и его отмены
 */
export const useCheckHoldStatus = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: checkHoldStatus,
    onSuccess: (response) => {
      if (response.data.cardAttached) {
        // Инвалидируем кеш карт для обновления списка
        queryClient.invalidateQueries({ queryKey: ["tbank-cards"] });
        // Также обновляем данные пользователя
        queryClient.invalidateQueries({ queryKey: ["user"] });

        notifications.showSuccess(
          response.data.message || "Карта успешно привязана!",
          t("notifications.success.card_attached", "Карта привязана")
        );
      }
    },
    onError: (error: any) => {
      console.error("Check hold status failed:", error);
      const errorMessage = error?.response?.data?.message || error?.message;
      notifications.showError(
        errorMessage || "",
        t(
          "notifications.error.hold_check_failed",
          "Не удалось проверить статус привязки"
        )
      );
    },
  });
};

/**
 * Хук для удаления карты
 */
export const useRemoveCard = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: removeTBankCard,
    onSuccess: (response) => {
      // Инвалидируем кеш карт для обновления списка
      queryClient.invalidateQueries({ queryKey: ["tbank-cards"] });
      // Также обновляем данные пользователя
      queryClient.invalidateQueries({ queryKey: ["user"] });

      notifications.showSuccess(
        response.message,
        t("notifications.success.card_removed", "Карта успешно удалена")
      );
    },
    onError: (error: any) => {
      console.error("Remove card failed:", error);
      const errorMessage = error?.response?.data?.message || error?.message;
      notifications.showError(
        errorMessage || "",
        t("notifications.error.card_removal_failed", "Не удалось удалить карту")
      );
    },
  });
};

/**
 * Хук для синхронизации карт с Т-Банком
 */
export const useSyncCards = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: syncTBankCards,
    onSuccess: (response) => {
      // Инвалидируем кеш карт для обновления списка
      queryClient.invalidateQueries({ queryKey: ["tbank-cards"] });
      // Также обновляем данные пользователя
      queryClient.invalidateQueries({ queryKey: ["user"] });

      notifications.showSuccess(
        response.message,
        t("notifications.success.cards_synced", "Карты синхронизированы")
      );
    },
    onError: (error: any) => {
      console.error("Sync cards failed:", error);
      const errorMessage = error?.response?.data?.message || error?.message;
      notifications.showError(
        errorMessage || "",
        t(
          "notifications.error.cards_sync_failed",
          "Не удалось синхронизировать карты"
        )
      );
    },
  });
};
