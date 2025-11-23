import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import { useNavigate } from "react-router";

interface CartItem {
  _id: string;
  title: string;
  size: string;
  price: number;
  amount: number;
  image?: string;
  thumbnail?: string;
}

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems?: CartItem[];
  totalAmount?: number;
  totalPrice?: number;
  loading?: boolean;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  isOpen,
  onClose,
  cartItems = [],
  totalAmount = 0,
  totalPrice = 0,
  loading = false,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  // Закрытие по клику вне панели
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoToCart = () => {
    onClose();
    navigate("/cart"); // Перенаправляем на страницу корзины
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(i18n.language).format(price);
  };

  return (
    <div
      ref={panelRef}
      className="fixed top-25 right-4 sm:right-8 z-50 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 flex flex-col"
      style={{
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">
          {t("header.cart")}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Закрыть"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Содержимое */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <svg
              className="w-12 h-12 text-gray-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              {t("cart.empty")}
            </h3>
            <p className="text-xs text-gray-500">{t("cart.empty_desc")}</p>
          </div>
        ) : (
          <div className="p-3 space-y-3 max-h-60 overflow-y-auto">
            {cartItems.slice(0, 3).map((item) => (
              <div
                key={`${item._id}-${item.size}`}
                className="flex items-center space-x-3"
              >
                {/* Изображение товара */}
                <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image || item.thumbnail ? (
                    <img
                      src={item.image || item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Информация о товаре */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-gray-900 truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {t("cart.size")}: {item.size}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-medium text-gray-900">
                      {formatPrice(item.price + Math.ceil(item.price * 0.1))} ₽
                    </span>
                    <span className="text-xs text-gray-500">
                      x{item.amount}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {cartItems.length > 3 && (
              <div className="text-center py-2">
                <span className="text-xs text-gray-500">
                  +{cartItems.length - 3} товаров
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Итого и кнопка */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {t("cart.total")}:
            </span>
            <span className="text-sm font-bold text-gray-900">
              {formatPrice(totalPrice)} ₽
            </span>
          </div>
          <AppButton
            variant="secondary"
            onClick={handleGoToCart}
            className="w-full text-sm py-2"
            size="sm"
          >
            {t("cart.go_to_cart")}
          </AppButton>
        </div>
      )}
    </div>
  );
};
