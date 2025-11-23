import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import type { User } from "~/types/user";
import { UserRole } from "~/types/user";
import type { IPlayer } from "../../server/models/Player";
import type { CreatePlayerType } from "../../server/validation/CreatePlayerSchema";
import type { ITeam } from "../../server/models/Team";
import type { CreateTeamType } from "../../server/validation/CreateTeamSchema";
import type { CreateItemType } from "../../server/validation/CreateItemSchema";
import type { IItem } from "../../server/models/Item";
import type { IEvent } from "../../server/models/Event";
import type { CreateEventSchemaType } from "../../server/validation/CreateEventSchema";
import type { FilterType } from "~/shared/admin/tableFilter/TableFilters";
import type { IOrder } from "../../server/models/Order";
import {
  getAdminOrder,
  getAdminOrders,
  getAdminEvents,
  createEvent,
  deleteEvent,
} from "~/api/admin";
import type { PartnerType } from "../../server/models/Partner";
import { api } from "~/api/axios";
// Типы для API
interface UsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

interface UsersResponse {
  success: boolean;
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: {
    total: number;
    verified: number;
    admins: number;
  };
}

interface CreateItemResponse {
  item: IItem;
}

interface CreatePlayerResponse {
  player: IPlayer;
}

interface CreateTeamResponse {
  team: ITeam;
}

// Получение списка пользователей
export function useUsers(filters: UsersFilters = {}) {
  const { page = 1, limit = 10, search = "", role = "all" } = filters;

  return useQuery<UsersResponse>({
    queryKey: ["admin", "users", { page, limit, search, role }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        role,
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      return response.json();
    },
  });
}

// Обновление роли пользователя
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      return response.json();
    },
    onSuccess: () => {
      // Обновляем кеш после успешного изменения
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

// Создание вида спорта
export function useAddSport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fields: {
      _id: string;
      name: string;
      description?: string;
    }) => await api.post("/api/admin/sport", fields),
    onSuccess: () => {
      // Обновляем кеш после успешного изменения
      queryClient.invalidateQueries({ queryKey: ["sports"] });
    },
  });
}

// Создание категории товара
export function useAddItemType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fields: {
      sportId: string;
      name: string;
      description: string;
    }) => {
      const formData = new FormData();

      formData.append("data", JSON.stringify(fields));

      const response = await fetch("/api/admin/sport/item-type", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create item type");
      }

      return response.json();
    },
    onSuccess: () => {
      // Обновляем кеш после успешного изменения
      queryClient.invalidateQueries({ queryKey: ["item-types-all"] });
    },
  });
}

export function useAddPlayerPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fields: {
      sportId: string;
      name: string;
      description: string;
    }) => {
      const response = await fetch("/api/admin/sport/player-position", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
      });

      if (!response.ok) {
        throw new Error("Failed to create item type");
      }

      return response.json();
    },
    onSuccess: () => {
      // Обновляем кеш после успешного изменения
      queryClient.invalidateQueries({ queryKey: ["player-positions"] });
    },
  });
}

// Создание категории товара
export function useDeleteItemType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fields: { itemTypeId: string }) => {
      const response = await fetch(
        `/api/admin/sport/item-type/${fields.itemTypeId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete item type");
      }

      return response.json();
    },
    onSuccess: () => {
      // Обновляем кеш после успешного изменения
      queryClient.invalidateQueries({ queryKey: ["item-types-all"] });
    },
  });
}

export function useDeletePlayerPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fields: { playerPositionId: string }) => {
      const response = await fetch(
        `/api/admin/sport/player-position/${fields.playerPositionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete player position");
      }

      return response.json();
    },
    onSuccess: () => {
      // Обновляем кеш после успешного изменения
      queryClient.invalidateQueries({ queryKey: ["player-positions"] });
    },
  });
}

