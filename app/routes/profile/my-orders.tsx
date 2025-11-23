import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import { useUserOrders } from "~/queries/user";
import type { IOrder } from "server/models/Order";
import { useNavigate } from "react-router";

type TabType = "active" | "completed" | "cancelled";

const MyOrders: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const navigate = useNavigate();

  // Получаем заказы из API с соответствующим статусом
  const getStatusForTab = (tab: TabType): string | undefined => {
    switch (tab) {
      case "active":
        return "WAITING_PAYMENT,WAITING_CONFIRMATION,IN_ASSEMBLY,IN_DELIVERY";
      case "completed":
        return "COMPLETED";
      case "cancelled":
        return "CANCELLED";
      default:
        return undefined;
    }
  };

  const { data: userOrders, isLoading } = useUserOrders(
    getStatusForTab(activeTab)
  );

  // Получаем все заказы из пагинированного ответа
  const allOrders = useMemo(() => {
    if (!userOrders?.pages) return [];
    return userOrders.pages.flatMap((page) => page.orders || []);
  }, [userOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING_PAYMENT":
      case "WAITING_CONFIRMATION":
      case "IN_ASSEMBLY":
      case "IN_DELIVERY":
        return "text-blue-600";
      case "COMPLETED":
        return "text-green-600";
      case "CANCELLED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "WAITING_PAYMENT":
        return t("profile.orders.status.waiting_payment");
      case "WAITING_CONFIRMATION":
        return t("profile.orders.status.waiting_confirmation");
      case "IN_ASSEMBLY":
        return t("profile.orders.status.in_assembly");
      case "IN_DELIVERY":
        return t("profile.orders.status.in_delivery");
      case "COMPLETED":
        return t("profile.orders.status.completed");
      case "CANCELLED":
        return t("profile.orders.status.cancelled");
      default:
        return status;
    }
  };

  const isActiveStatus = (status: string) => {
    return [
      "WAITING_PAYMENT",
      "WAITING_CONFIRMATION",
      "IN_ASSEMBLY",
      "IN_DELIVERY",
    ].includes(status);
  };

  // Компонент для отображения одного заказа
  const OrderCard: React.FC<{ order: IOrder }> = ({ order }) => {
    // Преобразуем items из объекта в массив
    const orderItems = Object.values(order.items);

    return (
      <>
        <div className="rounded-lg p-6 mb-4">
          <div className="flex gap-6">
            {/* Левая часть - изображения товаров */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              {orderItems.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden"
                >
                  <img
                    src={
                      item.thumbnail ||
                      item.image ||
                      "/images/products/cafu-tshirt.png"
                    }
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {orderItems.length > 3 && (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                  +{orderItems.length - 3}
                </div>
              )}
            </div>

            {/* Правая часть - информация о заказе */}
            <div className="flex-1 flex flex-col gap-2">
              {/* Статус заказа */}
              <div
                className={`text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusText(order.status)}
              </div>

              {/* Номер заказа и дата */}
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("profile.orders.order")} #{order._id}
                </h3>
                <span className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString(i18n.language)}
                </span>
              </div>

              {/* Товары */}
              <div className="text-sm text-gray-600">
                {orderItems.length === 1 ? (
                  <span>{orderItems[0].title}</span>
                ) : (
                  <span>
                    {orderItems[0].title} и еще {orderItems.length - 1}{" "}
                    товар(ов)
                  </span>
                )}
              </div>

              {/* Адрес доставки */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">
                  {t("profile.orders.shipping_address")}:
                </span>{" "}
                {`${order.address.street}, ${order.address.city}, ${order.address.country} ${order.address.postalCode}`}
              </div>

              {/* Трек-номер (если есть) */}
              {order.delivery?.cdekTrackingNumber && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">
                    {t("profile.orders.tracking_number")}:
                  </span>{" "}
                  {order.delivery.cdekTrackingNumber}
                </div>
              )}

              {/* Итого и действия */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {t("profile.orders.total")}:
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {new Intl.NumberFormat(i18n.language).format(order.total)} ₽
                  </span>
                </div>

                {/* <div className="flex gap-2">
                  {isActiveStatus(order.status) && (
                    <>
                      <AppButton variant="secondary" size="sm">
                        {t("common.cancel")}
                      </AppButton>
                      <AppButton variant="primary" size="sm">
                        {t("profile.orders.track")}
                      </AppButton>
                    </>
                  )}
                  {order.status === "COMPLETED" && (
                    <AppButton variant="secondary" size="sm">
                      {t("profile.orders.reorder")}
                    </AppButton>
                  )}
                  {order.status === "CANCELLED" && (
                    <AppButton variant="secondary" size="sm">
                      {t("profile.orders.reorder")}
                    </AppButton>
                  )}
                </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="h-[1px] bg-[#DCDCDC]" />
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg text-gray-600">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <>
      {/* Вкладки */}
      <div className="flex gap-2 sm:gap-4 mb-8">
        <AppButton
          variant={activeTab === "active" ? "primary" : "ghost"}
          size="sm"
          fullWidth={false}
          onClick={() => setActiveTab("active")}
          className={`!text-[10px] sm:!text-base ${
            activeTab !== "active"
              ? "border border-[#121212] rounded-[100px]"
              : ""
          }`}
        >
          {t("profile.orders.active")}
        </AppButton>
        <AppButton
          variant={activeTab === "completed" ? "primary" : "ghost"}
          size="sm"
          fullWidth={false}
          onClick={() => setActiveTab("completed")}
          className={`!text-[10px] sm:!text-base ${
            activeTab !== "completed"
              ? "border border-[#121212] rounded-[100px]"
              : ""
          }`}
        >
          {t("profile.orders.completed")}
        </AppButton>
        <AppButton
          variant={activeTab === "cancelled" ? "primary" : "ghost"}
          size="sm"
          fullWidth={false}
          onClick={() => setActiveTab("cancelled")}
          className={`!text-[10px] sm:!text-base ${
            activeTab !== "cancelled"
              ? "border border-[#121212] rounded-[100px]"
              : ""
          }`}
        >
          {t("profile.orders.cancelled")}
        </AppButton>
      </div>

      {/* Контент */}
      <div className="min-h-[400px]">
        {allOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow py-9 px-[50px] text-left">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("profile.orders.no_orders_title")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("profile.orders.no_orders_desc")}
            </p>
            <AppButton
              variant="secondary"
              size="md"
              fullWidth={false}
              onClick={() => {
                navigate("/");
              }}
            >
              {t("profile.orders.go_shopping")} →
            </AppButton>
          </div>
        ) : (
          <div className="space-y-4">
            {allOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrders;
