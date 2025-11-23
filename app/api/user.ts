import { api } from "./axios";
import type { Address } from "~/types/address";
import type { UserAddress, NotificationSettings } from "~/types/user";
import type { PaginatedResponse, LikeResponse } from "~/types/item";
import type { ITeam } from "server/models/Team";
import type { IPlayer } from "server/models/Player";
import type { IUserLike } from "server/models/UserLike";
import type { IItemBid } from "server/models/ItemBid";
import type { IOrder } from "server/models/Order";

export interface UpdatePersonalInfoData {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: "male" | "female";
}

export interface UpdatePersonalInfoResponse {
  success: boolean;
  message: string;
  data?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    dateOfBirth?: string;
    gender?: "male" | "female";
  };
}

export async function updatePersonalInfo(
  data: UpdatePersonalInfoData
): Promise<UpdatePersonalInfoResponse> {
  const response = await api.put<UpdatePersonalInfoResponse>("/api/user/personal-info", data);
  return response.data;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export async function changePassword(data: ChangePasswordData): Promise<ChangePasswordResponse> {
  const response = await api.put<ChangePasswordResponse>("/api/user/change-password", data);
  return response.data;
}

export interface UpdateAddressData {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface UpdateAddressResponse {
  success: boolean;
  message: string;
  data?: Address;
}

export async function updateAddress(data: UpdateAddressData): Promise<UpdateAddressResponse> {
  const response = await api.put<UpdateAddressResponse>("/api/user/address", data);
  return response.data;
}

export const getUserLikes = async (cursor?: string, type?: string) => {
  const params: { cursor?: string; type?: string } = {};
  if (cursor) params.cursor = cursor;
  if (type) params.type = type;

  const response = await api.get<PaginatedResponse<IUserLike, "likes">>("/api/user/like", {
    params,
  });
  return response.data;
};

export const getUserBids = async (cursor?: string) => {
  const params: { cursor?: string } = {};
  if (cursor) params.cursor = cursor;

  const response = await api.get<PaginatedResponse<IItemBid, "bids">>("/api/user/bid", { params });
  return response.data;
};
export const sendSupportRequest = (data: {
  category: string;
  subject: string;
  message: string;
  email?: string;
  name?: string;
}) => {
  return api.post("/api/user/support", data);
};

export const sendPartnershipRequest = (data: {
  name: string;
  specialization: string;
  companyName: string;
  email: string;
  phone: string;
  message?: string;
}) => {
  return api.post("/api/user/partnership", data);
};

// Адреса пользователя
export const getUserAddresses = async (): Promise<{ addresses: UserAddress[] }> => {
  const response = await api.get("/api/user/addresses");
  return response.data.data;
};

export const addUserAddress = async (addressData: {
  name: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}): Promise<{ addresses: UserAddress[] }> => {
  const response = await api.post("/api/user/addresses", addressData);
  return response.data.data;
};

export const updateUserAddress = async (
  addressId: string,
  addressData: {
    name: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
    isDefault?: boolean;
  }
): Promise<{ addresses: UserAddress[] }> => {
  const response = await api.put(`/api/user/addresses/${addressId}`, addressData);
  return response.data.data;
};

export const deleteUserAddress = async (
  addressId: string
): Promise<{ addresses: UserAddress[] }> => {
  const response = await api.delete(`/api/user/addresses/${addressId}`);
  return response.data.data;
};

export const setDefaultAddress = async (
  addressId: string
): Promise<{ addresses: UserAddress[] }> => {
  const response = await api.put(`/api/user/addresses/${addressId}/set-default`);
  return response.data.data;
};

// Размещение ставки
export interface PlaceBidData {
  itemId: string;
  size: string;
  price: number;
  message?: string;
  agreeToMarketing?: boolean;
}

export interface PlaceBidResponse {
  success: boolean;
  message?: string;
  data?: {
    bid: any;
  };
}

export const placeBid = async (data: PlaceBidData): Promise<PlaceBidResponse> => {
  const response = await api.post<PlaceBidResponse>("/api/user/place-bid", data);
  return response.data;
};

// Заказы пользователя
export const getUserOrders = async (cursor?: string, status?: string) => {
  const params: { cursor?: string; status?: string } = {};
  if (cursor) params.cursor = cursor;
  if (status) params.status = status;

  const response = await api.get<PaginatedResponse<IOrder, "orders">>("/api/user/order", {
    params,
  });
  return response.data;
};

export const getOrderById = async (orderId: string) => {
  const response = await api.get<{ order: IOrder }>(`/api/user/order/${orderId}`);
  return response.data;
};

// T-Bank карты с холдом
export interface AttachCardWithHoldResponse {
  success: boolean;
  message: string;
  data: {
    paymentUrl: string;
    paymentId: string;
    orderId: string;
  };
}

export const attachCardWithHold = async (): Promise<AttachCardWithHoldResponse> => {
  const response = await api.post<AttachCardWithHoldResponse>("/api/user/attach-card");
  return response.data;
};

export interface CheckHoldStatusResponse {
  success: boolean;
  data: {
    cardAttached: boolean;
    cardId?: string;
    cancelled: boolean;
    message?: string;
  };
}

export const checkHoldStatus = async (paymentId: string): Promise<CheckHoldStatusResponse> => {
  const response = await api.post<CheckHoldStatusResponse>("/api/user/check-hold-status", {
    paymentId,
  });
  return response.data;
};

// Настройки уведомлений
export interface NotificationSettingsResponse {
  success: boolean;
  data: NotificationSettings;
}

export interface UpdateNotificationSettingsResponse {
  success: boolean;
  message: string;
  data: NotificationSettings;
}

export const getNotificationSettings = async (): Promise<NotificationSettingsResponse> => {
  const response = await api.get<NotificationSettingsResponse>("/api/user/notification-settings");
  return response.data;
};

export const updateNotificationSettings = async (
  settings: NotificationSettings
): Promise<UpdateNotificationSettingsResponse> => {
  const response = await api.put<UpdateNotificationSettingsResponse>(
    "/api/user/notification-settings",
    settings
  );
  return response.data;
};

// Лайки
export interface LikeItemResponse {
  success: boolean;
  message?: string;
}

export const likeItem = async (sourceId: string, type: string): Promise<LikeItemResponse> => {
  const response = await api.put<LikeItemResponse>(`/api/user/like/${sourceId}/${type}`);
  return response.data;
};

export const unlikeItem = async (sourceId: string): Promise<LikeItemResponse> => {
  const response = await api.delete<LikeItemResponse>(`/api/user/like/${sourceId}`);
  return response.data;
};
