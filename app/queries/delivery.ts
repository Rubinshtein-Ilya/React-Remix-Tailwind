import { useMutation, useQuery } from "@tanstack/react-query";
import {
  calculateUniversalDelivery,
  type CalculateUniversalDeliveryRequest,
} from "~/api/delivery";

/**
 * Хуки для расчета доставки:
 * 
 * - useItemDeliveryTariffs(addressId, itemId) - для одного товара
 * - useItemsDeliveryTariffs(addressId, itemIds) - для массива товаров
 * - useCartItemsDeliveryTariffs(addressId, cartItems) - для товаров с количеством
 * - useUserCartDeliveryTariffs(addressId) - для корзины пользователя
 * - useUniversalDeliveryCalculation() - для ручного расчета
 * 
 * Все расчеты происходят на сервере, что обеспечивает актуальность данных
 * и правильность расчета габаритов товаров.
 */

// Хук для универсального расчета доставки
export const useUniversalDeliveryCalculation = () => {
  return useMutation({
    mutationFn: calculateUniversalDelivery,
    onError: (error: any) => {
      console.error("Ошибка универсального расчета доставки:", error);
    },
  });
};

// Хук для автоматического расчета тарифов одного товара по ID
export const useItemDeliveryTariffs = (addressId?: string, itemId?: string) => {
  return useQuery({
    queryKey: ["item-delivery-tariffs", addressId, itemId],
    queryFn: async () => {
      if (!addressId || !itemId) return null;

      const result = await calculateUniversalDelivery({
        addressId,
        itemId,
      });
      return result.tariffs || [];
    },
    enabled: !!addressId && !!itemId,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для автоматического расчета тарифов массива товаров по ID
export const useItemsDeliveryTariffs = (addressId?: string, itemIds?: string[]) => {
  return useQuery({
    queryKey: ["items-delivery-tariffs", addressId, itemIds],
    queryFn: async () => {
      if (!addressId || !itemIds?.length) return null;

      const result = await calculateUniversalDelivery({
        addressId,
        itemIds,
      });
      return result.tariffs || [];
    },
    enabled: !!addressId && !!itemIds?.length,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для автоматического расчета тарифов товаров с количеством
export const useCartItemsDeliveryTariffs = (
  addressId?: string,
  cartItems?: Array<{ itemId: string; amount: number }>
) => {
  return useQuery({
    queryKey: ["cart-items-delivery-tariffs", addressId, cartItems],
    queryFn: async () => {
      if (!addressId || !cartItems?.length) return null;

      const result = await calculateUniversalDelivery({
        addressId,
        cartItems,
      });
      return result.tariffs || [];
    },
    enabled: !!addressId && !!cartItems?.length,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для автоматического расчета тарифов корзины пользователя
export const useUserCartDeliveryTariffs = (addressId?: string) => {
  return useQuery({
    queryKey: ["user-cart-delivery-tariffs", addressId],
    queryFn: async () => {
      if (!addressId) return null;

      const result = await calculateUniversalDelivery({
        addressId,
        useCart: true,
      });
      return result.tariffs || [];
    },
    enabled: !!addressId,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};
