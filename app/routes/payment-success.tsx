import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";
import { Spinner } from "~/shared/Spinner";
import { formatDate } from "~/utils/dateUtils";
import { useOrderById } from "~/queries/user";

interface PaymentData {
  paymentId: string;
  orderId: string;
  amount: number;
  status: string;
  deliveryData?: {
    contactInfo: {
      firstName: string;
      lastName: string;
      middleName?: string;
      phone: string;
    };
    addressId: string;
    tariff?: {
      tariff_name: string;
      delivery_sum: number;
      period_min: number;
      period_max: number;
    };
    promoCode?: {
      code: string;
      discount: number;
    };
  };
  cartData?: {
    items: Record<string, any>;
    total: number;
    totals?: {
      subtotal: number;
      serviceFee: number;
      shipping: number;
      discount: number;
      total: number;
    };
  };
  timestamp: string;
  order?: {
    id: string;
    total: number;
    amount: number;
    status: string;
    createdAt: string;
  };
}

export default function PaymentSuccessPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const orderId = searchParams.get("orderId");

  // Загружаем данные заказа с сервера
  const {
    data: orderResponse,
    isLoading: orderLoading,
    error: orderError,
  } = useOrderById(orderId || "");

  // Если нет orderId, перенаправляем на главную
  useEffect(() => {
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);

  if (orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-gray)]">
        <Spinner />
      </div>
    );
  }

  // Если есть ошибка или нет данных заказа и нет fallback данных
  if ((orderError || !orderResponse) && !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-gray)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t("common.error")}
          </h1>
          <p className="text-gray-600 mb-6">
            Заказ не найден или произошла ошибка при загрузке
          </p>
          <AppButton variant="primary" onClick={() => navigate("/")}>
            На главную
          </AppButton>
        </div>
      </div>
    );
  }

  // Используем данные с сервера или fallback из localStorage
  const order = orderResponse?.order;

  // Если есть данные заказа с сервера, используем их
  if (order) {
    const cartItems = Object.values(order.items || {});
    const itemCount = cartItems.length;

    return (
      <div className="min-h-screen bg-[var(--bg-gray)] py-16 px-4 mt-20">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок с иконкой успеха */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-green-600"
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
            <h1 className="text-3xl lg:text-4xl font-bold text-[#121212] mb-4">
              {t("payment_success.title")}
            </h1>
            <p className="text-lg text-[#121212] mb-2">
              {t("payment_success.subtitle")}
            </p>
            <p className="text-[#121212] font-medium">
              {t("payment_success.messages.thank_you")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Левый блок - информация о заказе */}
            <div className="lg:col-span-2 space-y-6">
              {/* Информация о заказе */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#121212] mb-4">
                  {t("payment_success.order_info.title")}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("payment_success.order_info.order_number")}:
                    </span>
                    <span className="font-medium text-[#121212]">
                      {order._id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("payment_success.order_info.amount")}:
                    </span>
                    <span className="font-medium text-[#121212]">
                      {new Intl.NumberFormat(i18n.language).format(order.total)}{" "}
                      ₽
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("payment_success.order_info.date")}:
                    </span>
                    <span className="font-medium text-[#121212]">
                      {formatDate(order.createdAt, i18n.language)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("payment_success.order_info.items")}:
                    </span>
                    <span className="font-medium text-[#121212]">
                      {itemCount > 1
                        ? t("payment_success.order_info.items_count_plural", {
                            count: itemCount,
                          })
                        : t("payment_success.order_info.items_count", {
                            count: itemCount,
                          })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Информация о доставке */}
              {order.delivery && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-[#121212] mb-4">
                    {t("payment_success.delivery_info.title")}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("payment_success.delivery_info.method")}:
                      </span>
                      <span className="font-medium text-[#121212]">
                        {order.delivery.service === "cdek"
                          ? "СДЭК"
                          : order.delivery.service === "pickup"
                          ? "Самовывоз"
                          : order.delivery.service === "courier"
                          ? "Курьер"
                          : "СДЭК"}
                      </span>
                    </div>
                    {order.address && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {t("profile.address.title")}:
                        </span>
                        <span className="font-medium text-[#121212]">
                          {order.address.street}, {order.address.city},{" "}
                          {order.address.country}, {order.address.postalCode}
                        </span>
                      </div>
                    )}
                    {order.delivery.deliverySum !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {t("payment_success.delivery_info.cost")}:
                        </span>
                        <span className="font-medium text-[#121212]">
                          {order.delivery.deliverySum === 0
                            ? t("cart.summary.shipping_free")
                            : `${new Intl.NumberFormat(i18n.language).format(
                                order.delivery.deliverySum
                              )} ₽`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-[#F9B234]/10 rounded-lg">
                    <p className="text-sm text-[#B8860B]">
                      {t("payment_success.delivery_info.tracking_desc")}
                    </p>
                  </div>
                </div>
              )}

              {/* Следующие шаги */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#121212] mb-4">
                  {t("payment_success.next_steps.title")}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-medium">
                        1
                      </span>
                    </div>
                    <p className="text-gray-700">
                      {t("payment_success.next_steps.step1")}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        2
                      </span>
                    </div>
                    <p className="text-gray-700">
                      {t("payment_success.next_steps.step2")}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        3
                      </span>
                    </div>
                    <p className="text-gray-700">
                      {t("payment_success.next_steps.step3")}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        4
                      </span>
                    </div>
                    <p className="text-gray-700">
                      {t("payment_success.next_steps.step4")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Правый блок - детали оплаты */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4">
                <h2 className="text-xl font-semibold text-[#121212] mb-4">
                  {t("payment_success.payment_info.title")}
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {t("payment_success.payment_info.total")}:
                    </span>
                    <span className="text-[#121212]">
                      {new Intl.NumberFormat(i18n.language).format(order.total)}{" "}
                      ₽
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <AppButton
                    variant="primary"
                    fullWidth
                    onClick={() => navigate("/profile/my-orders")}
                  >
                    {t("payment_success.actions.view_orders")}
                  </AppButton>
                  <AppButton
                    variant="secondary"
                    fullWidth
                    onClick={() => navigate("/")}
                  >
                    {t("payment_success.actions.continue_shopping")}
                  </AppButton>
                </div>

                <div className="mt-6 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    {t("payment_success.messages.receipt_sent")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: используем данные из localStorage если нет данных с сервера
  if (!paymentData) {
    return null;
  }

  const cartItems = paymentData.cartData
    ? Object.values(paymentData.cartData.items || {})
    : [];
  const itemCount = cartItems.length;

  // Расчет сумм для fallback
  const totals = paymentData.cartData?.totals;
  const subtotal = totals?.subtotal || paymentData.cartData?.total || 0;
  const serviceFee =
    totals?.serviceFee ||
    cartItems.reduce(
      (acc: number, item: any) =>
        acc + Math.ceil(item.price * 0.1) * item.amount,
      0
    );
  const shipping =
    totals?.shipping || paymentData.deliveryData?.tariff?.delivery_sum || 0;
  const discount =
    totals?.discount ||
    (paymentData.deliveryData?.promoCode
      ? Math.round(
          subtotal * (paymentData.deliveryData.promoCode.discount / 100)
        )
      : 0);
  const total = totals?.total || paymentData.amount;

  return (
    <div className="min-h-screen bg-[var(--bg-gray)] py-16 px-4 mt-16">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок с иконкой успеха */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-green-600"
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
          <h1 className="text-3xl lg:text-4xl font-bold text-[#121212] mb-4">
            {t("payment_success.title")}
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            {t("payment_success.subtitle")}
          </p>
          <p className="text-green-600 font-medium">
            {t("payment_success.messages.thank_you")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левый блок - информация о заказе */}
          <div className="lg:col-span-2 space-y-6">
            {/* Информация о заказе */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#121212] mb-4">
                {t("payment_success.order_info.title")}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("payment_success.order_info.order_number")}:
                  </span>
                  <span className="font-medium text-[#121212]">
                    {paymentData.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("payment_success.order_info.payment_id")}:
                  </span>
                  <span className="font-medium text-[#121212]">
                    {paymentData.paymentId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("payment_success.order_info.amount")}:
                  </span>
                  <span className="font-medium text-[#121212]">
                    {new Intl.NumberFormat(i18n.language).format(
                      paymentData.amount
                    )}{" "}
                    ₽
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("payment_success.order_info.status")}:
                  </span>
                  <span className="font-medium text-green-600">
                    {paymentData.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("payment_success.order_info.date")}:
                  </span>
                  <span className="font-medium text-[#121212]">
                    {formatDate(paymentData.timestamp, i18n.language)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("payment_success.order_info.items")}:
                  </span>
                  <span className="font-medium text-[#121212]">
                    {itemCount > 1
                      ? t("payment_success.order_info.items_count_plural", {
                          count: itemCount,
                        })
                      : t("payment_success.order_info.items_count", {
                          count: itemCount,
                        })}
                  </span>
                </div>
              </div>
            </div>

            {/* Информация о доставке */}
            {paymentData.deliveryData && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#121212] mb-4">
                  {t("payment_success.delivery_info.title")}
                </h2>
                <div className="space-y-3">
                  {paymentData.deliveryData.tariff && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("payment_success.delivery_info.method")}:
                      </span>
                      <span className="font-medium text-[#121212]">
                        {paymentData.deliveryData.tariff.tariff_name}
                      </span>
                    </div>
                  )}
                  {paymentData.deliveryData.tariff && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("payment_success.delivery_info.period")}:
                      </span>
                      <span className="font-medium text-[#121212]">
                        {paymentData.deliveryData.tariff.period_min}-
                        {paymentData.deliveryData.tariff.period_max} дней
                      </span>
                    </div>
                  )}
                  {paymentData.deliveryData.tariff && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("payment_success.delivery_info.cost")}:
                      </span>
                      <span className="font-medium text-[#121212]">
                        {shipping === 0
                          ? t("cart.summary.shipping_free")
                          : `${new Intl.NumberFormat(i18n.language).format(
                              shipping
                            )} ₽`}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-[#F9B234]/10 rounded-lg">
                  <p className="text-sm text-[#B8860B]">
                    {t("payment_success.delivery_info.tracking_desc")}
                  </p>
                </div>
              </div>
            )}

            {/* Следующие шаги */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#121212] mb-4">
                {t("payment_success.next_steps.title")}
              </h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-medium">
                      1
                    </span>
                  </div>
                  <p className="text-gray-700">
                    {t("payment_success.next_steps.step1")}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">2</span>
                  </div>
                  <p className="text-gray-700">
                    {t("payment_success.next_steps.step2")}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">3</span>
                  </div>
                  <p className="text-gray-700">
                    {t("payment_success.next_steps.step3")}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">4</span>
                  </div>
                  <p className="text-gray-700">
                    {t("payment_success.next_steps.step4")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Правый блок - детали оплаты */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4">
              <h2 className="text-xl font-semibold text-[#121212] mb-4">
                {t("payment_success.payment_info.title")}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {t("payment_success.payment_info.subtotal")}:
                  </span>
                  <span className="text-[#121212]">
                    {new Intl.NumberFormat(i18n.language).format(subtotal)} ₽
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {t("payment_success.payment_info.service_fee")}:
                  </span>
                  <span className="text-[#121212]">
                    {new Intl.NumberFormat(i18n.language).format(serviceFee)} ₽
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {t("payment_success.payment_info.shipping")}:
                  </span>
                  <span className="text-[#121212]">
                    {shipping === 0
                      ? t("cart.summary.shipping_free")
                      : `${new Intl.NumberFormat(i18n.language).format(
                          shipping
                        )} ₽`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {t("payment_success.payment_info.discount")}:
                    </span>
                    <span className="text-green-600">
                      -{new Intl.NumberFormat(i18n.language).format(discount)} ₽
                    </span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[#121212]">
                      {t("payment_success.payment_info.total")}:
                    </span>
                    <span className="text-[#121212]">
                      {new Intl.NumberFormat(i18n.language).format(total)} ₽
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <AppButton
                  variant="primary"
                  fullWidth
                  onClick={() => navigate("/profile/my-orders")}
                >
                  {t("payment_success.actions.view_orders")}
                </AppButton>
                <AppButton
                  variant="secondary"
                  fullWidth
                  onClick={() => navigate("/")}
                >
                  {t("payment_success.actions.continue_shopping")}
                </AppButton>
              </div>

              <div className="mt-6 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  {t("payment_success.messages.receipt_sent")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
