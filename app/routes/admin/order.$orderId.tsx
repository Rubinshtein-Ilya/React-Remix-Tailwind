import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router";
import { useAdminOrder } from "~/queries/admin";
import { AppButton } from "~/shared/buttons/AppButton";
import type {IOrder, OrderStatus} from "server/models/Order";
import {Stepper} from "~/shared/ui/Stepper";

const AdminOrderView: React.FC = () => {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();

  const orderQuery = useAdminOrder(orderId!);
  const { data: order, isLoading, error } = orderQuery;

  const statusTranslations: Record<OrderStatus, string> = {
    WAITING_PAYMENT: t("admin.orders.status.waiting_payment"),
    WAITING_CONFIRMATION: t("admin.orders.status.waiting_confirmation"),
    IN_ASSEMBLY: t("admin.orders.status.in_assembly"),
    IN_DELIVERY: t("admin.orders.status.in_delivery"),
    COMPLETED: t("admin.orders.status.completed"),
    CANCELLED: t("admin.orders.status.cancelled"),
  };

  const statusColors: Record<string, string> = {
    WAITING_PAYMENT: "bg-yellow-100 text-yellow-800 border-yellow-300",
    WAITING_CONFIRMATION: "bg-blue-100 text-blue-800 border-blue-300",
    IN_ASSEMBLY: "bg-purple-100 text-purple-800 border-purple-300",
    IN_DELIVERY: "bg-orange-100 text-orange-800 border-orange-300",
    COMPLETED: "bg-green-100 text-green-800 border-green-300",
    CANCELLED: "bg-red-100 text-red-800 border-red-300",
  };

  const salesMethodTranslations: Record<string, string> = {
    fixed: t("admin.orders.table.sales_method_fixed"),
    bidding: t("admin.orders.table.sales_method_bidding"),
  };

  const deliveryServiceTranslations: Record<string, string> = {
    cdek: "СДЭК",
    pickup: "Самовывоз",
    courier: "Курьер",
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AppButton variant="profile" onClick={() => window.history.back()}>
              ← {t("common.back")}
            </AppButton>
            <div>
              <h1 className="text-3xl font-bold">{t("admin.orders.view.title")}</h1>
              <p className="text-gray-600 mt-2">{t("admin.orders.view.subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AppButton variant="profile" onClick={() => window.history.back()}>
              ← {t("common.back")}
            </AppButton>
            <div>
              <h1 className="text-3xl font-bold">{t("admin.orders.view.title")}</h1>
              <p className="text-gray-600 mt-2">{t("admin.orders.view.subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="border border-red-300 bg-red-50 rounded-lg p-4">
          <p className="text-red-800">{t("admin.orders.view.error_loading")}</p>
        </div>
      </div>
    );
  }

  const orderItems = Object.values(order.items);

  return (
    <div className="space-y-6 pb-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.orders.view.title")}</h1>
            <p className="text-gray-600 mt-2">
              {t("admin.orders.view.subtitle")} #{order._id}
            </p>
          </div>
        </div>
        <AppButton fullWidth={false} size="md" variant="profile" onClick={() => window.history.back()}>
          ← {t("common.back")}
        </AppButton>
      </div>

      {order && order.status !== "CANCELLED" ? (
        <div className="bg-white rounded-lg border shadow-sm p-6 flex flex-col gap-6">
          <h2 className="text-xl font-semibold">{t("admin.orders.view.steps_title")}</h2>
          <Stepper
            steps={Object.values(statusTranslations).slice(0, -1)}
            activeStep={
              Object.keys(statusTranslations)
                .map((status, i) => ({ status: status as OrderStatus, i }))
                .find(({ status }) => status === order.status)!.i
            }
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация о заказе */}
        <div className="lg:col-span-2 space-y-6">
          {/* Статус и основная информация */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t("admin.orders.view.order_info")}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status]}`}>
                {statusTranslations[order.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.order_id")}</label>
                <p className="text-sm font-mono">{order._id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.user_id")}</label>
                <p className="text-sm">{order.userId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.sales_method")}</label>
                <p className="text-sm">{salesMethodTranslations[order.salesMethod]}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.created_at")}</label>
                <p className="text-sm">
                  {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Товары в заказе */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t("admin.orders.view.items")}</h2>

            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={item.thumbnail || item.image}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      {t("admin.orders.view.size")}: {item.size} | {t("admin.orders.view.quantity")}: {item.amount}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("admin.orders.view.price")}: {item.price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {(item.price * item.amount).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Итого */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">{t("admin.orders.view.total_amount")}</span>
                <span className="text-lg">{order.amount}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg font-medium">{t("admin.orders.view.total")}</span>
                <span className="text-xl font-bold">{order.total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>
        </div>

        {/* Боковая панель с дополнительной информацией */}
        <div className="space-y-6">
          {/* Адрес доставки */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t("admin.orders.view.delivery_address")}</h2>
            <div className="space-y-2">
              <p className="text-sm">{order.address.street}</p>
              <p className="text-sm">{order.address.city}, {order.address.country}</p>
              <p className="text-sm">{order.address.postalCode}</p>
            </div>
          </div>

          {/* Даты */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t("admin.orders.view.dates")}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.payment_deadline")}</label>
                <p className="text-sm">
                  {new Date(order.paymentDeadlineAt).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
              {order.confirmedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.confirmed_at")}</label>
                  <p className="text-sm">
                    {new Date(order.confirmedAt).toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              )}
              {order.shippedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.shipped_at")}</label>
                  <p className="text-sm">
                    {new Date(order.shippedAt).toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              )}
              {order.completedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.completed_at")}</label>
                  <p className="text-sm">
                    {new Date(order.completedAt).toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              )}
              {order.canceledAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.canceled_at")}</label>
                  <p className="text-sm">
                    {new Date(order.canceledAt).toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Информация о доставке */}
          {order.delivery && (
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">{t("admin.orders.view.delivery_info")}</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.delivery_service")}</label>
                  <p className="text-sm">{deliveryServiceTranslations[order.delivery.service]}</p>
                </div>
                {order.delivery.cdekTrackingNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.tracking_number")}</label>
                    <p className="text-sm font-mono">{order.delivery.cdekTrackingNumber}</p>
                  </div>
                )}
                {order.delivery.estimatedDeliveryDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.estimated_delivery")}</label>
                    <p className="text-sm">
                      {new Date(order.delivery.estimatedDeliveryDate).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                )}
                {order.delivery.deliverySum && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.delivery_cost")}</label>
                    <p className="text-sm">{order.delivery.deliverySum.toLocaleString('ru-RU')} ₽</p>
                  </div>
                )}
                {order.delivery.recipientName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.recipient_name")}</label>
                    <p className="text-sm">{order.delivery.recipientName}</p>
                  </div>
                )}
                {order.delivery.recipientPhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t("admin.orders.view.recipient_phone")}</label>
                    <p className="text-sm">{order.delivery.recipientPhone}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderView; 