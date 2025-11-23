import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Input } from "~/shared/inputs/Input";
import { AppButton } from "~/shared/buttons/AppButton";
import { useNotifications } from "~/hooks/useNotifications";
import { useEnv } from "~/contexts/EnvContext";
import { useVKID } from "~/hooks/useVKID";
import { login, loginWithYandex, loginWithVKCode } from "~/api/auth";
import * as VKID from "@vkid/sdk";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  onSuccess: () => void;
}

export function LoginForm({
  onSwitchToRegister,
  onForgotPassword,
  onSuccess,
}: LoginFormProps) {
  const { t } = useTranslation();
  const { YANDEX_CLIENT_ID } = useEnv();
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const notifications = useNotifications();
  const vkidConfig = useVKID();

  // Схема валидации для основного входа
  const loginSchema = z.object({
    email: z
      .string()
      .min(1, t("login_modal.validation.required"))
      .email(t("login_modal.validation.email_invalid")),
    password: z.string().min(1, t("login_modal.validation.required")),
  });

  // Схема валидации для 2FA кода
  const twoFactorSchema = z.object({
    twoFactorCode: z
      .string()
      .min(
        6,
        t(
          "profile.two_factor_auth.verification_code_error",
          "Код должен содержать минимум 6 символов"
        )
      )
      .max(32, "Код слишком длинный"), // Поддерживаем как 6-значные коды, так и backup коды
  });

  type LoginFormData = z.infer<typeof loginSchema>;
  type TwoFactorFormData = z.infer<typeof twoFactorSchema>;

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const twoFactorForm = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    mode: "onChange",
  });

  const onSubmitLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await login({
        email: data.email,
        password: data.password,
      });

      if (result.success) {
        // Успешный вход без 2FA
        notifications.showSuccess(
          result.message,
          "notifications.success.login_success"
        );
        onSuccess?.();
      } else if (result.requiresTwoFactor) {
        // Требуется 2FA
        setCredentials({ email: data.email, password: data.password });
        setRequiresTwoFactor(true);
        notifications.showInfo(result.message);
      } else {
        // Обработка ошибок валидации
        if (result.errors) {
          result.errors.forEach((error: any) => {
            loginForm.setError(error.field as keyof LoginFormData, {
              message: error.message,
            });
          });
        } else {
          loginForm.setError("root", { message: result.message });
          notifications.showError(result.message);
        }
      }
    } catch (error) {
      console.error("Ошибка входа:", error);
      loginForm.setError("root", { message: "" });
      notifications.showError("", "notifications.error.login_failed");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitTwoFactor = async (data: TwoFactorFormData) => {
    if (!credentials) return;

    setIsLoading(true);
    try {
      const result = await login({
        email: credentials.email,
        password: credentials.password,
        twoFactorCode: data.twoFactorCode,
      });

      if (result.success) {
        // Успешный вход с 2FA
        notifications.showSuccess(
          result.message,
          "notifications.success.login_success"
        );
        onSuccess?.();
      } else {
        // Ошибка 2FA
        twoFactorForm.setError("twoFactorCode", { message: result.message });
        notifications.showError(result.message);
      }
    } catch (error) {
      console.error("Ошибка входа с 2FA:", error);
      twoFactorForm.setError("twoFactorCode", { message: "" });
      notifications.showError("", "notifications.error.login_failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!YANDEX_CLIENT_ID) {
      console.warn("YANDEX_CLIENT_ID не найден в переменных окружения");
      return;
    }

    // @ts-ignore
    window.YaAuthSuggest.init(
      {
        client_id: YANDEX_CLIENT_ID,
        response_type: "token",
        redirect_uri: "https://fansdream.ru/yandex-callback",
      },
      "https://fansdream.ru",
      {
        view: "button",
        parentId: "loginWithYandexContainerId",
        buttonSize: "l",
        buttonView: "main",
        buttonTheme: "light",
        buttonBorderRadius: "100",
        buttonIcon: "ya",
      }
    )
      .then(({ handler }: { handler: () => Promise<any> }) => {
        return handler();
      })
      .then(async (data: any) => {
        setIsLoading(true);

        try {
          // Отправляем токен напрямую на API
          const result = await loginWithYandex(data);

          if (result.success) {
            notifications.showSuccess(
              result.message,
              "notifications.success.login_success"
            );
            onSuccess?.();
          } else {
            notifications.showError(result.message);
          }
        } catch (error) {
          console.error("Ошибка отправки токена:", error);
          notifications.showError("", "notifications.error.login_failed");
        } finally {
          setIsLoading(false);
        }
      })
      .catch((error: any) => {
        console.log("Обработка ошибки", error);
        setIsLoading(false);
      });
  }, [YANDEX_CLIENT_ID]);

  // VK ID инициализируется через useVKID хук
  useEffect(() => {
    if (vkidConfig.error) {
      console.warn("Ошибка VK ID:", vkidConfig.error);
    } else if (vkidConfig.isInitialized) {
      console.log("VK ID SDK успешно инициализирован");

      // Создание экземпляра кнопки.
      const oneTap = new VKID.OneTap();

      // Получение контейнера из разметки.
      const container = document.getElementById("VkIdSdkOneTap");

      // Проверка наличия кнопки в разметке.
      if (container) {
        // Отрисовка кнопки в контейнере с именем приложения APP_NAME, светлой темой и на русском языке.
        oneTap
          .render({
            container: container,
            scheme: VKID.Scheme.LIGHT,
            lang: VKID.Languages.RUS,
            styles: {
              borderRadius: 100,
              height: 48,
            },
          })
          .on(VKID.WidgetEvents.ERROR, () => {
            console.log("Ошибка VK ID");
          }); // handleError — какой-либо обработчик ошибки.
        oneTap.on(
          VKID.OneTapInternalEvents.LOGIN_SUCCESS,
          async function (payload: { code: string; device_id: string }) {
            const code = payload.code;
            const deviceId = payload.device_id;

            try {
              setIsLoading(true);

              // Получаем сохраненные параметры
              const codeVerifier = sessionStorage.getItem("vk_code_verifier");
              const savedState = sessionStorage.getItem("vk_state");

              if (!codeVerifier) {
                console.error("VK ID: code_verifier не найден");
                notifications.showError(
                  "Ошибка конфигурации",
                  "notifications.error.configuration_error"
                );
                return;
              }

              if (!savedState) {
                console.error("VK ID: state не найден");
                notifications.showError(
                  "Ошибка безопасности",
                  "notifications.error.security_error"
                );
                return;
              }

              // Отправляем код и данные на сервер для обмена на токен
              const result = await loginWithVKCode({
                code,
                device_id: deviceId,
                code_verifier: codeVerifier,
                state: savedState,
              });

              if (result.success) {
                // Очищаем временные данные после успешной авторизации
                sessionStorage.removeItem("vk_code_verifier");
                sessionStorage.removeItem("vk_state");
                
                notifications.showSuccess(
                  result.message,
                  "notifications.success.login_success"
                );
                onSuccess?.();
              } else {
                notifications.showError(result.message);
              }
            } catch (error) {
              console.error("Ошибка авторизации VK:", error);
              notifications.showError("", "notifications.error.login_failed");
            } finally {
              setIsLoading(false);
            }
          }
        );
      }
    }
  }, [vkidConfig]);

  const handleBackToLogin = () => {
    setRequiresTwoFactor(false);
    setCredentials(null);
    twoFactorForm.reset();
  };

  if (requiresTwoFactor) {
    return (
      <div className="flex flex-col gap-4 mt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {t(
              "profile.two_factor_auth.verification_code",
              "Код подтверждения"
            )}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Введите 6-значный код из приложения-аутентификатора или резервный
            код
          </p>
        </div>

        <form
          onSubmit={twoFactorForm.handleSubmit(onSubmitTwoFactor)}
          className="flex flex-col gap-4"
        >
          <Input
            {...twoFactorForm.register("twoFactorCode")}
            placeholder="000000"
            label={t(
              "profile.two_factor_auth.verification_code",
              "Код подтверждения"
            )}
            type="text"
            error={twoFactorForm.formState.errors.twoFactorCode?.message}
            autoComplete="one-time-code"
            maxLength={32}
          />

          {twoFactorForm.formState.errors.root && (
            <p className="text-red-500 text-sm text-center">
              {twoFactorForm.formState.errors.root.message}
            </p>
          )}

          <AppButton
            type="submit"
            disabled={isLoading || !twoFactorForm.formState.isValid}
            variant="primary"
            isLoading={isLoading}
          >
            {t("profile.two_factor_auth.confirm", "Подтвердить")}
          </AppButton>

          <AppButton
            type="button"
            onClick={handleBackToLogin}
            variant="ghost"
            disabled={isLoading}
          >
            {t("common.cancel", "Отмена")}
          </AppButton>
        </form>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={loginForm.handleSubmit(onSubmitLogin)}
        className="flex flex-col gap-4 mt-6"
      >
        <Input
          {...loginForm.register("email")}
          placeholder={t("login_modal.email")}
          label={t("login_modal.specify_email")}
          type="email"
          error={loginForm.formState.errors.email?.message}
        />
        <Input
          {...loginForm.register("password")}
          placeholder={t("login_modal.password")}
          label={t("login_modal.specify_password")}
          type="password"
          error={loginForm.formState.errors.password?.message}
        />

        {loginForm.formState.errors.root && (
          <p className="text-red-500 text-sm text-center">
            {loginForm.formState.errors.root.message}
          </p>
        )}

        <AppButton
          type="submit"
          disabled={isLoading || !loginForm.formState.isValid}
          variant="primary"
          isLoading={isLoading}
        >
          {t("login_modal.login")}
        </AppButton>

        {/* Ссылка "Забыли пароль?" */}
        <AppButton type="button" onClick={onForgotPassword} variant="ghost">
          {t("login_modal.forgot_password")}
        </AppButton>

        {/* Разделитель */}
        <div className="mt-[10px]">
          <div className="h-px bg-[#DCDCDC]"></div>
        </div>

        {/* Кнопки регистрации */}
        <div className="flex flex-col gap-2 mt-[10px]">
          <AppButton
            type="button"
            variant="secondary"
            onClick={onSwitchToRegister}
          >
            {t("login_modal.register_email")}
          </AppButton>
        </div>
      </form>
      <div className="flex flex-col gap-2 mt-[10px]">
        <div
          id="loginWithYandexContainerId"
          className="h-[50px] [& iframe]:h-[50px]"
        />
        <div id="VkIdSdkOneTap" className="h-[50px]" />
      </div>
    </>
  );
}
