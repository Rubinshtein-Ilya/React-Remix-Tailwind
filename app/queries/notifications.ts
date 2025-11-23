import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationAPI } from "~/api/notifications";
import type {
  GetNotificationsParams,
  AdminGetNotificationsParams,
  CreateNotificationData,
  BulkCreateNotificationData,
} from "~/types/notification";

// Ключи для кэширования
export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params: GetNotificationsParams) => [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
  admin: {
    all: ["notifications", "admin"] as const,
    lists: () => [...notificationKeys.admin.all, "list"] as const,
    list: (params: AdminGetNotificationsParams) => [...notificationKeys.admin.lists(), params] as const,
  },
};

// Хук для получения уведомлений
export const useNotifications = (params: GetNotificationsParams = {}) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => NotificationAPI.getNotifications(params),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

// Хук для получения количества непрочитанных уведомлений
export const useUnreadNotificationsCount = (enabled: boolean = true) => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => NotificationAPI.getUnreadCount(),
    staleTime: 1000 * 60 * 1, // 1 минута
    refetchInterval: 1000 * 60 * 2, // рефреш каждые 2 минуты
    enabled, // Позволяет отключить запрос для неавторизованных пользователей
  });
};

// Хук для пометки уведомления как прочитанного
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => NotificationAPI.markAsRead(notificationId),
    onSuccess: () => {
      // Обновляем кэш уведомлений
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// Хук для пометки всех уведомлений как прочитанных
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationAPI.markAllAsRead(),
    onSuccess: () => {
      // Обновляем кэш уведомлений
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// Хук для удаления уведомления
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => NotificationAPI.deleteNotification(notificationId),
    onSuccess: () => {
      // Обновляем кэш уведомлений
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// Хук для удаления всех уведомлений
export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationAPI.deleteAllNotifications(),
    onSuccess: () => {
      // Обновляем кэш уведомлений
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// Админские хуки

// Хук для создания уведомления (для админов)
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, ...data }: CreateNotificationData & { userId: string }) => 
      NotificationAPI.createNotification(userId, data),
    onSuccess: () => {
      // Обновляем кэш уведомлений
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.admin.all });
    },
  });
};

// Хук для создания массовых уведомлений (для админов)
export const useCreateBulkNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCreateNotificationData) => NotificationAPI.createBulkNotifications(data),
    onSuccess: () => {
      // Обновляем кэш уведомлений
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.admin.all });
    },
  });
};

// Хук для получения всех уведомлений (для админов)
export const useAdminNotifications = (params: AdminGetNotificationsParams = {}) => {
  return useQuery({
    queryKey: notificationKeys.admin.list(params),
    queryFn: () => NotificationAPI.getAllNotifications(params),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}; 
