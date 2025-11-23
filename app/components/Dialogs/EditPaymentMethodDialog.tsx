import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import type { TBankCard } from "~/types/user";
import {
  useTBankCards,
  useAttachCardWithHold,
  useCheckHoldStatus,
  useRemoveCard,
} from "~/hooks/useTBankCards";
import { useUser } from "~/queries/auth";
import { formatExpDate, formatPan } from "~/utils/formatCard";

interface EditPaymentMethodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  isLoading?: boolean;
}

export const EditPaymentMethodDialog: React.FC<
  EditPaymentMethodDialogProps
> = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const { t } = useTranslation();
  const [selectedTBankCard, setSelectedTBankCard] = useState<TBankCard | null>(
    null
  );
  const [isAttachingCard, setIsAttachingCard] = useState(false);
  const [cardDataConsent, setCardDataConsent] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    paymentUrl: string;
  } | null>(null);

  // Хуки для работы с Т-Банком
  const {
    data: tbankCards = [],
    isLoading: cardsLoading,
    refetch: refetchCards,
  } = useTBankCards();
  const attachCardMutation = useAttachCardWithHold();
  const checkHoldMutation = useCheckHoldStatus();
  const removeCard = useRemoveCard();
  const { refetch } = useUser();

  // Сброс состояния при открытии диалога
  useEffect(() => {
    if (isOpen) {
      setSelectedTBankCard(null);
      setIsAttachingCard(false);
      setCardDataConsent(false);
      setPaymentData(null);
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

  if (!isOpen) return null;

  const handleTBankCardSelect = (card: TBankCard) => {
    setSelectedTBankCard(card);
  };

  const handleAttachNewCard = async () => {
    if (!cardDataConsent) {
      return;
    }

    try {
      setIsAttachingCard(true);
      const response = await attachCardMutation.mutateAsync();

      // Сохраняем данные платежа для последующей проверки
      setPaymentData({
        paymentId: response.data.paymentId,
        paymentUrl: response.data.paymentUrl,
      });

      // Открываем страницу привязки карты в новом окне
      const attachWindow = window.open(
        response.data.paymentUrl,
        "attach-card",
        "width=800,height=600,scrollbars=yes,resizable=yes"
      );

      // Отслеживаем закрытие окна и проверяем статус холда
      const checkWindow = setInterval(async () => {
        if (attachWindow?.closed) {
          clearInterval(checkWindow);

          // Проверяем статус холда и отменяем его при успешной привязке
          try {
            const holdResult = await checkHoldMutation.mutateAsync(
              response.data.paymentId
            );

            if (holdResult.data.cardAttached) {
              // Карта привязана, обновляем список
              await refetchCards();
              refetch();
            }
          } catch (error) {
            console.error("Failed to check hold status:", error);
          }

          setIsAttachingCard(false);
          setPaymentData(null);
        }
      }, 2000); // Проверяем каждые 2 секунды
    } catch (error) {
      setIsAttachingCard(false);
      setPaymentData(null);
      console.error("Failed to initiate card attachment:", error);
    }
  };

  const handleRemoveCard = async (cardId: string) => {
    try {
      await removeCard.mutateAsync(cardId);
      if (selectedTBankCard?.cardId === cardId) {
        setSelectedTBankCard(null);
      }
      // Уведомляем родительский компонент об изменениях
      onSave?.();
      refetch();
    } catch (error) {
      console.error("Failed to remove card:", error);
    }
  };

  const handleSelectAndSave = () => {
    if (selectedTBankCard) {
      onSave?.();
    }
    refetch();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Фон */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,.5)] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Модальное окно */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
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

        {/* Заголовок */}
        <h2
          className="text-2xl font-bold text-center mb-6"
          style={{ color: "#121212" }}
        >
          {t("profile.payment_method.tbank_title", "Управление картами")}
        </h2>

        <div className="flex flex-col gap-4">
          {/* Кнопка добавления новой карты */}
          <div className="mb-4">
            {/* Чекбокс согласия на сохранение данных карты */}
            <div className="mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardDataConsent}
                  onChange={(e) => setCardDataConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  {t("profile.payment_method.card_consent")}
                </span>
              </label>
            </div>

            <AppButton
              type="button"
              onClick={handleAttachNewCard}
              disabled={
                !cardDataConsent ||
                isAttachingCard ||
                attachCardMutation.isPending
              }
              variant="primary"
              size="sm"
              className="w-full"
            >
              {isAttachingCard
                ? t(
                    "profile.payment_method.attaching_card",
                    "Привязка карты..."
                  )
                : t(
                    "profile.payment_method.attach_new_card",
                    "Привязать новую карту"
                  )}
            </AppButton>
          </div>

          {/* Список привязанных карт */}
          {cardsLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-600">
                {t("common.loading", "Загрузка...")}
              </p>
            </div>
          ) : tbankCards.length > 0 ? (
            <div>
              <label className="text-sm text-[#787878] font-semibold mb-2 block">
                {t("profile.payment_method.tbank_cards", "Привязанные карты")}
              </label>
              <div className="space-y-2">
                {tbankCards.map((card) => (
                  <div
                    key={card.cardId}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedTBankCard?.cardId === card.cardId
                        ? "border-[#F9B234] bg-[#F9B234] bg-opacity-10"
                        : "border-[#CFCFCF] bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => handleTBankCardSelect(card)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-[#121212] mb-1">
                          {formatPan(card.pan)}
                        </div>
                        {card.cardName && (
                          <div className="text-sm text-gray-600 mb-1">
                            {card.cardName}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              card.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {card.status === "Active" ? "Активна" : card.status}
                          </span>
                          {card.expDate && (
                            <span>До {formatExpDate(card.expDate)}</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCard(card.cardId);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm ml-4 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        disabled={removeCard.isPending}
                      >
                        {removeCard.isPending
                          ? t("common.loading", "...")
                          : t("profile.payment_method.remove", "Удалить")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                {t("profile.payment_method.no_cards", "Карты не привязаны")}
              </p>
              <p className="text-sm text-gray-500">
                {t(
                  "profile.payment_method.add_card_hint",
                  "Добавьте карту для совершения покупок"
                )}
              </p>
            </div>
          )}

          {/* Информационные сообщения */}
          <div className="space-y-4">
            {/* Блок 1: Информация об автоматическом списании */}
            <div className="text-sm text-[#121212]">
              {t(
                "verification_dialog.step_4.auction_payment_info",
                "В случае победы на аукционе итоговая сумма заказа, включая лот, комиссию и доставку, будет списана автоматически, если вы не совершите оплату вручную в течение 24 часов."
              )}
            </div>

            {/* Блок 2: Информация о холде */}
            <div className="text-sm text-[#121212]">
              {t(
                "verification_dialog.step_4.hold_info",
                "При привязке карты временно блокируется 11 ₽. Сумма возвращается автоматически после подтверждения."
              )}
            </div>

            {/* Блок 3: Информация о безопасности */}
            <div className="text-sm text-[#121212]">
              {t(
                "verification_dialog.step_4.security_info",
                "Данные вашей карты надёжно защищены и обрабатываются через зашифрованные каналы связи в соответствии с требованиями международных платёжных систем."
              )}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 mt-6">
            <AppButton
              type="button"
              onClick={onClose}
              variant="ghost"
              disabled={isLoading}
              className="flex-1"
            >
              {selectedTBankCard
                ? t("common.cancel", "Отмена")
                : t("profile.payment_method.close", "Закрыть")}
            </AppButton>

            {selectedTBankCard && (
              <AppButton
                type="button"
                onClick={handleSelectAndSave}
                disabled={isLoading || isAttachingCard}
                variant="primary"
                isLoading={isLoading}
                className="flex-1"
              >
                {isLoading
                  ? t("profile.payment_method.saving", "Сохранение...")
                  : t("profile.payment_method.select_card", "Выбрать карту")}
              </AppButton>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
