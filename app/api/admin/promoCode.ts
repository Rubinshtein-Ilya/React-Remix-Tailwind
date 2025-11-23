import type { PublicApiResponse } from "~/types/item";
import { api } from "../axios";

// Интерфейсы для админ API
export interface AdminPromoCode {
  _id: string;
  code: string;
  discount: number;
  description: string;
  validFrom: Date;
  validUntil: Date;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  minOrderAmount: number;
  createdBy?: {
    id: string;
    email: string;
    displayName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromoCodeData {
  code: string;
  discount: number;
  description: string;
  validUntil: Date;
  maxUses?: number;
  minOrderAmount?: number;
}

export interface GetAdminPromoCodesResponse {
  success: boolean;
  data: AdminPromoCode[];
}

export interface CreatePromoCodeResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    code: string;
    discount: number;
    description: string;
    validUntil: Date;
  };
}

export interface DeletePromoCodeResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    code: string;
  };
}

// Получить список всех промокодов (админ)
export async function getAdminPromoCodes(): Promise<AdminPromoCode[]> {
  const response = await api.get<
    PublicApiResponse<AdminPromoCode[], "promoCodes">
  >("/api/admin/promo-codes");
  return response.data.promoCodes;
}

// Создать новый промокод (админ)
export async function createPromoCode(
  data: CreatePromoCodeData
): Promise<CreatePromoCodeResponse> {
  const response = await api.post<CreatePromoCodeResponse>(
    "/api/admin/promo-codes",
    data
  );
  return response.data;
}

// Удалить промокод (админ)
export async function deletePromoCode(
  id: string
): Promise<DeletePromoCodeResponse> {
  const response = await api.delete<DeletePromoCodeResponse>(
    `/api/admin/promo-codes/${id}`
  );
  return response.data;
}
