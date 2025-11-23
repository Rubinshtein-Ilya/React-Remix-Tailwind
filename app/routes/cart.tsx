import { useTranslation } from "react-i18next";
import {
  useCart,
  useRemoveFromCart,
  useClearCart,
  useAddToCart,
} from "~/queries/cart";
import { AppButton } from "~/shared/buttons/AppButton";
import { useNavigate } from "react-router";
import { Spinner } from "~/shared/Spinner";
import { EmptyState } from "~/shared/EmptyState";
import {
  RiShoppingBag3Line,
  RiArrowDownSLine,
  RiCloseLine,
  RiAddLine,
  RiSubtractLine,
} from "@remixicon/react";
import { useNotifications } from "~/hooks/useNotifications";
import { useState } from "react";
import { Input } from "~/shared/inputs/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useValidatePromoCode } from "~/queries/promoCode";
import { useUserCartDeliveryTariffs } from "../queries/delivery";
import { useUserAddresses } from "../queries/user";

// Схема валидации для промокода
const promoCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Промокод должен содержать минимум 3 символа")
    .max(20, "Промокод не должен превышать 20 символов")
    .regex(
      /^[A-Z0-9]+$/,
      "Промокод может содержать только заглавные буквы и цифры"
    ),
});

type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: cartData, isLoading, error } = useCart();
  const removeFromCart = useRemoveFromCart();
  const addToCart = useAddToCart();
  // const clearCart = useClearCart();
  const { showSuccess, showError } = useNotifications();

  // Состояние для промокода
  const [isPromoExpanded, setIsPromoExpanded] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    minOrderAmount: number;
  } | null>(null);

  // Хук для валидации промокода
  const validatePromoCodeMutation = useValidatePromoCode();
  const { data: addressesData, isLoading: addressesLoading } =
    useUserAddresses();
  const cart = cartData?.cart;
  const cartItems = cart ? Object.values(cart.items || {}) : [];
  const { data: deliveryTariffs } = useUserCartDeliveryTariffs(
    addressesData?.addresses?.find((address) => address.isDefault)?._id || ""
  );
  const cheapestTariff = deliveryTariffs?.sort(
    (a: any, b: any) => a.delivery_sum - b.delivery_sum
  )[0];

  // Форма для промокода
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    mode: "onChange",
  });

  // Индикатор шагов процесса оформления заказа
  const stepIndicator = (
    <div className="flex items-center justify-center mb-12 mt-8">
      <div className="flex items-center">
        {/* Шаг 1: КОРЗИНА */}
        <div className="flex flex-col items-center">
          <span
            className="lg:text-[30px] text-[20px] font-bold leading-none"
            style={{ color: "#121212" }}
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
            style={{ color: "#B8B8B8" }}
          >
            {t("cart.steps.payment")}
          </span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
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

  if (error) {
    return (
      <div className="flex flex-col gap-4 mx-auto py-16 mt-15 bg-[var(--bg-gray)]">
        <div className="container pb-21">
          <div className="text-center py-8">
            <p className="text-red-500">{t("common.error_loading_data")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Обработчик применения промокода
  const onSubmitPromoCode = async (data: PromoCodeFormData) => {
    try {
      const result = await validatePromoCodeMutation.mutateAsync({
        code: data.code.toUpperCase(),
      });

      if (result.success && result.data) {
        // Проверяем минимальную сумму заказа
        if (
          result.data.minOrderAmount > 0 &&
          subtotal < result.data.minOrderAmount
        ) {
          showError(
            "",
            `Минимальная сумма заказа для применения промокода: ${new Intl.NumberFormat(
              i18n.language
            ).format(result.data.minOrderAmount)} ₽`
          );
          return;
        }

        setAppliedPromo({
          code: result.data.code,
          discount: result.data.discount,
          minOrderAmount: result.data.minOrderAmount,
        });
        showSuccess("", "Промокод успешно применен");
        reset();
        setIsPromoExpanded(false);
      }
    } catch (error) {
      // Ошибка уже обработана в хуке useValidatePromoCode
    }
  };

  // Расчет цен
  const subtotal = cart?.total || 0;
  const serviceFee = cartItems.reduce(
    (acc, item) => acc + Math.ceil(item.price * 0.1) * item.amount,
    0
  );
  const shipping = cheapestTariff?.delivery_sum || 1000;
  const discount = appliedPromo
    ? Math.round(subtotal * (appliedPromo.discount / 100))
    : 0;
  const total = subtotal - discount + shipping + serviceFee;

  const handleIncreaseQuantity = async (itemId: string, size: string) => {
    try {
      await addToCart.mutateAsync({ itemId, size, amount: 1 });
    } catch (error) {
      showError("", "common.error");
    }
  };

  const handleDecreaseQuantity = async (
    itemId: string,
    size: string,
    currentAmount: number
  ) => {
    try {
      if (currentAmount === 1) {
        // Если остался только 1 товар, удаляем полностью
        await removeFromCart.mutateAsync({ itemId, size, amount: 1 });
        showSuccess("", "cart.item_removed");
      } else {
        await removeFromCart.mutateAsync({ itemId, size, amount: 1 });
      }
    } catch (error) {
      showError("", "common.error");
    }
  };

  if (!cart || cartItems.length === 0) {
    return (
      <div className="flex flex-col gap-4 mx-auto py-16 mt-18 bg-[var(--bg-gray)]">
        <div className="container pb-21">
          {stepIndicator}
          <EmptyState
            icon={<RiShoppingBag3Line size={48} />}
            title={t("cart.empty_title")}
            description={t("cart.empty_description")}
            action={
              <AppButton variant="secondary" onClick={() => navigate("/")}>
                {t("cart.continue_shopping")}
              </AppButton>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mx-auto py-16 mt-18 bg-[var(--bg-gray)]">
      <div className="container pb-21">
        {stepIndicator}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => {
                const isAuction = item.salesMethod === "bidding";
                return (
                  <div
                    key={`${item._id}-${item.size}`}
                    className="bg-white rounded-lg p-6"
                    style={{ borderRadius: "8px" }}
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0">
                        {item.image || item.thumbnail ? (
                          <img
                            src={item.image || item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                            <RiShoppingBag3Line
                              size={24}
                              className="text-gray-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          {/* Product Title */}
                          <h3 className="font-semibold text-xl text-[#121212]">
                            {item.title}
                          </h3>

                          {/* Price */}
                          <div className="text-right">
                            <p className="font-bold text-xl text-[#121212]">
                              {new Intl.NumberFormat(i18n.language).format(
                                item.price * item.amount
                              )}{" "}
                              ₽
                            </p>
                            {item.amount > 1 && (
                              <p className="text-sm text-gray-500">
                                {new Intl.NumberFormat(i18n.language).format(
                                  item.price
                                )}{" "}
                                ₽ {t("cart.per_item")}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Brief Info */}
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-gray-600">
                            {t("cart.size")}: {t(`cart.sizes.${item.size}`)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t("cart.quantity")}: {item.amount}
                          </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-4">
                            {/* Quantity Controls - только для не аукционных товаров */}
                            {!isAuction && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleDecreaseQuantity(
                                      item._id,
                                      item.size,
                                      item.amount
                                    )
                                  }
                                  disabled={removeFromCart.isPending}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                                  title={t("cart.item.decrease")}
                                >
                                  <RiSubtractLine size={16} />
                                </button>

                                <span className="mx-2 min-w-[24px] text-center font-medium">
                                  {item.amount}
                                </span>

                                <button
                                  onClick={() =>
                                    handleIncreaseQuantity(item._id, item.size)
                                  }
                                  disabled={addToCart.isPending}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                                  title={t("cart.item.increase")}
                                >
                                  <RiAddLine size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Add Packaging Link */}
                        {/* TODO: Enable  once designer is ready */}
                        {/* <button
                          className="text-sm text-[var(--text-primary)] underline font-semibold transition-colors"
                          onClick={() => {
                            navigate(
                              `/product-designer?productId=${item._id}`
                            );
                          }}
                        >
                          {t("cart.item.add_packaging")}
                        </button> */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Block */}
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
                  <span>{t("bet_modals.service_fee")}</span>
                  <span>
                    {new Intl.NumberFormat(i18n.language).format(serviceFee)} ₽
                  </span>
                </div>

                <div className="flex justify-between text-md text-[#121212]">
                  <span>{t("cart.summary.shipping")}</span>
                  <span>
                    {shipping === 0
                      ? t("cart.summary.shipping_free")
                      : `${shipping} ₽`}
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between items-center text-md text-green-600">
                    <span>
                      {t("cart.summary.discount")} ({appliedPromo.code})
                    </span>
                    <div className="flex items-center gap-2">
                      <span>
                        -{new Intl.NumberFormat(i18n.language).format(discount)}{" "}
                        ₽
                      </span>
                      <button
                        onClick={() => setAppliedPromo(null)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <RiCloseLine size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between font-bold text-md text-[#121212]">
                  <span>{t("cart.total")}</span>
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

              {/* Promo code section */}
              <div className="mb-6">
                <button
                  onClick={() => setIsPromoExpanded(!isPromoExpanded)}
                  className="flex items-center justify-between w-full text-left text-md text-[#121212] hover:opacity-70 transition-opacity"
                >
                  <span>{t("cart.summary.promo_code")}</span>
                  <RiArrowDownSLine
                    size={24}
                    className={`transform transition-transform ${
                      isPromoExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isPromoExpanded && (
                  <div className="mt-4">
                    <Input
                      {...register("code")}
                      placeholder={t("cart.summary.promo_placeholder")}
                      error={errors.code?.message}
                      className="uppercase"
                      autoComplete="off"
                      submitButton={{
                        onSubmit: handleSubmit(onSubmitPromoCode),
                        disabled:
                          !isValid || validatePromoCodeMutation.isPending,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Divider */}
              <div
                className="w-full h-px mb-6"
                style={{ backgroundColor: "#B8B8B8" }}
              ></div>

              {/* Continue button */}
              <AppButton
                variant="secondary"
                onClick={() => navigate("/checkout/delivery")}
                fullWidth
              >
                {t("cart.summary.continue")}
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
