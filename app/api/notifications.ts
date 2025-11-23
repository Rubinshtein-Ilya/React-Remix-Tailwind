import { api as axiosInstance } from "./axios";
import type {
  Notification,
  CreateNotificationData,
  BulkCreateNotificationData,
  GetNotificationsParams,
  AdminGetNotificationsParams,
  GetNotificationsResponse,
  AdminGetNotificationsResponse,
} from "~/types/notification";

// API для работы с уведомлениями
export const NotificationAPI = {
  // Получение уведомлений пользователя
  async getNotifications(params: GetNotificationsParams = {}): Promise<GetNotificationsResponse> {
    const response = await axiosInstance.get("/api/notifications", { params });
    return response.data.data;
  },

  // Получение количества непрочитанных уведомлений
  async getUnreadCount(): Promise<number> {
    const response = await axiosInstance.get("/api/notifications/unread-count");
    return response.data.data.count;
  },

  // Пометить уведомление как прочитанное
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await axiosInstance.patch(
      `/api/notifications/${notificationId}/read`
    );
    return response.data.data.notification;
  },

  // Пометить все уведомления как прочитанные
  async markAllAsRead(): Promise<void> {
    await axiosInstance.patch("/api/notifications/mark-all-read");
  },

  // Удалить уведомление
  async deleteNotification(notificationId: string): Promise<void> {
    await axiosInstance.delete(`/api/notifications/${notificationId}`);
  },

  // Удалить все уведомления
  async deleteAllNotifications(): Promise<void> {
    await axiosInstance.delete("/api/notifications");
  },

  // Админские методы

  // Создать уведомление (для админов)
  async createNotification(userId: string, data: CreateNotificationData): Promise<Notification> {
    const response = await axiosInstance.post("/api/notifications/create", { userId, ...data });
    return response.data.data.notification;
  },

  // Создать массовые уведомления (для админов)
  async createBulkNotifications(data: BulkCreateNotificationData): Promise<{ created: number; skipped: number }> {
    const response = await axiosInstance.post("/api/notifications/bulk-create", data);
    return response.data.data;
  },

  // Получить все уведомления (для админов)
  async getAllNotifications(params: AdminGetNotificationsParams = {}): Promise<AdminGetNotificationsResponse> {
    const response = await axiosInstance.get("/api/notifications/admin/all", { params });
    return response.data.data;
  },
}; 
