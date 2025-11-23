import { api } from "./axios";

// Типы для клиентской части
export interface DeliveryTariff {
  tariff_code: number;
  tariff_name: string;
  tariff_description: string;
  delivery_mode: number;
  delivery_sum: number;
  period_min: number;
  period_max: number;
  weight_calc: number;
  currency: string;
  delivery_date_range: {
    min: string;
    max: string;
  };
}

export interface CalculateDeliveryResponse {
  success: boolean;
  tariffs: DeliveryTariff[];
}

// Типы для универсального расчета доставки
export interface CalculateUniversalDeliveryRequest {
  addressId: string;
  itemId?: string;
  itemIds?: string[];
  cartItems?: Array<{
    itemId: string;
    amount: number;
  }>;
  useCart?: boolean;
  tariffCode?: number;
}

// Универсальный расчет стоимости доставки
export const calculateUniversalDelivery = async (
  params: CalculateUniversalDeliveryRequest
): Promise<CalculateDeliveryResponse> => {
  const response = await api.post<CalculateDeliveryResponse>(
    "/api/delivery/calculate-delivery",
    params
  );
  return response.data;
};
