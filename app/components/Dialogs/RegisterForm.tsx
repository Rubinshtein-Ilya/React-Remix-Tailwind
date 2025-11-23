import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "~/shared/inputs/Input";
import { AppButton } from "~/shared/buttons/AppButton";
import { useNavigate } from "react-router";
import { useNotifications } from "~/hooks/useNotifications";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export function RegisterForm({
  onSwitchToLogin,
  onSuccess,
}: RegisterFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notifications = useNotifications();
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState("");

  // Схема валидации для email
  const emailSchema = z.object({
    email: z
      .string()
      .min(1, t("login_modal.validation.required"))
      .email(t("login_modal.validation.email_invalid")),
  });

  // Схема валидации для полной регистрации
  const registerSchema = z
    .object({
      email: z
        .string()
        .min(1, t("login_modal.validation.required"))
        .email(t("login_modal.validation.email_invalid")),
      verificationCode: z
        .string()
        .length(4, t("login_modal.validation.verification_code_format"))
        .regex(/^\d+$/, t("login_modal.validation.verification_code_format")),
      password: z
        .string()
        .min(8, t("login_modal.validation.password_min_length"))
        .refine(
          (password) => {
            // Проверяем все обязательные критерии
            const hasLowercase = /\p{Ll}/u.test(password); // Unicode: любые строчные буквы
            const hasUppercase = /\p{Lu}/u.test(password); // Unicode: любые заглавные буквы
            const hasDigits = /\d/.test(password);

            return hasLowercase && hasUppercase && hasDigits;
          },
          {
            message: t("login_modal.validation.password_complexity"),
          }
        ),
      confirmPassword: z
        .string()
        .min(1, t("login_modal.validation.confirm_password")),
      agreeToOffer: z.boolean().refine((val) => val === true, {
        message: t("login_modal.validation.agree_to_offer"),
      }),
      agreeToPersonalData: z.boolean().refine((val) => val === true, {
        message: t("login_modal.validation.agree_to_personal_data"),
      }),
      agreeToAge: z.boolean().refine((val) => val === true, {
        message: t("login_modal.validation.agree_to_age"),
      }),
      agreeToMarketing: z.boolean().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("login_modal.validation.passwords_mismatch"),
      path: ["confirmPassword"],
    });

  type EmailFormData = z.infer<typeof emailSchema>;
  type RegisterFormData = z.infer<typeof registerSchema>;

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  // Следим за изменением email для активации кнопки отправки кода
  const emailValue = emailForm.watch("email");

  // Следим за всеми полями регистрации для активации кнопки регистрации
  const verificationCode = registerForm.watch("verificationCode");
  const password = registerForm.watch("password");
  const confirmPassword = registerForm.watch("confirmPassword");
  const agreeToOffer = registerForm.watch("agreeToOffer");
  const agreeToPersonalData = registerForm.watch("agreeToPersonalData");
  const agreeToAge = registerForm.watch("agreeToAge");
  const agreeToMarketing = registerForm.watch("agreeToMarketing");

  // Проверяем готовность формы регистрации
  const isRegisterFormValid =
    verificationCode &&
    verificationCode.length === 4 &&
    password &&
    password.length >= 8 &&
    confirmPassword &&
    password === confirmPassword &&
    agreeToOffer === true &&
    agreeToPersonalData === true &&
    agreeToAge === true &&
    !registerForm.formState.errors.verificationCode &&
    !registerForm.formState.errors.password &&
    !registerForm.formState.errors.confirmPassword &&
    !registerForm.formState.errors.agreeToOffer &&
    !registerForm.formState.errors.agreeToPersonalData &&
    !registerForm.formState.errors.agreeToAge;

  // Таймер обратного отсчета
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Очищаем ошибки регистрации при изменении email
  useEffect(() => {
    if (emailValue) {
      registerForm.clearErrors();
      emailForm.clearErrors();
    }
  }, [emailValue, registerForm, emailForm]);

  const handleGetCode = async () => {
    const isEmailValid = await emailForm.trigger("email");
    if (!isEmailValid) return;

    const email = emailForm.getValues("email");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setRegistrationEmail(email);
        setIsCodeSent(true);
        setCountdown(30);
        // Устанавливаем email в основную форму
        registerForm.setValue("email", email);
        notifications.showSuccess(
          result.message,
          "notifications.success.code_sent"
        );
      } else {
        // Обработка ошибок
        if (result.errors) {
          result.errors.forEach((error: any) => {
            if (error.field === "email") {
              emailForm.setError("email", {
                message: error.message,
              });
            }
          });
        } else {
          emailForm.setError("root", { message: result.message });
          notifications.showError(result.message);
        }
      }
    } catch (error) {
      console.error("Ошибка отправки кода:", error);
      emailForm.setError("root", { message: "" });
      notifications.showError("", "notifications.error.code_send_failed");
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registrationEmail,
          verificationCode: data.verificationCode,
          password: data.password,
          confirmPassword: data.confirmPassword,
          agreeToOffer: data.agreeToOffer,
          agreeToPersonalData: data.agreeToPersonalData,
          agreeToAge: data.agreeToAge,
          agreeToMarketing: data.agreeToMarketing,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Успешная регистрация - перенаправляем на профиль с диалогом верификации
        notifications.showSuccess(
          result.message,
          "notifications.success.registration_success"
        );
        onSuccess?.();

        // Добавляем небольшую задержку, чтобы дать время сессии установиться
        console.log("Регистрация успешна, autoLogin:", result.autoLogin);

        if (result.autoLogin) {
          // Ждем немного, чтобы cookies успели сохраниться
          setTimeout(() => {
            // Используем window.location.href для принудительной перезагрузки страницы
            window.location.href = "/profile?verification=true";
          }, 100);
        } else {
          // Если автоматическая авторизация не удалась, просто закрываем модал
          console.warn(
            "Автоматическая авторизация не удалась, остаемся на текущей странице"
          );
        }
      } else {
        // Обработка ошибок валидации
        if (result.errors) {
          result.errors.forEach((error: any) => {
            registerForm.setError(error.field as keyof RegisterFormData, {
              message: error.message,
            });
          });
        } else {
          registerForm.setError("root", { message: result.message });
          notifications.showError(result.message);
        }
      }
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      registerForm.setError("root", { message: "" });
      notifications.showError("", "notifications.error.registration_failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик нажатия Enter для поля email
  const handleEmailKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      // Проверяем условия для отправки кода
      const canSendCode =
        emailValue &&
        !emailForm.formState.errors.email &&
        !isLoading &&
        !isCodeSent &&
        countdown === 0;

      if (canSendCode) {
        handleGetCode();
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* Поле email и кнопка получения кода */}
      <Input
        {...emailForm.register("email")}
        placeholder={t("login_modal.email")}
        type="email"
        error={emailForm.formState.errors.email?.message}
        disabled={isCodeSent}
        onKeyDown={handleEmailKeyDown}
      />

      {emailForm.formState.errors.root && (
        <p className="text-red-500 text-sm text-center">
          {emailForm.formState.errors.root.message}
        </p>
      )}

      {/* Кнопка "Получить код" */}
      <AppButton
        type="button"
        onClick={handleGetCode}
        disabled={
          countdown > 0 ||
          !emailValue ||
          !!emailForm.formState.errors.email ||
          isLoading
        }
        variant="primary"
        isLoading={isLoading}
      >
        {isCodeSent ? t("login_modal.resend_code") : t("login_modal.get_code")}
      </AppButton>

      {/* Остальные поля появляются после отправки кода */}
      {isCodeSent && (
        <form
          onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="text-center mb-4">
            <p className="text-[#121212] text-[16px]">
              {t("login_modal.verification_code_sent")}
            </p>
            <p className="text-[#121212] text-[16px] font-semibold">
              {registrationEmail}
            </p>
          </div>

          <Input
            {...registerForm.register("verificationCode")}
            placeholder="0000"
            type="text"
            maxLength={4}
            className="text-center text-2xl tracking-widest"
            error={registerForm.formState.errors.verificationCode?.message}
          />

          {countdown > 0 && (
            <p className="text-center text-sm text-[#121212]">
              {t("login_modal.resend_in", { seconds: countdown })}
            </p>
          )}

          <Input
            {...registerForm.register("password")}
            value={registerForm.watch("password")}
            placeholder={t("login_modal.password")}
            type="password"
            showPasswordStrength={true}
          />

          <Input
            {...registerForm.register("confirmPassword")}
            placeholder={t("login_modal.confirm_password")}
            type="password"
            error={registerForm.formState.errors.confirmPassword?.message}
          />

          {/* Чекбокс согласия с условиями */}
          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...registerForm.register("agreeToOffer")}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span
                className="text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: t("login_modal.checkbox_offer"),
                }}
              />
            </label>
            {registerForm.formState.errors.agreeToOffer && (
              <p className="text-red-500 text-sm">
                {registerForm.formState.errors.agreeToOffer.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...registerForm.register("agreeToPersonalData")}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span
                className="text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: t("login_modal.checkbox_personal_data"),
                }}
              />
            </label>
            {registerForm.formState.errors.agreeToPersonalData && (
              <p className="text-red-500 text-sm">
                {registerForm.formState.errors.agreeToPersonalData.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...registerForm.register("agreeToMarketing")}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                {t("login_modal.checkbox_marketing")}
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...registerForm.register("agreeToAge")}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span
                className="text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: t("login_modal.checkbox_age"),
                }}
              />
            </label>
            {registerForm.formState.errors.agreeToAge && (
              <p className="text-red-500 text-sm">
                {registerForm.formState.errors.agreeToAge.message}
              </p>
            )}
          </div>

          {registerForm.formState.errors.root && (
            <p className="text-red-500 text-sm text-center">
              {registerForm.formState.errors.root.message}
            </p>
          )}

          <AppButton
            type="submit"
            disabled={!isRegisterFormValid || isLoading}
            variant="secondary"
            isLoading={isLoading}
          >
            {t("login_modal.register")}
          </AppButton>
        </form>
      )}

      <AppButton type="button" onClick={onSwitchToLogin} variant="ghost">
        {t("login_modal.switch_to_login")}
      </AppButton>
    </div>
  );
}
