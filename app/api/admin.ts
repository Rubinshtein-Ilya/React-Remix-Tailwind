import type { IPlayer } from "server/models/Player";
import type { ISport } from "server/models/Sport";
import type { ITeam } from "server/models/Team";
import type { IItemType } from "server/models/ItemType";
import type { IPlayerPosition } from "server/models/PlayerPosition";
import type { IItem } from "server/models/Item";
import type { IEvent } from "server/models/Event";
import type { IItemBid } from "server/models/ItemBid";
import { api } from "./axios";
import type {
  PaginatedResponse,
  PublicApiResponse,
  LikeResponse,
} from "~/types/item";
import {type FilterType, makeQueryString} from "~/shared/admin/tableFilter/TableFilters";
import type {IOrder} from "../../server/models/Order";


// Получить список всех заказов (админ)
export const getAdminOrders = async ({ cursor, filter } : {
  cursor?: string;
  filter: FilterType<IOrder>
}): Promise<PaginatedResponse<IOrder, "orders">> => {
  const params = {
    ...cursor ? { cursor } : {},
    ...filter
  };

  const response = await api.get<PaginatedResponse<IOrder, "orders">>(
    `/api/admin/order`,
    { params }
  );
  return response.data;
}

// Получить заказ по ID (админ)
export async function getAdminOrder(orderId: string): Promise<IOrder> {
  const response = await api.get<PublicApiResponse<IOrder, "order">>(
    `/api/admin/order/${orderId}`
  );
  return response.data.order;
}

// Events API
export const getAdminEvents = async ({ cursor, filter } : {
  cursor?: string;
  filter: FilterType<IEvent>
}): Promise<PaginatedResponse<IEvent, "events">> => {
  const params = {
    ...cursor ? { cursor } : {},
    ...filter
  };

  const response = await api.get<PaginatedResponse<IEvent, "events">>(
    `/api/admin/event`,
    { params }
  );
  return response.data;
}

export const createEvent = async (formData: FormData): Promise<IEvent> => {
  const response = await api.post<PublicApiResponse<IEvent, "event">>(
    "/api/admin/event",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.event;
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  await api.delete(`/api/admin/event/${eventId}`);
};
