import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import type { TBankCard } from "~/types/user";
import {
  useTBankCards,
  useAttachCardWithHold,
  useCheckHoldStatus,
} from "~/hooks/useTBankCards";
import { formatExpDate, formatPan } from "~/utils/formatCard";

interface Step4PaymentMethodProps {
  onNext: (data: { paymentMethod: string; selectedCard?: TBankCard }) => void;
  isLoading: boolean;
}

export function Step4PaymentMethod({
  onNext,
  isLoading,
}: Step4PaymentMethodProps) {
  const { t } = useTranslation();
  const [selectedTBankCard, setSelectedTBankCard] = useState<TBankCard | null>(
    null
  );
  const [isAttachingCard, setIsAttachingCard] = useState(false);
  const [cardDataConsent, setCardDataConsent] = useState(false);

  // Хуки для работы с Т-Банком
  const {
    data: tbankCards = [],
    isLoading: cardsLoading,
    refetch: refetchCards,
  } = useTBankCards();
  const attachCardMutation = useAttachCardWithHold();
  const checkHoldMutation = useCheckHoldStatus();

  // Автоматически выбираем новую карту после обновления списка
  useEffect(() => {
    if (tbankCards.length > 0) {
      const newCard = tbankCards[0];
      if (newCard) {
        setSelectedTBankCard(newCard);
      }
    }
  }, [tbankCards]);

  const handleSubmit = () => {
    onNext({
      paymentMethod: "tbank",
      selectedCard: selectedTBankCard || undefined,
    });
  };

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
              const updatedCards = await refetchCards();
              if (updatedCards.data && updatedCards.data.length > 0) {
                setSelectedTBankCard(updatedCards.data[0]);
              }
            }
          } catch (error) {
            console.error("Failed to check hold status:", error);
          }

          setIsAttachingCard(false);
        }
      }, 2000); // Проверяем каждые 2 секунды
    } catch (error) {
      setIsAttachingCard(false);
      console.error("Failed to initiate card attachment:", error);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-[#121212] text-center">
        {t("verification_dialog.step_4.title")}
      </h3>
      <p className="text-gray-600 mb-4 text-center">
        {t("verification_dialog.step_4.description")}
      </p>

      <div className="space-y-4">
        {/* Кнопка добавления новой карты */}
        <div className="mb-4">
          {/* Чекбокс согласия на сохранение данных карты */}
          <div className="mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={cardDataConsent}
                onChange={(e) => setCardDataConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#F9B234] border-[#CFCFCF] rounded focus:ring-[#F9B234] focus:ring-2"
              />
              <span className="text-sm text-[#121212] leading-relaxed">
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
            variant="secondary"
            size="sm"
            className="w-full"
          >
            {isAttachingCard
              ? t("profile.payment_method.attaching_card", "Привязка карты...")
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
              {t(
                "verification_dialog.step_4.select_card",
                "Выберите карту для оплаты"
              )}
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
                        <div className="text-sm text-[#121212] mb-1">
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
                    {selectedTBankCard?.cardId === card.cardId && (
                      <div className="text-[#F9B234] ml-4">
                        <svg
                          className="w-5 h-5"
                          fill="#121212"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
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
              {t("verification_dialog.step_4.no_cards", "Карты не привязаны")}
            </p>
            <p className="text-sm text-gray-500">
              {t(
                "verification_dialog.step_4.add_card_hint",
                "Добавьте карту для завершения верификации"
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
      </div>

      <AppButton
        type="submit"
        disabled={selectedTBankCard === null || isLoading || isAttachingCard}
        variant="secondary"
        isLoading={isLoading}
        className="mt-6"
        onClick={handleSubmit}
      >
        {t("verification_dialog.buttons.finish")}
      </AppButton>
    </div>
  );
}
