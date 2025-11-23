import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import { EditPaymentMethodDialog } from "~/components/Dialogs/EditPaymentMethodDialog";
import { useAuth } from "~/queries/auth";
import { useTBankCards, useRemoveCard } from "~/hooks/useTBankCards";
import configureAddress from "~/assets/images/private/configure-address.svg";
import trash from "~/assets/images/private/trash.svg";
import { formatExpDate, formatPan } from "~/utils/formatCard";

const PaymentMethods: React.FC = () => {
  const { t } = useTranslation();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { user: currentUser, refetch: refetchUser } = useAuth();

  // Хуки для работы с картами
  const { data: tbankCards = [], isLoading, refetch } = useTBankCards();
  const removeCardMutation = useRemoveCard();

  // Получаем карты из текущего пользователя
  const userCards = currentUser?.tbankCustomer?.cards || tbankCards || [];

  const handleAddPaymentMethod = () => {
    setShowPaymentDialog(true);
  };

  const handleCloseDialog = () => {
    setShowPaymentDialog(false);
    refetchUser();
  };

  const handleSavePaymentMethod = () => {
    setShowPaymentDialog(false);
    refetch(); // Обновляем список карт
    refetchUser();
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm(t("profile.payment_methods.delete"))) {
      removeCardMutation.mutate(cardId, {
        onSuccess: () => {
          refetch();
          refetchUser();
        },
      });
    }
  };

  const getCardIcon = () => {
    return "💳";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow px-[50px] py-[36px]">
      {/* Заголовок и кнопка добавления */}
      <div className="flex flex-col gap-y-2 sm:gap-y-0 sm:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">{t("profile.payment_methods.title")}</h2>
        <AppButton variant="secondary" size="sm" fullWidth={false} onClick={handleAddPaymentMethod}>
          {t("profile.payment_methods.add_new")}
        </AppButton>
      </div>

      {/* Список способов оплаты */}
      {userCards.length > 0 ? (
        <div className="space-y-4 mb-6">
          {userCards.map((card) => (
            <div
              key={card.cardId}
              className="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
            >
              <div className="flex-1">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCardIcon()}</span>
                    <div>
                      <h3 className="text-[20px] font-medium text-[#121212]">
                        {formatPan(card.pan)}
                      </h3>
                      {card.cardName && (
                        <p className="text-[#121212] font-[17px]">{card.cardName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        card.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {card.status === "Active"
                        ? t("profile.payment_methods.status_active")
                        : card.status}
                    </span>
                    {card.expDate && (
                      <span className="text-gray-600">
                        {t("profile.payment_methods.expires")}: {formatExpDate(card.expDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Кнопки действий справа */}
              <div className="flex items-center space-x-2 ml-4">
                {/* Кнопка редактирования */}
                <button
                  onClick={handleAddPaymentMethod}
                  className="cursor-pointer"
                  title={t("profile.payment_methods.edit")}
                >
                  <img
                    src={configureAddress}
                    alt="configure-payment"
                    className="w-[34px] h-[34px]"
                  />
                </button>

                {/* Кнопка удаления */}
                <button
                  onClick={() => handleDeleteCard(card.cardId)}
                  disabled={removeCardMutation.isPending}
                  className="cursor-pointer"
                  title={t("profile.payment_methods.delete")}
                >
                  <img
                    src={trash}
                    alt={t("profile.addresses.delete")}
                    className="w-[34px] h-[34px]"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Пустое состояние */
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("profile.payment_methods.no_methods")}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t("profile.payment_methods.no_methods_desc")}
          </p>
        </div>
      )}

      {/* Диалог управления способами оплаты */}
      <EditPaymentMethodDialog
        isOpen={showPaymentDialog}
        onClose={handleCloseDialog}
        onSave={handleSavePaymentMethod}
        isLoading={false}
      />
    </div>
  );
};

export default PaymentMethods;
