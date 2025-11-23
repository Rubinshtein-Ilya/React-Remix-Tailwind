import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { UserLikeType } from "server/models/UserLike";
import {
  getUserLikes,
  sendSupportRequest,
  sendPartnershipRequest,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  getUserBids,
  placeBid,
  getUserOrders,
  getOrderById,
  getNotificationSettings,
  updateNotificationSettings,
  likeItem,
  unlikeItem,
} from "~/api/user";

export const useUserLikes = (type?: UserLikeType) =>
  useInfiniteQuery({
    queryKey: ["user-likes", type],
    queryFn: ({ pageParam }) => getUserLikes(pageParam, type),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

export const useUserBids = () =>
  useInfiniteQuery({
    queryKey: ["user-bids"],
    queryFn: ({ pageParam }) => getUserBids(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

export const useSendSupportRequest = () => {
  return useMutation({
    mutationFn: sendSupportRequest,
  });
};

export const useSendPartnershipRequest = () => {
  return useMutation({
    mutationFn: sendPartnershipRequest,
  });
};

// Хуки для работы с адресами
export const useUserAddresses = () => {
  return useQuery({
    queryKey: ["user-addresses"],
    queryFn: getUserAddresses,
  });
};

export const useAddAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addUserAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      addressId,
      addressData,
    }: {
      addressId: string;
      addressData: any;
    }) => updateUserAddress(addressId, addressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setDefaultAddress,
    // Оптимистичное обновление
    onMutate: async (addressId: string) => {
      // Отменяем текущие запросы для предотвращения конфликтов
      await queryClient.cancelQueries({ queryKey: ["user-addresses"] });

      // Получаем текущие данные
      const previousAddresses = queryClient.getQueryData(["user-addresses"]);

      // Оптимистично обновляем кэш
      queryClient.setQueryData(["user-addresses"], (old: any) => {
        if (!old?.addresses) return old;

        return {
          ...old,
          addresses: old.addresses.map((address: any) => ({
            ...address,
            isDefault: address._id === addressId,
          })),
        };
      });

      // Возвращаем контекст для отката в случае ошибки
      return { previousAddresses };
    },
    onError: (err, addressId, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousAddresses) {
        queryClient.setQueryData(["user-addresses"], context.previousAddresses);
      }
    },
    onSuccess: () => {
      // Обновляем кэш после успешного запроса (для синхронизации с сервером)
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

// Размещение ставки
export const usePlaceBid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeBid,
    onSuccess: () => {
      // Обновляем кэш ставок пользователя
      queryClient.invalidateQueries({ queryKey: ["user-bids"] });
      // Обновляем кэш товаров и ставок
      queryClient.invalidateQueries({ queryKey: ["item-bids"] });
      queryClient.invalidateQueries({ queryKey: ["public-items"] });
    },
  });
};

// Хуки для работы с заказами
export const useUserOrders = (status?: string) =>
  useInfiniteQuery({
    queryKey: ["user-orders", status],
    queryFn: ({ pageParam }) => getUserOrders(pageParam, status),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

export const useOrderById = (orderId: string) =>
  useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  });

// Хуки для работы с настройками уведомлений
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ["notification-settings"],
    queryFn: getNotificationSettings,
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
    },
  });
};

// Хуки для лайков
export const useLikeItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceId, type }: { sourceId: string; type: string }) => 
      likeItem(sourceId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "likes"] });
      queryClient.invalidateQueries({ queryKey: ["user-likes"] });
    },
  });
};

export const useUnlikeItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => unlikeItem(sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "likes"] });
      queryClient.invalidateQueries({ queryKey: ["user-likes"] });
    },
  });
};
