import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Input } from "~/shared/inputs/Input";
import { AppButton } from "~/shared/buttons/AppButton";
import type { BackupCode } from "~/types/user";
import { useAuth, useTwoFactor } from "~/queries/auth";

interface EditContactInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }) => void;
  isLoading?: boolean;
}

type ViewMode =
  | "main"
  | "change-password"
  | "setup-2fa"
  | "disable-2fa"
  | "regenerate-backup"
  | "backup-codes";

export const EditContactInfoDialog: React.FC<EditContactInfoDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const twoFactor = useTwoFactor();

  const [showTooltip, setShowTooltip] = useState<"email" | "phone" | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>("main");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [manualEntryKey, setManualEntryKey] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Схема валидации для изменения пароля
  const passwordSchema = useMemo(
    () =>
      z
        .object({
          oldPassword: z
            .string()
            .optional()
            .refine((val) => !val || val.length >= 1, {
              message: t(
                "errors.old_password_required",
                "Введите текущий пароль"
              ),
            }),
          newPassword: z
            .string()
            .optional()
            .refine((val) => !val || val.length >= 8, {
              message: t(
                "login_modal.validation.password_min_length",
                "Пароль должен содержать минимум 8 символов"
              ),
            })
            .refine(
              (password) => {
                if (!password) return true;
                const hasLowercase = /\p{Ll}/u.test(password);
                const hasUppercase = /\p{Lu}/u.test(password);
                const hasDigits = /\d/.test(password);
                return hasLowercase && hasUppercase && hasDigits;
              },
              {
                message: t("login_modal.validation.password_complexity"),
              }
            ),
          confirmPassword: z.string().optional(),
        })
        .refine(
          (data) => {
            const hasOldPassword =
              data.oldPassword && data.oldPassword.length > 0;
            const hasNewPassword =
              data.newPassword && data.newPassword.length > 0;
            const hasConfirmPassword =
              data.confirmPassword && data.confirmPassword.length > 0;

            if (hasOldPassword || hasNewPassword || hasConfirmPassword) {
              return hasOldPassword && hasNewPassword && hasConfirmPassword;
            }
            return true;
          },
          {
            message: t(
              "errors.all_password_fields_required",
              "Для изменения пароля заполните все поля"
            ),
            path: ["root"],
          }
        )
        .refine(
          (data) => {
            if (data.newPassword && data.confirmPassword) {
              return data.newPassword === data.confirmPassword;
            }
            return true;
          },
          {
            message: t(
              "login_modal.validation.passwords_mismatch",
              "Пароли не совпадают"
            ),
            path: ["confirmPassword"],
          }
        ),
    [t]
  );

  // Схема валидации для 2FA кода
  const twoFactorSchema = useMemo(
    () =>
      z.object({
        verificationCode: z
          .string()
          .length(
            6,
            t(
              "profile.two_factor_auth.verification_code_error",
              "Код должен содержать 6 цифр"
            )
          )
          .regex(
            /^\d{6}$/,
            t(
              "profile.two_factor_auth.verification_code_error",
              "Код должен содержать 6 цифр"
            )
          ),
      }),
    [t]
  );

  type PasswordFormData = z.infer<typeof passwordSchema>;
  type TwoFactorFormData = z.infer<typeof twoFactorSchema>;

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const twoFactorForm = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    mode: "onChange",
    defaultValues: {
      verificationCode: "",
    },
  });

  // Следим за изменениями полей для проверки валидности
  const watchedPasswordFields = passwordForm.watch();
  const hasPasswordFields = useMemo(() => {
    return (
      (watchedPasswordFields.oldPassword &&
        watchedPasswordFields.oldPassword.length > 0) ||
      (watchedPasswordFields.newPassword &&
        watchedPasswordFields.newPassword.length > 0) ||
      (watchedPasswordFields.confirmPassword &&
        watchedPasswordFields.confirmPassword.length > 0)
    );
  }, [watchedPasswordFields]);

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
  }, [isOpen]);

  // Генерация секрета для 2FA
  const handleGenerate2FASecret = async () => {
    try {
      const result = await twoFactor.generateSecret.mutateAsync(undefined);
      if (result.success) {
        setQrCode(result.qrCode || null);
        setManualEntryKey(result.manualEntryKey || null);
        setViewMode("setup-2fa");
      }
    } catch (error) {
      // Ошибка обрабатывается в хуке useTwoFactor
    }
  };

  // Включение 2FA
  const handleEnable2FA = async (verificationCode: string) => {
    try {
      const result = await twoFactor.enable.mutateAsync(verificationCode);
      if (result.success) {
        setBackupCodes(result.backupCodes || []);
        setViewMode("backup-codes");
      }
    } catch (error: any) {
      // Отображаем ошибку в форме
      twoFactorForm.setError("verificationCode", {
        message: error?.response?.data?.message || "Неверный код",
      });
    }
  };

  // Отключение 2FA
  const handleDisable2FA = async (code: string) => {
    try {
      const result = await twoFactor.disable.mutateAsync(code);
      if (result.success) {
        setViewMode("main");
      }
    } catch (error: any) {
      // Отображаем ошибку в форме
      twoFactorForm.setError("verificationCode", {
        message: error?.response?.data?.message || "Неверный код",
      });
    }
  };

  // Регенерация backup кодов
  const handleRegenerateBackupCodes = async (code: string) => {
    try {
      const result = await twoFactor.regenerateCodes.mutateAsync(code);
      if (result.success) {
        setBackupCodes(result.backupCodes || []);
        setViewMode("backup-codes");
      }
    } catch (error: any) {
      // Отображаем ошибку в форме
      twoFactorForm.setError("verificationCode", {
        message: error?.response?.data?.message || "Неверный код",
      });
    }
  };

  const handleSavePassword = async (data: PasswordFormData) => {
    const updateData: {
      oldPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (data.oldPassword && data.oldPassword.length > 0) {
      updateData.oldPassword = data.oldPassword;
    }
    if (data.newPassword && data.newPassword.length > 0) {
      updateData.newPassword = data.newPassword;
    }
    if (data.confirmPassword && data.confirmPassword.length > 0) {
      updateData.confirmPassword = data.confirmPassword;
    }

    onSave(updateData);
  };

  const handleClose = () => {
    passwordForm.reset();
    twoFactorForm.reset();
    setShowTooltip(null);
    setViewMode("main");
    setQrCode(null);
    setManualEntryKey(null);
    setBackupCodes([]);
    setShowManualEntry(false);
    onClose();
  };

  const InfoIcon = () => (
    <svg
      className="w-4 h-4 text-gray-400 cursor-help ml-1"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const downloadBackupCodes = () => {
    const codesText = backupCodes.map((code) => code.code).join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printBackupCodes = () => {
    const codesText = backupCodes.map((code) => code.code).join("\n");
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Резервные коды 2FA</title></head>
          <body>
            <h2>Резервные коды двухфакторной аутентификации</h2>
            <p>Сохраните эти коды в безопасном месте:</p>
            <pre>${codesText}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Проверяем есть ли данные пользователя
  if (!user) {
    return null;
  }

  if (!isOpen) return null;

  // Определяем загружается ли какая-либо операция 2FA
  const isApiLoading =
    twoFactor.generateSecret.isPending ||
    twoFactor.enable.isPending ||
    twoFactor.disable.isPending ||
    twoFactor.regenerateCodes.isPending;

  const renderMainView = () => (
    <div className="flex flex-col gap-4">
      {/* Read-only поля */}
      <div className="space-y-4 mb-4">
        {/* Email - read-only */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            {t("profile.edit_contact_info.email", "Email")}
            <div className="relative">
              <div
                onMouseEnter={() => setShowTooltip("email")}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <InfoIcon />
              </div>
              {showTooltip === "email" && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg whitespace-nowrap z-20">
                  {t(
                    "profile.edit_contact_info.email_tooltip",
                    "Для изменения обратитесь в поддержку"
                  )}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              )}
            </div>
          </label>
          <Input value={user?.email || ""} readOnly disabled />
        </div>

        {/* Телефон - read-only */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            {t("profile.edit_contact_info.phone", "Телефон")}
            <div className="relative">
              <div
                onMouseEnter={() => setShowTooltip("phone")}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <InfoIcon />
              </div>
              {showTooltip === "phone" && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg whitespace-nowrap z-20">
                  {t(
                    "profile.edit_contact_info.phone_tooltip",
                    "Для изменения обратитесь в поддержку"
                  )}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              )}
            </div>
          </label>
          <Input
            value={
              user?.phone || t("profile.details.not_specified", "Не указано")
            }
            readOnly
            disabled
          />
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="space-y-3">
        <AppButton
          type="button"
          onClick={() => setViewMode("change-password")}
          variant="secondary"
        >
          {t("profile.edit_contact_info.change_password", "Изменить пароль")}
        </AppButton>

        {/* 2FA секция */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {t(
              "profile.two_factor_auth.title",
              "Двухфакторная аутентификация (2FA)"
            )}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {t(
              "profile.two_factor_auth.description",
              "2FA требует дополнительный код с вашего телефона при входе в аккаунт. Это защищает ваш аккаунт, даже если кто-то узнает ваш пароль."
            )}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Статус:</span>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  user.twoFactorAuth?.isEnabled
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {user.twoFactorAuth?.isEnabled
                  ? t("profile.two_factor_auth.status_enabled", "Включена")
                  : t("profile.two_factor_auth.status_disabled", "Отключена")}
              </span>
            </div>
          </div>

          {!user.twoFactorAuth?.isEnabled ? (
            <AppButton
              type="button"
              onClick={handleGenerate2FASecret}
              variant="secondary"
              isLoading={isApiLoading}
            >
              {t("profile.two_factor_auth.enable_button", "Включить 2FA")}
            </AppButton>
          ) : (
            <div className="space-y-2">
              <AppButton
                type="button"
                onClick={() => setViewMode("disable-2fa")}
                variant="ghost"
              >
                {t("profile.two_factor_auth.disable_button", "Отключить 2FA")}
              </AppButton>
              <AppButton
                type="button"
                onClick={() => setViewMode("regenerate-backup")}
                variant="ghost"
              >
                {t(
                  "profile.two_factor_auth.backup_codes_regenerate",
                  "Сгенерировать новые резервные коды"
                )}
              </AppButton>
            </div>
          )}
        </div>
      </div>

      <AppButton type="button" onClick={handleClose} variant="ghost">
        {t("common.cancel", "Отмена")}
      </AppButton>
    </div>
  );

  const renderChangePasswordView = () => (
    <form
      onSubmit={passwordForm.handleSubmit(handleSavePassword)}
      className="flex flex-col gap-4"
    >
      <div className="space-y-4">
        <Controller
          name="oldPassword"
          control={passwordForm.control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="password"
              label={t(
                "profile.edit_contact_info.old_password",
                "Текущий пароль"
              )}
              placeholder={t(
                "profile.edit_contact_info.old_password_placeholder",
                "Введите текущий пароль"
              )}
              error={fieldState.error?.message}
              disabled={isLoading}
            />
          )}
        />

        <Controller
          name="newPassword"
          control={passwordForm.control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="password"
              label={t(
                "profile.edit_contact_info.new_password",
                "Новый пароль"
              )}
              placeholder={t(
                "profile.edit_contact_info.new_password_placeholder",
                "Введите новый пароль"
              )}
              error={fieldState.error?.message}
              disabled={isLoading}
              showPasswordStrength={true}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={passwordForm.control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="password"
              label={t(
                "profile.edit_contact_info.confirm_password",
                "Повторите новый пароль"
              )}
              placeholder={t(
                "profile.edit_contact_info.confirm_password_placeholder",
                "Повторите новый пароль"
              )}
              error={fieldState.error?.message}
              disabled={isLoading}
            />
          )}
        />
      </div>

      {passwordForm.formState.errors.root && (
        <p className="text-red-500 text-sm text-center">
          {passwordForm.formState.errors.root.message}
        </p>
      )}

      <AppButton
        type="submit"
        disabled={
          !hasPasswordFields || !passwordForm.formState.isValid || isLoading
        }
        variant="secondary"
        isLoading={isLoading}
      >
        {t("profile.edit_contact_info.save", "Сохранить")}
      </AppButton>

      <AppButton
        type="button"
        onClick={() => setViewMode("main")}
        disabled={isLoading}
        variant="ghost"
      >
        {t("common.cancel", "Отмена")}
      </AppButton>
    </form>
  );

  const renderSetup2FAView = () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {t(
          "profile.two_factor_auth.setup_title",
          "Настройка двухфакторной аутентификации"
        )}
      </h3>

      {/* Шаг 1 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-800 mb-2">
          {t(
            "profile.two_factor_auth.setup_step1",
            "Шаг 1: Скачайте приложение-аутентификатор"
          )}
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          {t(
            "profile.two_factor_auth.setup_step1_description",
            "Установите на ваш телефон одно из приложений:"
          )}
        </p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>
            •{" "}
            {t(
              "profile.two_factor_auth.setup_apps.google_auth",
              "Google Authenticator"
            )}
          </li>
          <li>• {t("profile.two_factor_auth.setup_apps.authy", "Authy")}</li>
          <li>
            •{" "}
            {t(
              "profile.two_factor_auth.setup_apps.microsoft_auth",
              "Microsoft Authenticator"
            )}
          </li>
        </ul>
      </div>

      {/* Шаг 2 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-800 mb-2">
          {t("profile.two_factor_auth.setup_step2", "Шаг 2: Сканируйте QR код")}
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          {t(
            "profile.two_factor_auth.setup_step2_description",
            "Откройте приложение и отсканируйте этот QR код:"
          )}
        </p>

        {qrCode && (
          <div className="flex flex-col items-center space-y-3">
            <img src={qrCode} alt="QR Code" className="border rounded-lg" />

            <AppButton
              type="button"
              onClick={() => setShowManualEntry(!showManualEntry)}
              variant="ghost"
              size="sm"
            >
              {t("profile.two_factor_auth.manual_entry", "Ввести код вручную")}
            </AppButton>

            {showManualEntry && manualEntryKey && (
              <div className="w-full bg-white border rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">
                  {t(
                    "profile.two_factor_auth.manual_entry_description",
                    "Если не можете отсканировать QR код, введите этот ключ вручную:"
                  )}
                </p>
                <code className="block bg-gray-100 p-2 rounded text-sm font-mono break-all">
                  {manualEntryKey}
                </code>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Шаг 3 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-800 mb-2">
          {t(
            "profile.two_factor_auth.setup_step3",
            "Шаг 3: Введите код подтверждения"
          )}
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          {t(
            "profile.two_factor_auth.setup_step3_description",
            "Введите 6-значный код из вашего приложения:"
          )}
        </p>

        <form
          onSubmit={twoFactorForm.handleSubmit((data) =>
            handleEnable2FA(data.verificationCode)
          )}
        >
          <Controller
            name="verificationCode"
            control={twoFactorForm.control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                type="text"
                label={t(
                  "profile.two_factor_auth.verification_code",
                  "Код подтверждения"
                )}
                placeholder={t(
                  "profile.two_factor_auth.verification_code_placeholder",
                  "000000"
                )}
                error={fieldState.error?.message}
                disabled={isApiLoading}
                maxLength={6}
              />
            )}
          />

          <div className="flex gap-2 mt-4">
            <AppButton
              type="submit"
              disabled={!twoFactorForm.formState.isValid || isApiLoading}
              variant="secondary"
              isLoading={isApiLoading}
            >
              {t("profile.two_factor_auth.confirm", "Подтвердить")}
            </AppButton>

            <AppButton
              type="button"
              onClick={() => setViewMode("main")}
              disabled={isApiLoading}
              variant="ghost"
            >
              {t("common.cancel", "Отмена")}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );

  const renderBackupCodesView = () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {t("profile.two_factor_auth.backup_codes_title", "Резервные коды")}
      </h3>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800 mb-3">
          {t(
            "profile.two_factor_auth.backup_codes_description",
            "Сохраните эти коды в безопасном месте. Вы можете использовать любой из них вместо кода из приложения:"
          )}
        </p>
        <p className="text-sm text-yellow-700 font-medium">
          {t(
            "profile.two_factor_auth.backup_codes_warning",
            "Каждый код можно использовать только один раз"
          )}
        </p>
      </div>

      <div className="bg-gray-50 border rounded-lg p-4">
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, index) => (
            <code
              key={index}
              className="block bg-white p-2 rounded border font-mono text-sm"
            >
              {code.code}
            </code>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <AppButton
          type="button"
          onClick={downloadBackupCodes}
          variant="secondary"
        >
          {t("profile.two_factor_auth.backup_codes_download", "Скачать коды")}
        </AppButton>

        <AppButton type="button" onClick={printBackupCodes} variant="ghost">
          {t("profile.two_factor_auth.backup_codes_print", "Распечатать коды")}
        </AppButton>
      </div>

      <AppButton type="button" onClick={handleClose} variant="secondary">
        {t("profile.two_factor_auth.close", "Закрыть")}
      </AppButton>
    </div>
  );

  const renderDisable2FAView = () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {t(
          "profile.two_factor_auth.disable_title",
          "Отключить двухфакторную аутентификацию"
        )}
      </h3>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">
          {t(
            "profile.two_factor_auth.disable_warning",
            "Внимание: отключение 2FA снизит безопасность вашего аккаунта"
          )}
        </p>
      </div>

      <p className="text-sm text-gray-600">
        {t(
          "profile.two_factor_auth.disable_description",
          "Введите код из вашего приложения-аутентификатора для отключения 2FA:"
        )}
      </p>

      <form
        onSubmit={twoFactorForm.handleSubmit((data) =>
          handleDisable2FA(data.verificationCode)
        )}
      >
        <Controller
          name="verificationCode"
          control={twoFactorForm.control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="text"
              label={t(
                "profile.two_factor_auth.verification_code",
                "Код подтверждения"
              )}
              placeholder={t(
                "profile.two_factor_auth.verification_code_placeholder",
                "000000"
              )}
              error={fieldState.error?.message}
              disabled={isApiLoading}
              maxLength={6}
            />
          )}
        />

        <div className="flex gap-2 mt-4">
          <AppButton
            type="submit"
            disabled={!twoFactorForm.formState.isValid || isApiLoading}
            variant="secondary"
            isLoading={isApiLoading}
          >
            {t("profile.two_factor_auth.confirm", "Подтвердить")}
          </AppButton>

          <AppButton
            type="button"
            onClick={() => setViewMode("main")}
            disabled={isApiLoading}
            variant="ghost"
          >
            {t("common.cancel", "Отмена")}
          </AppButton>
        </div>
      </form>
    </div>
  );

  const renderRegenerateBackupView = () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {t(
          "profile.two_factor_auth.regenerate_title",
          "Генерация новых резервных кодов"
        )}
      </h3>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          {t(
            "profile.two_factor_auth.regenerate_warning",
            "Старые резервные коды перестанут работать"
          )}
        </p>
      </div>

      <p className="text-sm text-gray-600">
        {t(
          "profile.two_factor_auth.regenerate_description",
          "Введите код из вашего приложения-аутентификатора для генерации новых резервных кодов:"
        )}
      </p>

      <form
        onSubmit={twoFactorForm.handleSubmit((data) =>
          handleRegenerateBackupCodes(data.verificationCode)
        )}
      >
        <Controller
          name="verificationCode"
          control={twoFactorForm.control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="text"
              label={t(
                "profile.two_factor_auth.verification_code",
                "Код подтверждения"
              )}
              placeholder={t(
                "profile.two_factor_auth.verification_code_placeholder",
                "000000"
              )}
              error={fieldState.error?.message}
              disabled={isApiLoading}
              maxLength={6}
            />
          )}
        />

        <div className="flex gap-2 mt-4">
          <AppButton
            type="submit"
            disabled={!twoFactorForm.formState.isValid || isApiLoading}
            variant="secondary"
            isLoading={isApiLoading}
          >
            {t("profile.two_factor_auth.confirm", "Подтвердить")}
          </AppButton>

          <AppButton
            type="button"
            onClick={() => setViewMode("main")}
            disabled={isApiLoading}
            variant="ghost"
          >
            {t("common.cancel", "Отмена")}
          </AppButton>
        </div>
      </form>
    </div>
  );

  const renderCurrentView = () => {
    switch (viewMode) {
      case "change-password":
        return renderChangePasswordView();
      case "setup-2fa":
        return renderSetup2FAView();
      case "disable-2fa":
        return renderDisable2FAView();
      case "regenerate-backup":
        return renderRegenerateBackupView();
      case "backup-codes":
        return renderBackupCodesView();
      default:
        return renderMainView();
    }
  };

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
            {t(
              "profile.edit_contact_info.title",
              "Редактировать контактную информацию"
            )}
          </h2>

          {renderCurrentView()}
        </div>
      </div>
    </div>,
    document.body
  );
};
