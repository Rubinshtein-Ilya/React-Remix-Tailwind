import { api } from "./axios";

// Интерфейсы для API
export interface ActivatePromoCodeData {
  code: string;
}

export interface ActivatePromoCodeResponse {
  success: boolean;
  message: string;
  data?: {
    code: string;
    discount: number;
    description: string;
    validUntil: Date;
  };
}

export interface UserPromoCode {
  id: string;
  code: string;
  discount: number;
  description: string;
  usedAt: Date;
  validUntil: Date;
  orderId?: string;
}

export interface GetUserPromoCodesResponse {
  success: boolean;
  data: UserPromoCode[];
}

// Активация промокода
export async function activatePromoCode(
  data: ActivatePromoCodeData
): Promise<ActivatePromoCodeResponse> {
  const response = await api.post<ActivatePromoCodeResponse>(
    "/api/user/promo-code/activate",
    data
  );
  return response.data;
}

// Получение списка активированных промокодов пользователя
export async function getUserPromoCodes(): Promise<GetUserPromoCodesResponse> {
  const response = await api.get<GetUserPromoCodesResponse>(
    "/api/user/promo-codes"
  );
  return response.data;
}

// Валидация промокода (проверка без активации)
export interface ValidatePromoCodeData {
  code: string;
}

export interface ValidatePromoCodeResponse {
  success: boolean;
  message: string;
  data?: {
    code: string;
    discount: number;
    description: string;
    validUntil: Date;
    minOrderAmount: number;
  };
}

export async function validatePromoCode(
  data: ValidatePromoCodeData
): Promise<ValidatePromoCodeResponse> {
  const response = await api.post<ValidatePromoCodeResponse>(
    "/api/user/promo-code/validate",
    data
  );
  return response.data;
} 