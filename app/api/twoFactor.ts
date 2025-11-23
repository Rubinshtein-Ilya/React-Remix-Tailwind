import { api } from "./axios";
import type { BackupCode } from "~/types/user";

export interface TwoFactorSetupResponse {
  success: boolean;
  qrCode?: string;
  manualEntryKey?: string;
  message?: string;
}

export interface TwoFactorEnableResponse {
  success: boolean;
  backupCodes?: BackupCode[];
  message?: string;
}

export interface TwoFactorDisableResponse {
  success: boolean;
  message?: string;
}

export interface TwoFactorRegenerateCodesResponse {
  success: boolean;
  backupCodes?: BackupCode[];
  message?: string;
}

// Генерация QR кода для настройки 2FA
export const generate2FASecret = async (): Promise<TwoFactorSetupResponse> => {
  const response = await api.post("/api/auth/2fa/generate");
  return response.data;
};

// Включение 2FA после проверки кода
export const enable2FA = async (
  verificationCode: string
): Promise<TwoFactorEnableResponse> => {
  const response = await api.post("/api/auth/2fa/enable", {
    verificationCode,
  });
  return response.data;
};

// Отключение 2FA
export const disable2FA = async (
  code: string
): Promise<TwoFactorDisableResponse> => {
  const response = await api.post("/api/auth/2fa/disable", {
    code,
  });
  return response.data;
};

// Регенерация backup кодов
export const regenerateBackupCodes = async (
  code: string
): Promise<TwoFactorRegenerateCodesResponse> => {
  const response = await api.post("/api/auth/2fa/regenerate-backup-codes", {
    code,
  });
  return response.data;
};
