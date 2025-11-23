import { api } from "./axios";
import type { PaymentFormData } from "~/types/tbank";

export interface PaymentInitResponse {
  success: boolean;
  data?: {
    paymentId: string;
    paymentUrl: string;
    orderId: string;
    amount: number;
    status: string;
  };
  message?: string;
  code?: string;
}

export interface PaymentConfirmResponse {
  success: boolean;
  requires3DS: boolean;
  data?: {
    paymentId: string;
    status: string;
    acsUrl?: string;
    md?: string;
    paReq?: string;
  };
  message?: string;
  code?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  data?: {
    paymentId: string;
    status: string;
    orderId: string;
    amount: number;
    cardId?: string;
    pan?: string;
  };
  message?: string;
  code?: string;
}



export interface Check3dsVersionResponse {
  success: boolean;
  data?: {
    paymentId: string;
    status: string;
    version?: string;
    threeDSMethodURL?: string;
    threeDSMethodData?: string;
    threeDSServerTransID?: string;
  };
  message?: string;
  code?: string;
}

/**
 * Инициация платежа за ставку
 */
export async function initBetPayment(
  amount: number,
  description?: string,
  customerKey?: string
): Promise<PaymentInitResponse> {
  const response = await api.post<PaymentInitResponse>("/api/bet-payment/init", {
    amount,
    description,
    customerKey,
  });
  return response.data;
}

/**
 * Подтверждение платежа с данными карты
 */
export async function confirmBetPayment(
  paymentId: string,
  cardData: PaymentFormData
): Promise<PaymentConfirmResponse> {
  const response = await api.post<PaymentConfirmResponse>("/api/bet-payment/confirm", {
    paymentId,
    cardData,
  });
  return response.data;
}

/**
 * Проверка версии 3DS
 */
export async function check3dsVersion(
  paymentId: string,
  cardData: PaymentFormData
): Promise<Check3dsVersionResponse> {
  const response = await api.post<Check3dsVersionResponse>("/api/bet-payment/check-3ds", {
    paymentId,
    cardData,
  });
  return response.data;
}

/**
 * Получение статуса платежа
 */
export async function getBetPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
  const response = await api.get<PaymentStatusResponse>(`/api/bet-payment/status/${paymentId}`);
  return response.data;
}

 