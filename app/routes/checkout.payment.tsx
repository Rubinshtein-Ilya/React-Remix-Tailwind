import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton } from "~/shared/buttons/AppButton";
import { Spinner } from "~/shared/Spinner";
import { useNotifications } from "~/hooks/useNotifications";
import { useCart, useChargeCard } from "~/queries/cart";
import { useUser } from "~/queries/auth";
import { useTBankCards } from "~/hooks/useTBankCards";
import { formatExpDate, formatPan } from "~/utils/formatCard";
import { EditPaymentMethodDialog } from "~/components/Dialogs/EditPaymentMethodDialog";
import checkboxUnchecked from "~/assets/images/private/checkbox-unchecked.svg";
import checkboxChecked from "~/assets/images/private/checkbox-checked.svg";

// Схема валидации для согласия с условиями
const agreementSchema = z.object({
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Необходимо согласие с условиями",
  }),
});

type AgreementFormData = z.infer<typeof agreementSchema>;

export default function PaymentPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();

  // Состояние для выбранного способа оплаты
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Хуки данных
  const { data: cartData, isLoading: cartLoading } = useCart();
  const { user, loading: userLoading } = useUser();
  const {
    data: tbankCards = [],
    isLoading: cardsLoading,
    refetch: refetchCards,
  } = useTBankCards();
  const chargeCardMutation = useChargeCard();

  const cart = cartData?.cart;
  const cartItems = cart ? Object.values(cart.items || {}) : [];

  // Получаем карты из пользователя или TBank
  const userCards = user?.tbankCustomer?.cards || tbankCards || [];

  // Загружаем данные доставки из localStorage
  const [deliveryData, setDeliveryData] = useState<{
    contactInfo: any;
    addressId: string;
    tariff: any;
    promoCode: any;
  } | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("checkoutDeliveryData");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setDeliveryData(data);
      } catch (error) {
        console.error("Error parsing delivery data:", error);
        navigate("/checkout/delivery");
      }
    } else {
      navigate("/checkout/delivery");
    }
  }, [navigate]);

  // Форма для согласия с условиями
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<AgreementFormData>({
    resolver: zodResolver(agreementSchema),
    mode: "onChange",
    defaultValues: {
      acceptTerms: false,
    },
  });

  const acceptTerms = watch("acceptTerms");

  // Индикатор шагов
  const stepIndicator = (
    <div className="flex items-center justify-center mb-12 mt-8">
      <div className="flex items-center">
        {/* Шаг 1: КОРЗИНА */}
        <div className="flex flex-col items-center">
          <span
            className="lg:text-[30px] text-[20px] font-bold leading-none"
            style={{ color: "#B8B8B8" }}
          >
            {t("cart.steps.cart")}
          </span>
        </div>

        {/* Полоска между шагами */}
        <div
          className="w-24 h-px mx-8"
          style={{ backgroundColor: "#B8B8B8" }}
        ></div>

        {/* Шаг 2: ДОСТАВКА */}
        <div className="flex flex-col items-center">
          <span
            className="lg:text-[30px] text-[20px] font-bold leading-none"
            style={{ color: "#B8B8B8" }}
          >
            {t("cart.steps.delivery")}
          </span>
        </div>

        {/* Полоска между шагами */}
        <div
          className="w-24 h-px mx-8"
          style={{ backgroundColor: "#B8B8B8" }}
        ></div>

        {/* Шаг 3: ОПЛАТА */}
        <div className="flex flex-col items-center">
          <span
            className="lg:text-[30px] text-[20px] font-bold leading-none"
            style={{ color: "#121212" }}
          >
            {t("cart.steps.payment")}
          </span>
        </div>
      </div>
    </div>
  );

  // Обработчик оплаты
  const handlePayment = async (data: AgreementFormData) => {
    if (!selectedCardId) {
      showError("", t("checkout.payment.validation.select_payment_method"));
      return;
    }

    if (!data.acceptTerms) {
      showError("", t("checkout.payment.validation.accept_terms"));
      return;
    }

    // Проверяем, что у выбранной карты есть rebillId
    if (!selectedCard?.rebillId) {
      showError("", "Выбранная карта не поддерживает автоматические списания");
      return;
    }

    setIsProcessing(true);

    try {
      // Генерируем описание заказа
      const orderDescription = `Заказ на сумму ${total} ₽ - ${cartItems.length} товаров`;
      
      // Выполняем оплату через API
      const result = await chargeCardMutation.mutateAsync({
        cardId: selectedCardId,
        amount: total,
        description: orderDescription,
        orderId: `order_${Date.now()}`,
      });

      if (result.success && result.data) {
        showSuccess("", t("checkout.payment.success_message"));

        navigate("/payment-success?orderId=" + result.data.orderId);
      } else {
        showError("", result.message || "Ошибка при оплате");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      showError("", error.message || "Произошла ошибка при оформлении заказа");
    } finally {
      setIsProcessing(false);
    }
  };

  // Обработчик добавления способа оплаты
  const handleAddPaymentMethod = () => {
    setShowPaymentDialog(true);
  };

  const handleCloseDialog = () => {
    setShowPaymentDialog(false);
    refetchCards();
  };

  const handleSavePaymentMethod = () => {
    setShowPaymentDialog(false);
    refetchCards();
  };

  // Расчет цен
  const subtotal = cart?.total || 0;
  const shipping = deliveryData?.tariff ? deliveryData.tariff.delivery_sum : 0;
  const discount = deliveryData?.promoCode
    ? Math.round(subtotal * (deliveryData.promoCode.discount / 100))
    : 0;
  const serviceFee = cartItems.reduce(
    (acc, item) => acc + Math.ceil(item.price * 0.1) * item.amount,
    0
  );
  const total = subtotal - discount + shipping + serviceFee;

  // Проверяем готовность для оплаты
  const selectedCard = userCards.find(card => card.cardId === selectedCardId);
  const canProceed = selectedCardId && acceptTerms && !isProcessing && selectedCard?.rebillId;

  // Определяем что нужно заполнить
  const getMissingItems = () => {
    const missing: string[] = [];

    if (!selectedCardId) {
      missing.push(t("checkout.payment.validation.missing_payment_method"));
    } else if (!selectedCard?.rebillId) {
      missing.push(t("checkout.payment.card_no_rebill_support"));
    }

    if (!acceptTerms) {
      missing.push(t("checkout.payment.validation.missing_agreement"));
    }

    return missing;
  };

  const missingItems = getMissingItems();

  const getCardIcon = () => {
    return "💳";
  };

  if (cartLoading || userLoading || cardsLoading) {
    return (
      <div className="flex flex-col gap-4 mx-auto py-16 mt-18 bg-[var(--bg-gray)]">
        <div className="container pb-21">
          <div className="flex justify-center items-center min-h-[200px]">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mx-auto py-16 mt-18 bg-[var(--bg-gray)]">
      <div className="container pb-21">
        {stepIndicator}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - Payment methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Methods */}
            <div
              className="bg-white rounded-lg p-6"
              style={{ borderRadius: "8px" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="lg:text-[30px] text-[20px] font-semibold text-[#121212]">
                  {t("checkout.payment.title")}
                </h3>
                <AppButton
                  variant="secondary"
                  size="sm"
                  onClick={handleAddPaymentMethod}
                  fullWidth={false}
                >
                  {t("checkout.payment.add_payment_method")}
                </AppButton>
              </div>

              {userCards.length > 0 ? (
                <div className="space-y-4">
                  {userCards.map((card) => (
                    <div
                      key={card.cardId}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedCardId === card.cardId
                          ? "border-[#F9B234] bg-[#F9B234]/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedCardId(card.cardId)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">{getCardIcon()}</span>
                            <div>
                              <h4 className="text-lg font-medium text-[#121212]">
                                {formatPan(card.pan)}
                              </h4>
                              {card.cardName && (
                                <p className="text-sm text-gray-600">
                                  {card.cardName}
                                </p>
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
                            {card.rebillId && (
                              <span className="px-2 py-1 rounded-full text-xs bg-[#F9B234]/20 text-[#B8860B]">
                                {t("checkout.payment.auto_charge_available")}
                              </span>
                            )}
                            {!card.rebillId && card.status === "Active" && (
                              <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                                {t("checkout.payment.manual_payment_only")}
                              </span>
                            )}
                            {card.expDate && (
                              <span className="text-gray-600">
                                {t("checkout.payment.expires")}:{" "}
                                {formatExpDate(card.expDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Selection indicator */}
                        <div className="ml-4">
                          <img
                            src={
                              selectedCardId === card.cardId
                                ? checkboxChecked
                                : checkboxUnchecked
                            }
                            alt="checkbox"
                            className="w-[34px] h-[34px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {t("checkout.payment.no_payment_methods")}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    {t("checkout.payment.no_payment_methods_desc")}
                  </p>
                  <AppButton
                    variant="secondary"
                    onClick={handleAddPaymentMethod}
                  >
                    {t("checkout.payment.add_payment_method")}
                  </AppButton>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Order Summary and Agreement */}
          <div className="lg:col-span-1">
            <div
              className="bg-white rounded-lg sticky top-4"
              style={{ borderRadius: "8px", padding: "30px" }}
            >
              {/* Title */}
              <h3
                className="lg:text-[30px] text-[20px] font-bold leading-none mb-6"
                style={{ color: "#121212" }}
              >
                {t("cart.summary.title")}
              </h3>

              {/* Divider */}
              <div
                className="w-full h-px mb-6"
                style={{ backgroundColor: "#B8B8B8" }}
              ></div>

              {/* Price breakdown */}
              <div className="space-y-1 mb-6">
                <div className="flex justify-between text-md text-[#121212]">
                  <span>{t("cart.summary.subtotal")}</span>
                  <span>
                    {new Intl.NumberFormat(i18n.language).format(subtotal)} ₽
                  </span>
                </div>

                <div className="flex justify-between text-md text-[#121212]">
                  <span>
                    {t("cart.summary.shipping")}
                    {deliveryData?.tariff && (
                      <span className="text-sm text-gray-500 block">
                        {deliveryData.tariff.tariff_name}
                      </span>
                    )}
                  </span>
                  <span>
                    {shipping === 0
                      ? t("cart.summary.shipping_free")
                      : `${new Intl.NumberFormat(i18n.language).format(
                          shipping
                        )} ₽`}
                  </span>
                </div>

                {deliveryData?.promoCode && (
                  <div className="flex justify-between text-md text-green-600">
                    <span>
                      {t("cart.summary.discount")} (
                      {deliveryData.promoCode.code})
                    </span>
                    <span>
                      -{new Intl.NumberFormat(i18n.language).format(discount)} ₽
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-md text-[#121212]">
                  <span>{t("bet_modals.service_fee")}</span>
                  <span>
                    {new Intl.NumberFormat(i18n.language).format(serviceFee)} ₽
                  </span>
                </div>

                {/* Total */}
                <div className="flex justify-between font-bold text-md text-[#121212]">
                  <span>{t("checkout.payment.order_total")}</span>
                  <span>
                    {new Intl.NumberFormat(i18n.language).format(total)} ₽
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div
                className="w-full h-px mb-6"
                style={{ backgroundColor: "#B8B8B8" }}
              ></div>

              {/* Agreement */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[#121212] mb-4">
                  {t("checkout.payment.agreement.title")}
                </h4>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        {...register("acceptTerms")}
                        className="hidden"
                      />
                      <img
                        src={acceptTerms ? checkboxChecked : checkboxUnchecked}
                        alt="checkbox"
                        className="w-[34px] h-[34px] cursor-pointer"
                        onClick={() => {
                          const checkbox = document.querySelector(
                            'input[name="acceptTerms"]'
                          ) as HTMLInputElement;
                          if (checkbox) {
                            checkbox.click();
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#121212]">
                        {t("checkout.payment.agreement.text")}{" "}
                        <a
                          href="/legal/offer"
                          className="text-[#F9B234] hover:underline"
                        >
                          {t("checkout.payment.agreement.terms")}
                        </a>
                        {", "}
                        <a
                          href="/legal/privacy-data-policy"
                          className="text-[#F9B234] hover:underline"
                        >
                          {t("checkout.payment.agreement.privacy")}
                        </a>{" "}
                        {t("checkout.payment.agreement.and")}{" "}
                        <a
                          href="/legal/auction-rules"
                          className="text-[#F9B234] hover:underline"
                        >
                          {t("checkout.payment.agreement.auction_rules")}
                        </a>
                      </p>
                    </div>
                  </div>

                  {errors.acceptTerms && (
                    <p className="text-red-500 text-sm ml-11">
                      {errors.acceptTerms.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div
                className="w-full h-px mb-6"
                style={{ backgroundColor: "#B8B8B8" }}
              ></div>

              {/* Pay button */}
              <AppButton
                variant="secondary"
                onClick={handleSubmit(handlePayment)}
                fullWidth
                disabled={!canProceed}
              >
                {isProcessing
                  ? t("checkout.payment.processing")
                  : t("checkout.payment.pay_now")}
              </AppButton>

              {/* Missing items hints */}
              {!canProceed && missingItems.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-medium mb-2">
                    {t("checkout.payment.validation.complete_required")}:
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {missingItems.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment method dialog */}
      <EditPaymentMethodDialog
        isOpen={showPaymentDialog}
        onClose={handleCloseDialog}
        onSave={handleSavePaymentMethod}
        isLoading={false}
      />
    </div>
  );
}
