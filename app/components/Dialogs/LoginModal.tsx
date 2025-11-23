import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { useNavigate } from "react-router";
import { useUser } from "~/queries/auth";
import { notificationKeys } from "../../queries/notifications";
import { useQueryClient } from "@tanstack/react-query";
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  shouldRedirectToProfile?: boolean;
}

type FormType = "login" | "register" | "forgot-password";

export function LoginModal({
  isOpen,
  onClose,
  shouldRedirectToProfile = true,
}: LoginModalProps) {
  const { t } = useTranslation();
  const [currentForm, setCurrentForm] = useState<FormType>("login");

  // Сброс формы при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setCurrentForm("login");
    }
  }, [isOpen]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
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
  }, [isOpen, onClose]);
  const navigate = useNavigate();
  const { refetch } = useUser();

  const queryClient = useQueryClient();
  const handleSuccessLogin = () => {
    onClose();
    if (shouldRedirectToProfile) {
      navigate("/profile");
    }
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    queryClient.invalidateQueries({
      queryKey: notificationKeys.unreadCount(),
    });
    queryClient.invalidateQueries({ queryKey: ["cart"] });

    refetch();
  };

  const handleForgotPasswordSuccess = () => {
    setCurrentForm("login");
  };

  const getTitle = () => {
    switch (currentForm) {
      case "login":
        return t("login_modal.signin");
      case "register":
        return t("login_modal.signup");
      case "forgot-password":
        return t("login_modal.forgot_password");
      default:
        return t("login_modal.signin");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Фон */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,.5)] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Модальное окно */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
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
            {getTitle()}
          </h2>

          {currentForm === "login" && (
            <LoginForm
              onSwitchToRegister={() => setCurrentForm("register")}
              onForgotPassword={() => setCurrentForm("forgot-password")}
              onSuccess={handleSuccessLogin}
            />
          )}

          {currentForm === "register" && (
            <RegisterForm
              onSwitchToLogin={() => setCurrentForm("login")}
              onSuccess={handleSuccessLogin}
            />
          )}

          {currentForm === "forgot-password" && (
            <ForgotPasswordForm
              onSwitchToLogin={() => setCurrentForm("login")}
              onSuccess={handleForgotPasswordSuccess}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
