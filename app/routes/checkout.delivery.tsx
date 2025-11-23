import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  redirect,
  useLoaderData,
  useNavigate,
  type LoaderFunction,
} from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton } from "~/shared/buttons/AppButton";
import { Input } from "~/shared/inputs/Input";
import { Spinner } from "~/shared/Spinner";
import { useNotifications } from "~/hooks/useNotifications";
import { useCart, useAddCartDeliveryData } from "~/queries/cart";
import { useUser } from "~/queries/auth";
import {
  useUserAddresses,
  useAddAddress,
  useUpdateAddress,
  useSetDefaultAddress,
} from "~/queries/user";
import { useValidatePromoCode } from "~/queries/promoCode";
import { useUserCartDeliveryTariffs } from "~/queries/delivery";
import { AddressDialog } from "~/components/Dialogs/AddressDialog";
import type { DeliveryTariff } from "~/api/delivery";
import type { UserAddress } from "~/types/user";
import {
  RiArrowDownSLine,
  RiCloseLine,
  RiEditLine,
  RiAddLine,
} from "@remixicon/react";
import checkboxUnchecked from "~/assets/images/private/checkbox-unchecked.svg";
import checkboxChecked from "~/assets/images/private/checkbox-checked.svg";
import { YandexConfigProvider } from "~/contexts/YandexConfigContext";
import { getYandexConfig } from "../loaders/yandexConfig";

export const loader: LoaderFunction = async ({ request, context }) => {
  try {
    // Используем данные пользователя из контекста вместо fetch запроса
    if (!context?.user || !context?.isAuthenticated) {
      console.log(
        "Private layout: пользователь не авторизован, перенаправляем на главную"
      );
      return redirect("/");
    }
    // Получаем конфигурацию Яндекс
    const yandexConfig = await getYandexConfig();

    return {
      yandexConfig,
    };
  } catch (err) {
    console.error(err);
    return redirect("/");
  }
};

// Схема валидации для контактной информации
const contactInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(50, "Имя не должно превышать 50 символов"),
  lastName: z
    .string()
    .min(2, "Фамилия должна содержать минимум 2 символа")
    .max(50, "Фамилия не должна превышать 50 символов"),
  middleName: z
    .string()
    .max(50, "Отчество не должно превышать 50 символов")
    .optional(),
  phone: z.string().min(1, "Введите номер телефона"),
});

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

type ContactInfoFormData = z.infer<typeof contactInfoSchema>;
type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

