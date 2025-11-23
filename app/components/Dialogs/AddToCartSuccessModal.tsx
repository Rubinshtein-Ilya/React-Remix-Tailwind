import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { createPortal } from "react-dom";
import { AppButton } from "~/shared/buttons/AppButton";
import { RiCloseLine } from "@remixicon/react";

interface AddToCartSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddToCartSuccessModal({
  isOpen,
  onClose,
}: AddToCartSuccessModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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

  const handleGoToCart = () => {
    onClose();
    navigate("/cart");
  };

  const handleContinueShopping = () => {
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:opacity-70 transition-opacity"
        >
          <RiCloseLine size={24} />
        </button>

        {/* Content */}
        <div className="text-center pt-4">
          {/* Success icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Message */}
          <h3 className="text-lg font-semibold mb-6">
            {t("cart.added_to_cart_success")}
          </h3>

          {/* Buttons */}
          <div className="flex gap-3">
            <AppButton
              variant="secondary"
              size="md"
              onClick={handleGoToCart}
              className="flex-1"
            >
              {t("cart.go_to_cart")}
            </AppButton>
            
            <AppButton
              variant="secondary"
              size="md"
              onClick={handleContinueShopping}
              className="flex-1"
            >
              {t("cart.continue_shopping")}
            </AppButton>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
} 