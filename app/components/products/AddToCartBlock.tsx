import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton } from "~/shared/buttons/AppButton";
import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAddToCart } from "~/queries/cart";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/queries/auth";
import { useItemDeliveryTariffs } from "~/queries/delivery";
import type { IItem } from "server/models/Item";

// Типы размеров (синхронизировано с сервером)
const sizeOptions = ["xs", "s", "m", "l", "xl", "oneSize"] as const;
type AllowedSizes = (typeof sizeOptions)[number];

interface IProps {
  itemId: string;
  price: number;
  productName: string;
  item: IItem;
  availableSizes?: AllowedSizes[]; // Доступные размеры для товара
}

// Схема валидации формы
const addToCartSchema = z.object({
  size: z.enum(sizeOptions, {
    required_error: "Необходимо выбрать размер",
  }),
  amount: z.number().min(1, "Количество должно быть больше 0"),
});

type AddToCartFormData = z.infer<typeof addToCartSchema>;

function AddToCartBlock({ itemId, price, productName, availableSizes = ["m"], item }: IProps) {
  const { t, i18n } = useTranslation();
  const [showCostDetails, setShowCostDetails] = useState(false);
  const { user } = useUser();
  const { showSuccess, showError } = useNotifications();
  const addToCartMutation = useAddToCart();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AddToCartFormData>({
    resolver: zodResolver(addToCartSchema),
    defaultValues: {
      size: availableSizes[0], // Устанавливаем первый доступный размер по умолчанию
      amount: 1,
    },
  });
  const { data: deliveryTariffs, isLoading: deliveryLoading } = useItemDeliveryTariffs(
    user?.addresses?.find((address) => address.isDefault)?._id,
    item._id
  );

  const deliveryCost =
    Math.min(...(deliveryTariffs?.map((tariff: any) => tariff.delivery_sum) || [])) || 500;
  const serviceFee = Math.ceil((price + deliveryCost) * 0.1); // 10% комиссия
  const totalCost = price + deliveryCost + serviceFee;

  const onSubmit = async (data: AddToCartFormData) => {
    if (!user) {
      showError("", "common.login_required");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        itemId,
        size: data.size,
        amount: data.amount,
      });

      showSuccess("", "cart.added_to_cart");
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      const errorMessage = error?.response?.data?.message || "Ошибка при добавлении в корзину";
      showError(errorMessage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="text-xs sm:text-[1.0625rem] flex flex-col gap-4"
    >
      <div className="font-medium text-2xl sm:text-3xl text-[var(--text-primary)] leading-[100%]">
        {new Intl.NumberFormat(i18n.language).format(price)} ₽
      </div>

      {/* Выбор размера */}
      {/* <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-primary)]">
          {t("cart.select_size")}
        </label>
        <select
          {...register("size")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
          }}
        >
          {availableSizes.map((size) => (
            <option key={size} value={size}>
              {t(`cart.sizes.${size}`)}
            </option>
          ))}
        </select>
        {errors.size && (
          <span className="text-red-500 text-xs">{errors.size.message}</span>
        )}
      </div> */}

      {/* Кнопка добавления в корзину */}
      <AppButton
        type="submit"
        variant="secondary"
        disabled={!isValid || addToCartMutation.isPending || !user}
      >
        {addToCartMutation.isPending
          ? t("common.loading")
          : t("singleProduct.addToCartBlock.addToCart")}
      </AppButton>

      {/* Блок с общей суммой и деталями */}
      <div className="flex flex-col gap-2 w-full">
        {/* Общая сумма с раскрывающимися деталями */}
        <div
          className="flex items-center text-lg font-medium leading-6 cursor-pointer w-full"
          onClick={() => setShowCostDetails(!showCostDetails)}
        >
          {t("bet_modals.total_to_pay", {
            amount: new Intl.NumberFormat(i18n.language).format(totalCost),
          })}
          {showCostDetails ? (
            <RiArrowUpSLine size={24} className="ml-auto" />
          ) : (
            <RiArrowDownSLine size={24} className="ml-auto" />
          )}
        </div>

        {/* Выпадающие детали */}
        {showCostDetails && (
          <div className="w-full flex flex-col gap-1 border border-[var(--border-gray)] rounded-lg p-4 text-[15px] font-normal leading-4 tracking-[-2%]">
            <div className="flex justify-between">
              <span>{productName || "Название товара"}</span>
              <span>{new Intl.NumberFormat(i18n.language).format(price)} ₽</span>
            </div>
            <div className="flex justify-between">
              <span>{t("bet_modals.service_fee")}</span>
              <span>{new Intl.NumberFormat(i18n.language).format(serviceFee)} ₽</span>
            </div>
            <div className="flex justify-between">
              <span>{t("bet_modals.delivery_cost")}</span>
              <span>{new Intl.NumberFormat(i18n.language).format(deliveryCost)} ₽</span>
            </div>

            <div className="flex justify-between pt-2 border-t border-[var(--border-gray)] font-bold">
              <span>{t("bet_modals.total")}</span>
              <span>{new Intl.NumberFormat(i18n.language).format(totalCost)} ₽</span>
            </div>
          </div>
        )}

        {/* info */}
        <div className="text-[12px] font-normal leading-5 text-[var(--text-muted)]">
          {t("bet_modals.cost_includes")}
        </div>
      </div>
    </form>
  );
}

export default AddToCartBlock;