export default function DeliveryPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const { yandexConfig } = useLoaderData<{
    yandexConfig: { apiKey: string; mapApiKey: string };
  }>();
  // Состояние для промокода
  const [isPromoExpanded, setIsPromoExpanded] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    minOrderAmount: number;
  } | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >(undefined);
  const [selectedTariff, setSelectedTariff] = useState<DeliveryTariff | null>(
    null
  );
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<'express' | 'standard' | null>(null);

  // Состояние для диалогов адресов
  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = useState(false);
  const [isEditAddressDialogOpen, setIsEditAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | undefined>(
    undefined
  );

  // Хуки данных
  const { data: cartData, isLoading: cartLoading } = useCart();
  const { user, loading: userLoading } = useUser();
  const { data: addressesData, isLoading: addressesLoading } =
    useUserAddresses();
  const validatePromoCodeMutation = useValidatePromoCode();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();

  const addCartDeliveryDataMutation = useAddCartDeliveryData();

  const cart = cartData?.cart;
  const addresses = addressesData?.addresses || [];

  // Получаем тарифы доставки СДЭК по ID адреса
  const { data: deliveryTariffs, isLoading: deliveryLoading } =
    useUserCartDeliveryTariffs(selectedAddressId);

  // Группируем тарифы по типам
  const standardTariffs = deliveryTariffs?.filter(tariff => tariff.tariff_code === 137) || [];
  const expressTariffs = deliveryTariffs?.filter(tariff => 
    [778, 787, 796, 805].includes(tariff.tariff_code)
  ) || [];

  // Вычисляем минимальные значения для экспресс-доставки
  const minExpressPeriod = expressTariffs.length > 0 ? Math.min(...expressTariffs.map(t => t.period_min)) : 0;
  const minExpressPrice = expressTariffs.length > 0 ? Math.min(...expressTariffs.map(t => t.delivery_sum)) : 0;

  // Обработчики для выбора доставки
  const handleDeliveryTypeChange = (type: 'express' | 'standard') => {
    setSelectedDeliveryType(type);
    setSelectedTariff(null);
  };

  const handleTariffSelect = (tariff: DeliveryTariff) => {
    setSelectedTariff(tariff);
    if (tariff.tariff_code === 137) {
      setSelectedDeliveryType('standard');
    } else {
      setSelectedDeliveryType('express');
    }
  };

  // Форма для контактной информации
  const {
    register: registerContact,
    handleSubmit: handleSubmitContact,
    formState: { errors: contactErrors, isValid: isContactValid },
    setValue: setContactValue,
    reset: resetContactForm,
  } = useForm<ContactInfoFormData>({
    resolver: zodResolver(contactInfoSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      phone: "",
    },
  });

  // Обновляем форму когда данные пользователя загружаются
  useEffect(() => {
    if (user) {
      const nameParts =
        user.firstName && user.lastName
          ? [user.firstName, user.lastName]
          : user.firstName || user.lastName
          ? [user.firstName || user.lastName]
          : [];

      const firstName = nameParts[0] || "";
      const lastName = nameParts[1] || "";
      const middleName = user.middleName || "";
      const phoneValue = user.phone || "";
      const formattedPhone = phoneValue.startsWith("+")
        ? phoneValue
        : phoneValue
        ? `+7${phoneValue}`
        : "";

      setContactValue("firstName", firstName, { shouldValidate: true });
      setContactValue("lastName", lastName, { shouldValidate: true });
      setContactValue("middleName", middleName, { shouldValidate: true });
      setContactValue("phone", formattedPhone, { shouldValidate: true });
    }
  }, [user, setContactValue]);

  // Автоматически выбираем адрес по умолчанию
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id!);
      }
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (!cartLoading && !Object.keys(cartData?.cart.items || {}).length) {
      navigate("/");
    }
  }, [cartLoading, cartData, navigate]);

  // Форма для промокода
  const {
    register: registerPromo,
    handleSubmit: handleSubmitPromo,
    formState: { errors: promoErrors, isValid: isPromoValid },
    reset: resetPromo,
  } = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    mode: "onChange",
  });

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
            style={{ color: "#121212" }}
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

  // Обработчик применения промокода
  const onSubmitPromoCode = async (data: PromoCodeFormData) => {
    try {
      const result = await validatePromoCodeMutation.mutateAsync({
        code: data.code.toUpperCase(),
      });

      if (result.success && result.data) {
        const subtotal = cart?.total || 0;
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
        resetPromo();
        setIsPromoExpanded(false);
      }
    } catch (error) {
      // Ошибка уже обработана в хуке useValidatePromoCode
    }
  };

  // Расчет цен - синхронизируем с T-Bank
  const subtotal = cart?.total || 0;
  const shipping = selectedTariff ? selectedTariff.delivery_sum : 0;
  const discount = appliedPromo
    ? Math.round(subtotal * (appliedPromo.discount / 100))
    : 0;
  // Используем ту же формулу, что и в T-Bank
  const serviceFee = Object.values(cart?.items || {}).reduce(
    (acc, item) => acc + Math.ceil(item.price * 0.1) * item.amount,
    0
  );
  const total = subtotal + serviceFee - discount + shipping;

  // Функция для извлечения времени из названия тарифа
  const getTimeFromTariff = (tariff: DeliveryTariff) => {
    // извлекаем 2 цифры из строки
    const timeMatch = tariff.tariff_name.match(/\d{2}/);
    return timeMatch ? timeMatch[0] : '';
  };

  // Проверяем готовность для продолжения
  const canContinue = isContactValid && selectedAddressId && selectedTariff;

  // Определяем что нужно заполнить
  const getMissingItems = () => {
    const missing: string[] = [];

    if (!isContactValid) {
      missing.push(t("checkout.validation.missing_contact_info"));
    }

    if (!selectedAddressId) {
      missing.push(t("checkout.validation.missing_address"));
    }

    if (!selectedTariff) {
      missing.push(t("checkout.validation.missing_delivery"));
    }

    return missing;
  };

  const missingItems = getMissingItems();

  // Обработчики диалогов адресов
  const handleAddAddress = async (addressData: any) => {
    try {
      await addAddressMutation.mutateAsync(addressData);
      setIsAddAddressDialogOpen(false);
      showSuccess("", t("checkout.messages.address_added"));
    } catch (error) {
      showError("", t("checkout.messages.address_add_failed"));
    }
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setIsEditAddressDialogOpen(true);
  };

  const handleUpdateAddress = async (addressData: any) => {
    if (!editingAddress?._id) return;

    try {
      await updateAddressMutation.mutateAsync({
        addressId: editingAddress._id,
        addressData,
      });
      setIsEditAddressDialogOpen(false);
      setEditingAddress(undefined);
      showSuccess("", t("checkout.messages.address_updated"));
    } catch (error) {
      showError("", t("checkout.messages.address_update_failed"));
    }
  };

  // Функция для сохранения данных формы и перехода к оплате
  const onSubmitAndContinue = async (data: ContactInfoFormData) => {
    if (!selectedAddressId) {
      showError("", t("checkout.validation.select_address"));
      return;
    }
    if (!selectedTariff) {
      showError("", t("checkout.validation.select_delivery"));
      return;
    }

    // Сохраняем данные доставки в localStorage
    const deliveryData = {
      contactInfo: data,
      addressId: selectedAddressId,
      tariff: selectedTariff,
      deliveryType: selectedDeliveryType,
      promoCode: appliedPromo,
    };

    try {
      await addCartDeliveryDataMutation.mutateAsync({
        personalInfo: {
          name: data.firstName,
          surname: data.lastName,
          phone: data.phone,
        },
        address: {
          _id: selectedAddressId,
        },
        delivery: {
          service: "cdek",
          tariffCode: selectedTariff.tariff_code,
          deliverySum: selectedTariff.delivery_sum,
        },
        // Добавляем промокод и итоговые суммы
        promoCode: appliedPromo
          ? {
              code: appliedPromo.code,
              discount: appliedPromo.discount,
              discountAmount: discount,
              minOrderAmount: appliedPromo.minOrderAmount,
            }
          : undefined,
        totals: {
          subtotal,
          serviceFee,
          shipping,
          discount,
          total,
        },
      });

      localStorage.setItem(
        "checkoutDeliveryData",
        JSON.stringify(deliveryData)
      );

      navigate("/checkout/payment");
    } catch (error) {
      showError("Что-то пошло не так");
    }
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      showError("", t("checkout.validation.select_address"));
      return;
    }
    if (!selectedTariff) {
      showError("", t("checkout.validation.select_delivery"));
      return;
    }
    if (!isContactValid) {
      showError("", t("checkout.validation.fill_contact_info"));
      return;
    }

    // Используем handleSubmit для валидации и получения данных
    handleSubmitContact(onSubmitAndContinue)();
  };

  if (cartLoading || userLoading) {
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
          {/* Left side - Contact info and addresses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div
              className="bg-white rounded-lg p-6"
              style={{ borderRadius: "8px" }}
            >
              <h3 className="text-xl font-semibold text-[#121212] mb-6">
                {t("checkout.contact_info.title")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...registerContact("firstName")}
                  placeholder={t("checkout.contact_info.first_name")}
                  error={contactErrors.firstName?.message}
                />
                <Input
                  {...registerContact("lastName")}
                  placeholder={t("checkout.contact_info.last_name")}
                  error={contactErrors.lastName?.message}
                />
              </div>

              <div className="mt-4">
                <Input
                  {...registerContact("middleName")}
                  placeholder={t("checkout.contact_info.middle_name")}
                  error={contactErrors.middleName?.message}
                />
              </div>

              <div className="mt-4">
                <Input
                  {...registerContact("phone")}
                  placeholder={t("checkout.contact_info.phone")}
                  error={contactErrors.phone?.message}
                />
              </div>
            </div>

            {/* Address Selection */}
            <div
              className="bg-white rounded-lg p-6"
              style={{ borderRadius: "8px" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-[#121212]">
                  {t("checkout.address.title")}
                </h3>
                <AppButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddAddressDialogOpen(true)}
                  className="flex items-center gap-2 flex-0 min-w-[200px]"
                >
                  <RiAddLine size={16} />
                  {t("checkout.address.add_address")}
                </AppButton>
              </div>

              {addressesLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAddressId === address._id
                          ? "border-[#F4BB00] bg-[#F4BB00]/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedAddressId(address._id!)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {address.isDefault && (
                            <span className="inline-block mb-2 px-2 py-1 text-xs font-medium text-[#121212] bg-yellow-400 rounded-full">
                              {t("profile.addresses.default")}
                            </span>
                          )}

                          <div className="space-y-2">
                            <h4 className="text-lg font-medium text-[#121212]">
                              {address.name}
                            </h4>
                            <p className="text-[#121212] text-sm">
                              {address.street}
                              <br />
                              {address.city}, {address.postalCode}
                              <br />
                              {address.country}
                            </p>
                          </div>
                        </div>

                        <div className="ml-4 flex items-center gap-2">
                          {/* Кнопка редактирования */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Редактировать адрес"
                          >
                            <RiEditLine size={18} />
                          </button>

                          {/* Selection indicator */}
                          <img
                            src={
                              selectedAddressId === address._id
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
                    {t("checkout.address.no_addresses")}
                  </p>
                  <AppButton
                    variant="secondary"
                    onClick={() => setIsAddAddressDialogOpen(true)}
                  >
                    {t("checkout.address.add_address")}
                  </AppButton>
                </div>
              )}
            </div>

            {/* Delivery Options */}
            {selectedAddressId && (
              <div
                className="bg-white rounded-lg p-6"
                style={{ borderRadius: "8px" }}
              >
                <h3 className="lg:text-[30px] text-[20px] font-semibold text-[#121212] mb-6">
                  {t("checkout.delivery.title")}
                </h3>

                {deliveryLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : deliveryTariffs && deliveryTariffs.length > 0 ? (
                  <div className="space-y-6">
                    {/* Экспресс-доставка */}
                    {expressTariffs.length > 0 && (
                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedDeliveryType === "express"
                            ? "border-[#F4BB00] bg-[#F4BB00]/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleDeliveryTypeChange("express")}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#121212] mb-2">
                              Экспресс-доставка
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {t("checkout.delivery.period")}:{" "}
                              {minExpressPeriod === 0
                                ? "в день заказа"
                                : `от ${minExpressPeriod} ${t(
                                    "checkout.delivery.days"
                                  )}`}
                            </p>
                          </div>

                          <div className="ml-4 flex flex-col items-end">
                            <p className="font-bold text-lg text-[#121212] mb-2">
                              от{" "}
                              {new Intl.NumberFormat(i18n.language).format(
                                minExpressPrice
                              )}{" "}
                              ₽
                            </p>

                            <img
                              src={
                                selectedDeliveryType === "express"
                                  ? checkboxChecked
                                  : checkboxUnchecked
                              }
                              alt="checkbox"
                              className="w-[34px] h-[34px]"
                            />
                          </div>
                        </div>

                        {/* Выбор времени для экспресс-доставки */}
                        {selectedDeliveryType === "express" && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-3">
                              Выберите время доставки:
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              {expressTariffs
                                .sort((a, b) => b.delivery_sum - a.delivery_sum)
                                .map((tariff) => (
                                  <div
                                    key={tariff.tariff_code}
                                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                      selectedTariff?.tariff_code ===
                                      tariff.tariff_code
                                        ? "border-[#F4BB00] bg-[#F4BB00]/5"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTariffSelect(tariff);
                                    }}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium text-[#121212]">
                                        {t("checkout.delivery.upto")}{" "}
                                        {getTimeFromTariff(tariff)}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-[#121212]">
                                          {new Intl.NumberFormat(
                                            i18n.language
                                          ).format(tariff.delivery_sum)}{" "}
                                          ₽
                                        </span>
                                        <img
                                          src={
                                            selectedTariff?.tariff_code ===
                                            tariff.tariff_code
                                              ? checkboxChecked
                                              : checkboxUnchecked
                                          }
                                          alt="checkbox"
                                          className="w-[20px] h-[20px]"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Стандартная доставка */}
                    {standardTariffs.length > 0 && (
                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedDeliveryType === "standard"
                            ? "border-[#F4BB00] bg-[#F4BB00]/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          handleDeliveryTypeChange("standard");
                          if (standardTariffs[0]) {
                            handleTariffSelect(standardTariffs[0]);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#121212] mb-2">
                              Стандартная доставка
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              Обычная доставка курьером
                            </p>
                            {standardTariffs[0] && (
                              <p className="text-sm text-gray-600">
                                {t("checkout.delivery.period")}:{" "}
                                {t("checkout.delivery.upto")}{" "}
                                {standardTariffs[0].period_min}
                                {standardTariffs[0].period_min !==
                                  standardTariffs[0].period_max &&
                                  ` - ${standardTariffs[0].period_max}`}{" "}
                                {t("checkout.delivery.days")}
                              </p>
                            )}
                          </div>

                          <div className="ml-4 flex flex-col items-end">
                            {standardTariffs[0] && (
                              <p className="font-bold text-lg text-[#121212] mb-2">
                                {new Intl.NumberFormat(i18n.language).format(
                                  standardTariffs[0].delivery_sum
                                )}{" "}
                                ₽
                              </p>
                            )}

                            <img
                              src={
                                selectedDeliveryType === "standard"
                                  ? checkboxChecked
                                  : checkboxUnchecked
                              }
                              alt="checkbox"
                              className="w-[34px] h-[34px]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : selectedAddressId ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      {t("checkout.delivery.no_options")}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t("checkout.delivery.no_options_desc")}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Right side - Order Summary */}
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
                  <span>
                    {t("cart.summary.shipping")}
                    {selectedTariff && (
                      <span className="text-sm text-gray-500 block">
                        {selectedDeliveryType === "express"
                          ? `Экспресс-доставка ${t("checkout.delivery.upto")} ${getTimeFromTariff(selectedTariff)}`
                          : "Стандартная доставка"}
                      </span>
                    )}
                  </span>
                  <span>
                    {selectedTariff ? (
                      <>
                        {shipping === 0
                          ? t("cart.summary.shipping_free")
                          : `${new Intl.NumberFormat(i18n.language).format(
                              shipping
                            )} ₽`}
                      </>
                    ) : (
                      <span className="text-sm text-gray-500 block">
                        {t("checkout.messages.not_selected")}
                      </span>
                    )}
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
                      {...registerPromo("code")}
                      placeholder={t("cart.summary.promo_placeholder")}
                      error={promoErrors.code?.message}
                      className="uppercase"
                      autoComplete="off"
                      submitButton={{
                        onSubmit: handleSubmitPromo(onSubmitPromoCode),
                        disabled:
                          !isPromoValid || validatePromoCodeMutation.isPending,
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
                onClick={handleContinue}
                fullWidth
                disabled={!canContinue}
              >
                {t("cart.summary.continue")}
              </AppButton>

              {/* Missing items hints */}
              {!canContinue && missingItems.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-medium mb-2">
                    {t("checkout.validation.complete_required")}:
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

        <YandexConfigProvider value={yandexConfig}>
          <>
            {/* Address Dialogs */}
            <AddressDialog
              isOpen={isAddAddressDialogOpen}
              onClose={() => setIsAddAddressDialogOpen(false)}
              onSave={handleAddAddress}
              isLoading={addAddressMutation.isPending}
            />

            <AddressDialog
              isOpen={isEditAddressDialogOpen}
              onClose={() => {
                setIsEditAddressDialogOpen(false);
                setEditingAddress(undefined);
              }}
              onSave={handleUpdateAddress}
              address={editingAddress}
              isLoading={updateAddressMutation.isPending}
            />
          </>
        </YandexConfigProvider>
      </div>
    </div>
  );
}
