import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/api/axios";
import { chargeCard, type ChargeCardRequest } from "~/api/tbank";

// Типы для корзины
export interface CartItem {
  _id: string;
  slug: string;
  title: string;
  size: string;
  price: number;
  amount: number;
  image?: string;
  thumbnail?: string;
  salesMethod?: "bidding" | "direct"; // Добавляем информацию о способе продажи
  weight: number;
  length: number;
  width: number;
  height: number;
}

export interface CartPromoCode {
  code: string;
  discount: number;
  discountAmount: number;
  minOrderAmount: number;
}

export interface CartTotals {
  subtotal: number;
  serviceFee: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface Cart {
  _id: string;
  amount: number;
  total: number;
  items: Record<string, CartItem>;
  promoCode?: CartPromoCode;
  totals?: CartTotals;
  expireAt: Date;
}

// Хук для получения корзины
export const useCart = () => {

  return useQuery<{ cart: Cart }>({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await api.get("/api/user/cart");
      return response.data;
    },
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    enabled: true,
  });
};

// Хук для добавления товара в корзину
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      size,
      amount = 1,
    }: {
      itemId: string;
      size: string;
      amount?: number;
    }) => {
      const response = await api.put(
        `/api/user/cart/${itemId}/${size}/add?amount=${amount}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

// Хук для добавления информации о доставке в корзину
export const useAddCartDeliveryData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      personalInfo: {
        name: string;
        surname: string;
        phone: string;
      };
      address: {
        _id: string;
      };
      delivery: {
        service: "cdek";
        tariffCode: number;
        deliverySum: number;
      };
      promoCode?: {
        code: string;
        discount: number;
        discountAmount: number;
        minOrderAmount: number;
      };
      totals?: {
        subtotal: number;
        serviceFee: number;
        shipping: number;
        discount: number;
        total: number;
      };
    }) => {
      const response = await api.put(
        `/api/user/cart`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

// Хук для удаления товара из корзины
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      size,
      amount = 1,
    }: {
      itemId: string;
      size: string;
      amount?: number;
    }) => {
      const response = await api.put(
        `/api/user/cart/${itemId}/${size}/remove?amount=${amount}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

// Хук для очистки корзины
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.put("/api/user/cart/clear");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

// Хук для создания заказа
export const useCheckoutCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post(
        `/api/user/cart/checkout`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

/**
 * Mutation для оплаты через сохраненную карту
 */
export const useChargeCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ChargeCardRequest) => chargeCard(data),
    onSuccess: () => {
      // Обновляем корзину после успешной оплаты
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
