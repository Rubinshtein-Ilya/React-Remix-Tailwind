import { useState } from "react";
import { useNavigate } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";
import OptionBtns from "~/shared/buttons/OptionBtns";
import { RiCloseLine, RiArrowRightLongLine } from "@remixicon/react";
import p14 from "../../assets/images/partners/p14.png";
import { Skeleton } from "~/components/ui/skeleton";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from "~/queries/notifications";
import { useNotifications as useNotificationsHook } from "~/hooks/useNotifications";
import { useTranslation } from "react-i18next";
import type { NotificationCategory } from "~/types/notification";

const notificationExample = {
  id: 1,
  text: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod, molestiae. Illo tenetur
      similique laudantium laborum debitis ad neque ab, odio modi libero suscipit incidunt,
      cupiditate, consequatur quisquam aperiam vitae nihil. Est alias, earum dignissimos
      nulla laudantium eaque cupiditate expedita ipsa blanditiis repellendus. Sint
      doloremque facere eius cum. Vero sit cum perspiciatis iure dolorum voluptatem
      voluptatibus aperiam modi repellat, velit aspernatur. Est alias, earum dignissimos
      nulla laudantium eaque cupiditate expedita ipsa blanditiis repellendus. Sint
      doloremque facere eius cum. Vero sit cum perspiciatis iure dolorum voluptatem
      voluptatibus aperiam modi repellat, velit aspernatur.`,
  createdAt: "2025-01-01T12:00:00Z",
  isRead: false,
  href: "/",
  image: p14,
};

const Notifications = () => {
  const [selectedValue, setSelectedValue] = useState<string | number>("all");
  const [showRead, setShowRead] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotificationsHook();

  const options = [
    {
      id: "all",
      label: t("notifications.categories.all") || "Все",
      value: "all",
    },
    {
      id: "goods",
      label: t("notifications.categories.goods") || "Товары",
      value: "goods",
    },
    {
      id: "orders",
      label: t("notifications.categories.orders") || "Заказы",
      value: "orders",
    },
    {
      id: "news",
      label: t("notifications.categories.news") || "Новости",
      value: "news",
    },
  ];

  const formatTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffInMs = now.getTime() - createdDate.getTime();

    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours >= 24) {
      const days = Math.floor(diffInHours / 24);
      return t("notifications.messages.time_ago.days", { count: days }) || `${days}д.`;
    }

    return t("notifications.messages.time_ago.hours", { count: diffInHours }) || `${diffInHours}ч.`;
  };

  // Подготавливаем параметры для запроса
  const category =
    selectedValue === "all"
      ? undefined
      : (selectedValue as NotificationCategory);
  const isRead = showRead ? undefined : false; // Показываем только непрочитанные изначально

  // Получаем уведомления
  const {
    data: notificationsData,
    isLoading,
    error,
  } = useNotifications({
    category,
    isRead,
    limit: 20,
  });

  // Хуки для операций с уведомлениями
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();
  const deleteAllNotifications = useDeleteAllNotifications();

  const removeAllNotifications = () => {
    deleteAllNotifications.mutate(undefined, {
      onSuccess: () => {
        showSuccess(t("notifications.notifications_cleared") || "Все уведомления удалены");
      },
      onError: (error) => {
        showError(
          t("notifications.error_clearing_notifications") || "Ошибка при удалении уведомлений"
        );
        console.error("Error clearing notifications:", error);
      },
    });
  };

  const removeNotification = (id: string) => {
    deleteNotification.mutate(id, {
      onSuccess: () => {
        showSuccess(t("notifications.notification_deleted") || "Уведомление удалено");
      },
      onError: (error) => {
        showError(
          t("notifications.error_deleting_notification") || "Ошибка при удалении уведомления"
        );
        console.error("Error deleting notification:", error);
      },
    });
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => {
        showSuccess(
          t("notifications.all_notifications_marked_read") ||
            "Все уведомления помечены как прочитанные"
        );
      },
      onError: (error) => {
        showError(
          t("notifications.error_marking_notifications_read") ||
            "Ошибка при пометке уведомлений как прочитанных"
        );
        console.error("Error marking notifications as read:", error);
      },
    });
  };

  const handleNotificationClick = (
    notification: import("~/types/notification").Notification
  ) => {
    // Помечаем как прочитанное при клике
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    // Переходим по ссылке если есть
    if (notification.href) {
      navigate(notification.href);
    }
  };

  const notifications = notificationsData?.notifications || [];

  return (
    <div className="flex flex-col gap-7.5">
      <div>
        <OptionBtns
          options={options}
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
        />
      </div>
      <div className="flex flex-col gap-2">
        {/* skeleton */}
        {isLoading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton className="h-[200px] w-full rounded-lg" key={index} />
            ))}
          </div>
        )}

        {/* Сообщение об ошибке */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {t("notifications.error_loading_notifications") || "Ошибка загрузки уведомлений"}
          </div>
        )}

        {/* Пустое состояние */}
        {!isLoading && !error && notifications.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {showRead
              ? t("notifications.no_notifications") || "Нет уведомлений"
              : t("notifications.no_unread_notifications") || "Нет непрочитанных уведомлений"}
          </div>
        )}

        {/* notifications */}
        {!isLoading &&
          !error &&
          notifications.map((notification) => (
            <div
              className={`flex gap-3 sm:gap-6 p-2 sm:p-7.5 bg-white rounded-lg shadow cursor-pointer transition-colors ${
                !notification.isRead ? "ring-2 ring-blue-200" : ""
              }`}
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="w-1/5 aspect-[5/3] sm:w-32 sm:h-38.5 rounded-md overflow-hidden shrink-0">
                <img
                  src={notification.image || p14}
                  alt={t("notifications.messages.notification_image") || "Изображение уведомления"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-start items-start">
                <div className="text-sm lg:text-base font-semibold mb-1">
                  {notification.title}
                </div>
                <div className="text-sm lg:text-base text-pretty line-clamp-3 sm:line-clamp-4">
                  {notification.text}
                </div>
              </div>
              <div className="flex-1 flex flex-col-reverse sm:flex-row items-end sm:items-start justify-end gap-2">
                <div className="text-xs text-gray-500">
                  {formatTimeAgo(notification.createdAt)}
                </div>
                <button
                  aria-label={t("notifications.buttons.delete") || "Удалить"}
                  className="rounded-full bg-gray-200 p-1 hover:bg-gray-300 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification._id);
                  }}
                >
                  <RiCloseLine size={16} />
                </button>
              </div>
            </div>
          ))}
      </div>
      <div className="flex justify-start gap-2 flex-wrap">
        <AppButton
          variant="secondary"
          fullWidth={false}
          onClick={handleMarkAllAsRead}
          className="!text-xs sm:!text-base"
          disabled={markAllAsRead.isPending}
        >
          {markAllAsRead.isPending 
            ? t("notifications.buttons.updating") || "Обновление..." 
            : t("notifications.buttons.mark_all_read") || "ОТМЕТИТЬ ВСЕ КАК ПРОЧИТАННЫЕ"}
        </AppButton>

        <AppButton
          variant="secondary"
          fullWidth={false}
          onClick={() => setShowRead(!showRead)}
          className="!text-xs sm:!text-base"
        >
          {showRead 
            ? t("notifications.buttons.show_unread_only") || "ТОЛЬКО НЕПРОЧИТАННЫЕ"
            : t("notifications.buttons.show_all") || "ПОКАЗАТЬ ВСЕ"}
        </AppButton>

        <AppButton
          variant="secondary"
          fullWidth={false}
          className="!text-xs sm:!text-base flex items-center gap-2"
          onClick={() => {
            navigate("/profile/notification-settings");
          }}
        >
          {t("notifications.buttons.configure_notifications") || "НАСТРОИТЬ УВЕДОМЛЕНИЯ"}
          <RiArrowRightLongLine size={16} />
        </AppButton>
      </div>
    </div>
  );
};

export default Notifications;
