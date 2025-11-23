import type { InputHTMLAttributes } from "react";
import { useState, forwardRef, useMemo } from "react";
import { useTranslation } from "react-i18next";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  showPasswordStrength?: boolean;
  submitButton?: {
    onSubmit: () => void;
    disabled?: boolean;
  };
};

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
  hasSpecialChars: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, showPasswordStrength, submitButton, ...rest }, ref) => {
    const { t } = useTranslation();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    // Анализ силы пароля
    const passwordStrength = useMemo((): PasswordStrength => {
      const password = (rest.value as string) || "";

      if (!password) {
        return {
          score: 0,
          label: "",
          color: "#CFCFCF",
          suggestions: [],
          hasSpecialChars: false,
        };
      }

      let score = 0;
      const suggestions: string[] = [];

      // Проверяем каждый критерий
      const hasMinLength = password.length >= 8;
      const hasLowercase = /\p{Ll}/u.test(password); // Unicode: любые строчные буквы
      const hasUppercase = /\p{Lu}/u.test(password); // Unicode: любые заглавные буквы
      const hasDigits = /\d/.test(password);
      const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
        password
      );

      // Проверка длины (обязательно)
      if (hasMinLength) {
        score += 1;
      } else {
        suggestions.push(
          t("login_modal.password_strength.suggestions.min_length")
        );
      }

      // Проверка наличия строчных букв (обязательно)
      if (hasLowercase) {
        score += 1;
      } else {
        suggestions.push(
          t("login_modal.password_strength.suggestions.add_lowercase")
        );
      }

      // Проверка наличия заглавных букв (обязательно)
      if (hasUppercase) {
        score += 1;
      } else {
        suggestions.push(
          t("login_modal.password_strength.suggestions.add_uppercase")
        );
      }

      // Проверка наличия цифр (обязательно)
      if (hasDigits) {
        score += 1;
      } else {
        suggestions.push(
          t("login_modal.password_strength.suggestions.add_digits")
        );
      }

      // Проверка наличия специальных символов (опционально, но улучшает оценку)
      if (hasSpecialChars) {
        score += 1;
      }

      let label = "";
      let color = "";

      // Базовая сила достигается при выполнении 4 обязательных критериев
      switch (score) {
        case 0:
        case 1:
          label = t("login_modal.password_strength.very_weak");
          color = "#FF4444";
          break;
        case 2:
          label = t("login_modal.password_strength.weak");
          color = "#FF8800";
          break;
        case 3:
          label = t("login_modal.password_strength.medium");
          color = "#FFBB00";
          break;
        case 4:
          label = t("login_modal.password_strength.strong");
          color = "#88BB00";
          break;
        case 5:
          label = t("login_modal.password_strength.very_strong");
          color = "#00BB44";
          break;
        default:
          label = "";
          color = "#CFCFCF";
      }

      return {
        score,
        label,
        color,
        suggestions,
        hasSpecialChars,
      };
    }, [rest.value, t]);

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={rest.id}
            className="text-sm text-[#787878] font-semibold"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            {...rest}
            ref={ref}
            type={
              rest.type === "password"
                ? isPasswordVisible
                  ? "text"
                  : "password"
                : rest.type
            }
            style={{
              ...rest.style,
            }}
            className={`w-full rounded-lg py-[10px] px-[30px] border text-[#121212] text-base ${
              error ? "border-red-500" : "border-[#CFCFCF]"
            } ${
              rest.disabled || rest.readOnly
                ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                : "bg-white"
            } ${
              submitButton ? "pr-[60px]" : rest.type === "password" ? "pr-[50px]" : ""
            } ${rest.className || ""}`}
          />
          
          {/* Submit Button */}
          {submitButton && (
            <button
              type="button"
              onClick={submitButton.onSubmit}
              disabled={submitButton.disabled}
              className="absolute right-0 top-0 h-full bg-[#121212] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed w-12 flex items-center justify-center transition-colors rounded-r-lg"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          {/* Password Toggle Button */}
          {rest.type === "password" && !submitButton && (
            <button
              tabIndex={-1}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              onClick={togglePasswordVisibility}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M15.5799 11.9999C15.5799 13.9799 13.9799 15.5799 11.9999 15.5799C10.0199 15.5799 8.41992 13.9799 8.41992 11.9999C8.41992 10.0199 10.0199 8.41992 11.9999 8.41992C13.9799 8.41992 15.5799 10.0199 15.5799 11.9999Z"
                  stroke="#CFCFCF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.9998 20.2707C15.5298 20.2707 18.8198 18.1907 21.1098 14.5907C22.0098 13.1807 22.0098 10.8107 21.1098 9.4007C18.8198 5.8007 15.5298 3.7207 11.9998 3.7207C8.46984 3.7207 5.17984 5.8007 2.88984 9.4007C1.98984 10.8107 1.98984 13.1807 2.88984 14.5907C5.17984 18.1907 8.46984 20.2707 11.9998 20.2707Z"
                  stroke="#CFCFCF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Индикатор силы пароля */}
        {showPasswordStrength && rest.type === "password" && rest.value && (
          <div className="flex flex-col gap-2">
            {/* Прогресс-бар */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      level <= passwordStrength.score
                        ? passwordStrength.color
                        : "#E5E5E5",
                  }}
                />
              ))}
            </div>

            {/* Текст силы пароля */}
            <p
              className="text-sm font-medium"
              style={{ color: passwordStrength.color }}
            >
              {passwordStrength.label}
            </p>

            {/* Рекомендации */}
            {passwordStrength.suggestions.length > 0 && (
              <div className="text-xs text-[#787878]">
                <p className="mb-1">
                  {t("login_modal.password_strength.improve_password")}
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {passwordStrength.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Опциональные улучшения (специальные символы) */}
            {passwordStrength.score === 4 &&
              !passwordStrength.hasSpecialChars && (
                <div className="text-xs text-[#787878]">
                  <p className="mb-1">
                    {t("login_modal.password_strength.optional_improvement")}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>
                      {t(
                        "login_modal.password_strength.suggestions.add_special_chars"
                      )}
                    </li>
                  </ul>
                </div>
              )}
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
