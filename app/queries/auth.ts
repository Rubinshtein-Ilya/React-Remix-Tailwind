import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logout } from "~/api/auth";
import {
  updatePersonalInfo,
  type UpdatePersonalInfoData,
  changePassword,
  type ChangePasswordData,
  updateAddress,
  type UpdateAddressData,
} from "~/api/user";
import { useNavigate } from "react-router";
import { api } from "~/api/axios";
import { useNotifications } from "~/hooks/useNotifications";
import {
  generate2FASecret,
  enable2FA,
  disable2FA,
  regenerateBackupCodes,
  type TwoFactorSetupResponse,
} from "~/api/twoFactor";
import { useTranslation } from "react-i18next";
import { notificationKeys } from "./notifications";
import { useEffect } from "react";

// Объединенный хук для авторизации, проверки сессии и управления пользователем
export const useAuth = (options?: {
  sessionCheckInterval?: number;
  onSessionExpired?: () => void;
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const { sessionCheckInterval = 5 * 60 * 1000, onSessionExpired } =
    options || {};

  // Основной запрос пользователя
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    refetchInterval: sessionCheckInterval,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      // Не повторяем запрос при 401 (Unauthorized)
      if (error && "status" in error && error.status === 401) {
        onSessionExpired?.();
        return false;
      }
      return failureCount < 3;
    },
    meta: {
      onError: () => {
        onSessionExpired?.();
      },
    },
  });

  // Мутация для обновления личной информации
  const updatePersonalInfoMutation = useMutation({
    mutationFn: (data: UpdatePersonalInfoData) => updatePersonalInfo(data),
    onSuccess: (response) => {
      // Автоматически обновляем данные пользователя после успешного обновления
      queryClient.invalidateQueries({ queryKey: ["user"] });
      notifications.showSuccess(
        response.message,
        "notifications.success.personal_info_updated"
      );
    },
    onError: (error: any) => {
      console.error("Update personal info failed:", error);
      const errorMessage = error?.response?.data?.message;
      notifications.showError(
        errorMessage || "",
        "notifications.error.personal_info_update_failed"
      );
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordData) => changePassword(data),
    onSuccess: (response) => {
      notifications.showSuccess(
        response.message,
        "notifications.success.password_changed"
      );
    },
    onError: (error: any) => {
      console.error("Change password failed:", error);
      const errorMessage = error?.response?.data?.message;
      notifications.showError(
        errorMessage || "",
        "notifications.error.password_change_failed"
      );
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: (data: UpdateAddressData) => updateAddress(data),
    onSuccess: (response) => {
      // Автоматически обновляем данные пользователя после успешного обновления
      queryClient.invalidateQueries({ queryKey: ["user"] });
      notifications.showSuccess(
        response.message,
        "notifications.success.address_updated"
      );
    },
    onError: (error: any) => {
      console.error("Update address failed:", error);
      const errorMessage = error?.response?.data?.message;
      notifications.showError(
        errorMessage || "",
        "notifications.error.address_update_failed"
      );
    },
  });

  const handleLogout = async () => {
    await logout();
    await userQuery.refetch();
    navigate("/");
  };

  return {
    user: userQuery.data ?? null,
    loading: userQuery.isLoading,
    error: userQuery.error,
    refetch: userQuery.refetch,
    logout: handleLogout,
    updatePersonalInfo: updatePersonalInfoMutation,
    changePassword: changePasswordMutation,
    updateAddress: updateAddressMutation,
  };
};

// Оставляем для обратной совместимости
export const useUser = () => {
  const auth = useAuth();
  const notifications = useNotifications();
  const { t } = useTranslation();

  const handleLogoutWithNotification = async () => {
    await auth.logout();
    notifications.showSuccess(
      t("auth.logout_success", "Вы успешно вышли из системы")
    );
  };

  return {
    user: auth.user,
    loading: auth.loading,
    refetch: auth.refetch,
    logout: handleLogoutWithNotification,
  };
};

// Общая функция для создания 2FA мутаций с общими настройками
const create2FAMutation = <T, K>(
  mutationFn: (data: T) => Promise<K>,
  options: {
    successMessage?: string;
    successKey?: string;
    errorMessage?: string;
    errorKey?: string;
    invalidateUser?: boolean;
  } = {}
) => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const { t } = useTranslation();

  const {
    successMessage,
    successKey,
    errorMessage,
    errorKey,
    invalidateUser = true,
  } = options;

  return useMutation<K, Error, T>({
    mutationFn,
    onSuccess: (response: K) => {
      if (invalidateUser) {
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
      const message =
        (response as any)?.message ||
        (successKey ? t(successKey, successMessage || "") : successMessage);
      if (message) {
        notifications.showSuccess(message);
      }
    },
    onError: (error: any) => {
      console.error(`2FA operation failed:`, error);
      const serverErrorMessage = error?.response?.data?.message;
      const fallbackMessage = errorKey
        ? t(errorKey, errorMessage || "")
        : errorMessage || t("errors.server_error", "Ошибка сервера");
      notifications.showError(serverErrorMessage || fallbackMessage);
    },
  });
};

// Хук для работы с 2FA
export const useTwoFactor = () => {
  return {
    generateSecret: create2FAMutation<undefined, TwoFactorSetupResponse>(
      generate2FASecret,
      {
        errorKey: "errors.server_error",
        errorMessage: "Ошибка сервера",
        invalidateUser: false,
      }
    ),
    enable: create2FAMutation(enable2FA, {
      successKey: "auth.2fa_enabled_success",
      successMessage: "2FA успешно включен",
      errorKey: "auth.invalid_verification_code",
      errorMessage: "Неверный код подтверждения",
    }),
    disable: create2FAMutation(disable2FA, {
      successKey: "auth.2fa_disabled_success",
      successMessage: "2FA успешно отключен",
      errorKey: "auth.invalid_two_factor_code",
      errorMessage: "Неверный код двухфакторной аутентификации",
    }),
    regenerateCodes: create2FAMutation(regenerateBackupCodes, {
      successKey: "auth.backup_codes_regenerated",
      successMessage: "Резервные коды успешно обновлены",
      errorKey: "auth.invalid_two_factor_code",
      errorMessage: "Неверный код двухфакторной аутентификации",
    }),
  };
};
