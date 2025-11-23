import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Input } from "~/shared/inputs/Input";
import { AppButton } from "~/shared/buttons/AppButton";

interface Step2PhoneVerificationProps {
  onNext: (data: { phone: string; phoneCode?: string }) => void;
  isLoading: boolean;
}

export function Step2PhoneVerification({
  onNext,
  isLoading,
}: Step2PhoneVerificationProps) {
  const { t } = useTranslation();
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Таймер обратного отсчета
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Функция для форматирования российского номера телефона
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    let phoneNumbers = numbers;
    if (phoneNumbers.startsWith("8")) {
      phoneNumbers = "7" + phoneNumbers.substring(1);
    }

    phoneNumbers = phoneNumbers.substring(0, 11);

    if (phoneNumbers.length === 0) return "";
    if (phoneNumbers.length === 1 && phoneNumbers === "7") return "+7 ";
    if (phoneNumbers.startsWith("7")) {
      phoneNumbers = phoneNumbers.substring(1);
      let formatted = "+7 ";

      if (phoneNumbers.length > 0) {
        formatted += phoneNumbers.substring(0, 3);
      }
      if (phoneNumbers.length > 3) {
        formatted += " " + phoneNumbers.substring(3, 6);
      }
      if (phoneNumbers.length > 6) {
        formatted += "-" + phoneNumbers.substring(6, 8);
      }
      if (phoneNumbers.length > 8) {
        formatted += "-" + phoneNumbers.substring(8, 10);
      }

      return formatted;
    }

    return (
      "+7 " +
      phoneNumbers.substring(0, 3) +
      (phoneNumbers.length > 3 ? " " + phoneNumbers.substring(3, 6) : "") +
      (phoneNumbers.length > 6 ? "-" + phoneNumbers.substring(6, 8) : "") +
      (phoneNumbers.length > 8 ? "-" + phoneNumbers.substring(8, 10) : "")
    );
  };

  // Схемы валидации с переводами
  const phoneSchema = z.object({
    phone: z
      .string()
      .min(1, t("errors.phone_required"))
      .transform((value) => formatPhoneNumber(value))
      .refine((value) => {
        // Проверяем формат
        if (!/^\+7 \d{3} \d{3}-\d{2}-\d{2}$/.test(value)) {
          return false;
        }
        // Проверяем что это российский номер
        const numbers = value.replace(/\D/g, "");
        if (!numbers.startsWith("7") || numbers.length !== 11) {
          return false;
        }
        return true;
      }, t("errors.phone_invalid_format")),
  });

  const codeSchema = z.object({
    phoneCode: z
      .string()
      .length(4, t("errors.code_length"))
      .regex(/^\d{4}$/, t("errors.code_digits_only")),
  });

  type PhoneFormData = z.infer<typeof phoneSchema>;
  type CodeFormData = z.infer<typeof codeSchema>;

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    mode: "onChange",
  });

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    mode: "onChange",
  });

  // Следим за изменениями номера телефона
  const phoneValue = phoneForm.watch("phone");

  const handleSendPhoneCode = async (data: PhoneFormData) => {
    try {
      const response = await fetch("/api/verification/send-phone-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: data.phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPhoneCodeSent(true);
        setPhoneNumber(data.phone);
        setCountdown(30); // Запускаем таймер на 30 секунд
        phoneForm.clearErrors();
      } else {
        phoneForm.setError("root", {
          message: result.message || "Failed to send code",
        });
      }
    } catch (error) {
      console.error("Error sending code:", error);
      phoneForm.setError("root", {
        message: "Failed to send code",
      });
    }
  };

  const handleVerifyCode = async (data: CodeFormData) => {
    try {
      const response = await fetch("/api/verification/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          code: data.phoneCode,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onNext({
          phone: phoneNumber,
        });
        codeForm.clearErrors();
      } else {
        codeForm.setError("root", {
          message: result.message || t("errors.invalid_code"),
        });
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      codeForm.setError("root", {
        message: t("errors.verification_failed"),
      });
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-[#121212] text-center">
        {t("verification_dialog.step_2.title")}
      </h3>
      <p className="text-gray-600 mb-6 text-center">
        {phoneCodeSent
          ? t("verification_dialog.step_2.description_code", {
              phone: phoneNumber,
            })
          : t("verification_dialog.step_2.description_enter")}
      </p>

      {/* Поле номера телефона */}
      <form onSubmit={phoneForm.handleSubmit(handleSendPhoneCode)}>
        <div className="mb-4">
          <Controller
            name="phone"
            control={phoneForm.control}
            defaultValue=""
            render={({ field, fieldState }) => (
              <Input
                {...field}
                value={field.value}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  field.onChange(formatted);
                }}
                placeholder={t("verification_dialog.step_2.phone_placeholder")}
                type="tel"
                error={fieldState.error?.message}
                disabled={phoneCodeSent}
              />
            )}
          />

          {phoneForm.formState.errors.root && (
            <p className="text-red-500 text-sm mt-2">
              {phoneForm.formState.errors.root.message}
            </p>
          )}
        </div>

        <AppButton
          type="submit"
          disabled={
            countdown > 0 ||
            !phoneValue ||
            !!phoneForm.formState.errors.phone ||
            isLoading
          }
          onClick={
            phoneCodeSent && countdown === 0
              ? (e) => {
                  e.preventDefault();
                  // Повторная отправка кода
                  if (phoneNumber) {
                    handleSendPhoneCode({ phone: phoneNumber });
                  }
                }
              : undefined
          }
          variant="secondary"
          isLoading={isLoading}
        >
          {phoneCodeSent
            ? countdown > 0
              ? t("login_modal.resend_in", { seconds: countdown })
              : t("login_modal.resend_code")
            : t("verification_dialog.buttons.send_code")}
        </AppButton>
      </form>

      {/* Поле кода - показывается после отправки кода */}
      {phoneCodeSent && (
        <form onSubmit={codeForm.handleSubmit(handleVerifyCode)}>
          <div className="my-4">
            <Input
              {...codeForm.register("phoneCode")}
              placeholder={t("verification_dialog.step_2.code_placeholder")}
              maxLength={4}
              className="text-center text-2xl tracking-widest"
              error={codeForm.formState.errors.phoneCode?.message}
            />

            {codeForm.formState.errors.root && (
              <p className="text-red-500 text-sm mt-2">
                {codeForm.formState.errors.root.message}
              </p>
            )}
          </div>

          <AppButton
            type="submit"
            disabled={!codeForm.formState.isValid || isLoading}
            variant="secondary"
            isLoading={isLoading}
          >
            {t("verification_dialog.buttons.continue")}
          </AppButton>
        </form>
      )}
    </div>
  );
}