export function useDeleteSport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sportId }: { sportId: string }) => {
      const response = await fetch(`/api/admin/sport/${sportId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete sport");
      }

      return response.json();
    },
    onSuccess: () => {
      // Обновляем кеш после успешного изменения
      queryClient.invalidateQueries({ queryKey: ["sports"] });
    },
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playerId }: { playerId: string }) => {
      const response = await fetch(`/api/admin/player/${playerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete player");
      }

      return response.json();
    },
    onSuccess: () => {
      // Обновляем кеш после успешного изменения
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId }: { itemId: string }) => {
      const response = await fetch(`/api/admin/catalog/item/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      return response.json();
    },
    onSuccess: () => {
      // Обновляем кеш после успешного изменения
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId }: { teamId: string }) => {
      const response = await fetch(`/api/admin/team/${teamId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete team");
      }

      return response.json();
    },
    onSuccess: () => {
      // Обновляем кеш после успешного изменения
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

interface CreatePlayerMutationVariables {
  fields: CreatePlayerType;
  thumbnail: File;
  images: Array<File>;
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fields,
      thumbnail,
      images,
    }: CreatePlayerMutationVariables) => {
      const formData = new FormData();

      formData.append("data", JSON.stringify(fields));

      formData.append("images", thumbnail, thumbnail.name);

      images.forEach((image) => {
        formData.append("images", image, image.name);
      });

      const response = await fetch(`/api/admin/player`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create player");
      }

      return (await response.json()) as unknown as CreatePlayerResponse;
    },
    onSuccess: () => {
      // Обновляем кеш после успешного изменения
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

interface CreateItemMutationVariables {
  fields: CreateItemType;
  thumbnail: File;
  images: Array<File>;
}

interface UpdateItemMutationVariables {
  itemId: string;
  fields: Partial<CreateItemType & { imagesInfo: Array<string>, thumbnailInfo: string | undefined }>;
  thumbnail?: File;
  images?: Array<File>;
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fields,
      thumbnail,
      images,
    }: CreateItemMutationVariables) => {
      const formData = new FormData();

      formData.append("data", JSON.stringify(fields));

      formData.append("thumbnail", thumbnail, thumbnail.name);

      images.forEach((image) => {
        formData.append("images", image, image.name);
      });

      const response = await fetch(`/api/admin/catalog/item`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create item");
      }

      return (await response.json()) as unknown as CreateItemResponse;
    },
    onSuccess: () => {
      // Обновляем кеш после успешного изменения
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      fields,
      thumbnail,
      images,
    }: UpdateItemMutationVariables) => {
      const formData = new FormData();

      formData.append("data", JSON.stringify(fields));

      if (thumbnail) {
        formData.append("thumbnail", thumbnail, thumbnail.name);
      }

      if (images) {
        images.forEach((image) => {
          formData.append("images", image, image.name);
        });
      }

      const response = await fetch(`/api/admin/catalog/item/${itemId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      return (await response.json()) as unknown as CreateItemResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

interface CreateTeamMutationVariables {
  fields: CreateTeamType;
  // thumbnail: File,
  images: Array<File>;
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fields, images }: CreateTeamMutationVariables) => {
      const formData = new FormData();

      formData.append("data", JSON.stringify(fields));

      // formData.append("images", thumbnail, thumbnail.name);

      images.forEach((image) => {
        formData.append("images", image, image.name);
      });

      const response = await fetch(`/api/admin/team`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }

      return (await response.json()) as unknown as CreateTeamResponse;
    },
    onSuccess: () => {
      // Обновляем кеш после успешного изменения
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

// Query для получения заказов (админ)
export const useAdminOrders = (filter: FilterType<IOrder> = {}) =>
  useInfiniteQuery({
    queryKey: ["admin-orders"],
    queryFn: ({ pageParam }) =>
      getAdminOrders({
        cursor: pageParam,
        filter,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

// Query для получения заказа по ID (админ)
export const useAdminOrder = (orderId: string) =>
  useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => getAdminOrder(orderId),
    enabled: !!orderId,
  });

export function useAddItemLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fields: {
      _id: string;
      name: { ru: string; en: string };
      description: { ru: string; en: string };
    }) => {
      const response = await fetch("/api/admin/item-label", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
      });
      if (!response.ok) {
        throw new Error("Failed to create item label");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-labels"] });
    },
  });
}

export function useDeleteItemLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ labelId }: { labelId: string }) => {
      const response = await fetch(`/api/admin/item-label/${labelId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete item label");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-labels"] });
    },
  });
}

export function useUpdateItemLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      labelId,
      fields,
    }: {
      labelId: string;
      fields: {
        name?: { ru: string; en: string };
        description?: { ru: string; en: string };
      };
    }) => {
      const response = await fetch(`/api/admin/item-label/${labelId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
      });
      if (!response.ok) {
        throw new Error("Failed to update item label");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-labels"] });
    },
  });
}

export function useMarkAsPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceId,
      type,
    }: {
      sourceId: string;
      type: PartnerType;
    }) => {
      const response = await fetch("/api/admin/partner/mark", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sourceId, type }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as partner");
      }

      return response.json();
    },
    onSuccess: (_, { type }) => {
      // Инвалидируем соответствующие кеши в зависимости от типа
      switch (type) {
        case "player":
          queryClient.invalidateQueries({ queryKey: ["players"] });
          break;
        case "team":
          queryClient.invalidateQueries({ queryKey: ["teams"] });
          break;
        case "event":
          queryClient.invalidateQueries({ queryKey: ["events"] });
          break;
      }
    },
  });
}

export function useUnmarkAsPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceId,
      type,
    }: {
      sourceId: string;
      type: PartnerType;
    }) => {
      const response = await fetch("/api/admin/partner/unmark", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sourceId, type }),
      });

      if (!response.ok) {
        throw new Error("Failed to unmark as partner");
      }

      return response.json();
    },
    onSuccess: (_, { type }) => {
      // Инвалидируем соответствующие кеши в зависимости от типа
      switch (type) {
        case "player":
          queryClient.invalidateQueries({ queryKey: ["players"] });
          break;
        case "team":
          queryClient.invalidateQueries({ queryKey: ["teams"] });
          break;
        case "event":
          queryClient.invalidateQueries({ queryKey: ["events"] });
          break;
      }
    },
  });
}

// Оставляем старые хуки для обратной совместимости
export function useMarkPlayerAsPartner() {
  return useMarkAsPartner();
}

export function useUnmarkPlayerAsPartner() {
  return useUnmarkAsPartner();
}

// Events queries
export const useAdminEvents = (filter: FilterType<IEvent> = {}) =>
  useInfiniteQuery({
    queryKey: ["admin", "events", filter],
    queryFn: ({ pageParam }) => getAdminEvents({ cursor: pageParam, filter }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

interface CreateEventMutationVariables {
  fields: CreateEventSchemaType;
  images: Array<File>;
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fields, images }: CreateEventMutationVariables) => {
      const formData = new FormData();

      formData.append("data", JSON.stringify(fields));

      // Добавляем изображения
      images.forEach((image) => {
        formData.append("images", image);
      });

      return createEvent(formData);
    },
    onSuccess: () => {
      // Обновляем кеш после успешного создания
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      return deleteEvent(eventId);
    },
    onSuccess: () => {
      // Обновляем кеш после успешного удаления
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    },
  });
}
