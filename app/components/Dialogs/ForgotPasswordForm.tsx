import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "~/shared/inputs/Input";
import { AppButton } from "~/shared/buttons/AppButton";
import { useNotifications } from "~/hooks/useNotifications";

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export function ForgotPasswordForm({ onSwitchToLogin, onSuccess }: ForgotPasswordFormProps) {
  const { t } = useTranslation();
  const notifications = useNotifications();
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Схема валидации для email
  const emailSchema = z.object({
    email: z
      .string()
      .min(1, t("login_modal.validation.required"))
      .email(t("login_modal.validation.email_invalid")),
  });

  // Схема валидации для сброса пароля
  const resetSchema = z.object({
    email: z
      .string()
      .min(1, t("login_modal.validation.required"))
      .email(t("login_modal.validation.email_invalid")),
    code: z
      .string()
      .length(4, t("login_modal.validation.verification_code_format"))
      .regex(/^\d+$/, t("login_modal.validation.verification_code_format")),
    password: z
      .string()
      .min(8, t("login_modal.validation.password_min_length"))
      .refine((password) => {
        // Проверяем все обязательные критерии
        const hasLowercase = /\p{Ll}/u.test(password); // Unicode: любые строчные буквы
        const hasUppercase = /\p{Lu}/u.test(password); // Unicode: любые заглавные буквы
        const hasDigits = /\d/.test(password);
        
        return hasLowercase && hasUppercase && hasDigits;
      }, {
        message: t("login_modal.validation.password_complexity"),
      }),
    confirmPassword: z.string().min(1, t("login_modal.validation.confirm_password")),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("login_modal.validation.passwords_mismatch"),
    path: ["confirmPassword"],
  });

  type EmailFormData = z.infer<typeof emailSchema>;
  type ResetFormData = z.infer<typeof resetSchema>;

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    mode: "onChange",
  });

  // Следим за изменением email для активации кнопки отправки кода
  const emailValue = emailForm.watch("email");

  // Следим за всеми полями для активации кнопки сброса
  const code = resetForm.watch("code");
  const password = resetForm.watch("password");
  const confirmPassword = resetForm.watch("confirmPassword");

  // Проверяем готовность формы сброса
  const isResetFormValid = code && 
                           code.length === 4 && 
                           password && 
                           password.length >= 8 &&
                           confirmPassword &&
                           password === confirmPassword &&
                           !resetForm.formState.errors.code &&
                           !resetForm.formState.errors.password &&
                           !resetForm.formState.errors.confirmPassword;

  // Таймер обратного отсчета
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Очищаем ошибки сброса при изменении email
  useEffect(() => {
    if (emailValue) {
      resetForm.clearErrors();
      emailForm.clearErrors();
    }
  }, [emailValue, resetForm, emailForm]);

  const handleSendCode = async () => {
    const isEmailValid = await emailForm.trigger("email");
    if (!isEmailValid) return;

    const email = emailForm.getValues("email");
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/forgot-password", {
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
        setResetEmail(email);
        setIsCodeSent(true);
        setCountdown(30);
        // Устанавливаем email в основную форму
        resetForm.setValue("email", email);
        notifications.showSuccess(result.message, "notifications.success.password_reset_code_sent");
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

  const onResetSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail,
          code: data.code,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Успешный сброс пароля
        notifications.showSuccess(result.message, "notifications.success.password_changed");
        onSuccess?.();
      } else {
        // Обработка ошибок валидации
        if (result.errors) {
          result.errors.forEach((error: any) => {
            resetForm.setError(error.field as keyof ResetFormData, {
              message: error.message,
            });
          });
        } else {
          resetForm.setError("root", { message: result.message });
          notifications.showError(result.message);
        }
      }
    } catch (error) {
      console.error("Ошибка сброса пароля:", error);
      resetForm.setError("root", { message: "" });
      notifications.showError("", "notifications.error.password_change_failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCountdown(30);
        notifications.showSuccess(result.message, "notifications.success.code_sent");
      } else {
        resetForm.setError("root", { message: result.message });
        notifications.showError(result.message);
      }
    } catch (error) {
      console.error("Ошибка повторной отправки:", error);
      resetForm.setError("root", { message: "" });
      notifications.showError("", "notifications.error.code_send_failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const canSendCode = emailValue && 
                         !emailForm.formState.errors.email && 
                         !isLoading && 
                         !isCodeSent && 
                         countdown === 0;
      
      if (canSendCode) {
        handleSendCode();
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
        onClick={handleSendCode}
        disabled={
          countdown > 0 ||
          !emailValue ||
          !!emailForm.formState.errors.email ||
          isLoading
        }
        variant="primary"
        isLoading={isLoading}
      >
        {isCodeSent
          ? "Отправить код повторно"
          : "Получить код для сброса"}
      </AppButton>

      {/* Остальные поля появляются после отправки кода */}
      {isCodeSent && (
        <form
          onSubmit={resetForm.handleSubmit(onResetSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="text-center mb-4">
            <p className="text-[#121212] text-[16px]">
              Код для сброса пароля отправлен на
            </p>
            <p className="text-[#121212] text-[16px] font-semibold">
              {resetEmail}
            </p>
          </div>

          <Input
            {...resetForm.register("code")}
            placeholder="0000"
            type="text"
            maxLength={4}
            className="text-center text-2xl tracking-widest"
            error={resetForm.formState.errors.code?.message}
          />

          {countdown > 0 && (
            <p className="text-center text-sm text-[#121212]">
              Повторно отправить код можно через {countdown} сек
            </p>
          )}

          <Input
            {...resetForm.register("password")}
            value={resetForm.watch("password")}
            placeholder="Новый пароль"
            type="password"
            showPasswordStrength={true}
          />
          
          <Input
            {...resetForm.register("confirmPassword")}
            placeholder="Подтвердите новый пароль"
            type="password"
            error={resetForm.formState.errors.confirmPassword?.message}
          />

          {resetForm.formState.errors.root && (
            <p className="text-red-500 text-sm text-center">
              {resetForm.formState.errors.root.message}
            </p>
          )}

          <AppButton
            type="submit"
            disabled={!isResetFormValid || isLoading}
            variant="secondary"
            isLoading={isLoading}
          >
            {isLoading ? "Загрузка..." : "Сбросить пароль"}
          </AppButton>
        </form>
      )}

      <AppButton
        type="button"
        onClick={onSwitchToLogin}
        variant="ghost"
      >
        Вернуться к входу
      </AppButton>
    </div>
  );
} 