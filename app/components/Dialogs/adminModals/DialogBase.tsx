import React, { type FC, type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

export type BaseDialogProps = {
  isOpen: boolean;
  onClose: () => void;
}

type Props = BaseDialogProps & {
  children: ReactNode | ReactNode[];
  isLoading?: boolean;
}

export const DialogBase: FC<Props> = ({ onClose, children, isOpen, isLoading }) => {
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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Фон */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,.5)] backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Модальное окно */}
      <div className={`relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 ${isLoading ? "pointer-events-none backdrop-blur-sm" : ""}`}>
        {isLoading ? (
          <div className="absolute inset-0 z-50 pointer-events-none backdrop-blur-[5px] bg-white/20" />
        ): undefined}

        {/* Кнопка закрытия */}
        <button
          onClick={isLoading ? undefined : onClose}
          disabled={isLoading}
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
        {children}
      </div>
    </div>,
    document.body
  );
}