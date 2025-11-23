// Типы категорий уведомлений
export type NotificationCategory = "goods" | "orders" | "news";

// Типы уведомлений
export type NotificationTypeEnum = "advertising" | "auction_end" | "auction_win" | "bet_outbid" | "delivery_status";

// Базовый интерфейс уведомления
export interface BaseNotification {
  userId: string;
  type: NotificationTypeEnum;
  category: NotificationCategory;
  title: string;
  text: string;
  image?: string;
  href?: string;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Клиентский интерфейс уведомления
export interface Notification extends BaseNotification {
  _id: string;
}

// Интерфейс для создания уведомления
export interface CreateNotificationData {
  type: NotificationTypeEnum;
  category: NotificationCategory;
  title: string;
  text: string;
  image?: string;
  href?: string;
  metadata?: Record<string, any>;
}

// Интерфейс для массового создания уведомлений
export interface BulkCreateNotificationData extends CreateNotificationData {
  userIds: string[];
}

// Интерфейс для получения уведомлений
export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  category?: NotificationCategory;
  isRead?: boolean;
  type?: NotificationTypeEnum;
}

// Интерфейс для админского получения уведомлений
export interface AdminGetNotificationsParams extends GetNotificationsParams {
  userId?: string;
}

// Интерфейс пагинации
export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Интерфейс статистики
export interface NotificationStats {
  total: number;
  unread: number;
}

// Интерфейс ответа при получении уведомлений
export interface GetNotificationsResponse {
  notifications: Notification[];
  pagination: NotificationPagination;
  stats: NotificationStats;
}

// Интерфейс для уведомления с информацией о пользователе (для админов)
export interface NotificationWithUser extends Notification {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

// Интерфейс ответа при получении уведомлений админом
export interface AdminGetNotificationsResponse {
  notifications: NotificationWithUser[];
  pagination: NotificationPagination;
} 
