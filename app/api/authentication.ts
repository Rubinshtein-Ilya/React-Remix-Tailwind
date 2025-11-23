import { api } from "./axios";

export interface AuthenticationFormData {
  itemId: string;
  serialNumber: string;
  tagId: string;
}

export interface AuthResult {
  serialNumber: string;
  nfcCode: string;
  serialUrl: string;
  nfcUrl: string;
  serialQRCode: string;
  createdAt?: string;
}

export interface GenerateCodesResponse {
  success: boolean;
  data: AuthResult;
  message?: string;
}

export interface VerifyAuthenticityParams {
  serial?: string;
  t?: string;
  h?: string;
}

export interface VerifyAuthenticityResponse {
  success: boolean;
  data: {
    authenticationType: 'serial' | 'nfc';
    isAuthentic: boolean;
    verificationLevel: string;
    itemInfo: {
      itemId: string;
      title: string;
      description: string;
      images: string[];
      status: string;
      authenticity?: any;
      serialNumber: string;
    };
    verificationDetails: {
      verifiedAt: string;
      verificationType: string;
      securityLevel: string;
      serialValidated?: boolean;
      nfcValidated?: boolean;
    };
    message: string;
  };
  message?: string;
  isAuthentic?: boolean;
}

// Получение существующих кодов аутентификации
export const getExistingAuthCodes = async (itemId: string): Promise<AuthResult> => {
  const response = await api.get(`/api/authentication/codes/${itemId}`);
  return response.data.data;
};

// Генерация кодов аутентификации (только для админов)
export async function generateAuthCodes(data: AuthenticationFormData): Promise<AuthResult> {
  const response = await api.post<GenerateCodesResponse>("/api/authentication/generate-codes", {
    itemId: data.itemId,
    serialNumber: data.serialNumber,
    tagId: data.tagId,
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to generate codes');
  }

  return response.data.data;
}

// Проверка подлинности предмета
export async function verifyAuthenticity(params: VerifyAuthenticityParams): Promise<VerifyAuthenticityResponse['data']> {
  const response = await api.get<VerifyAuthenticityResponse>("/api/authentication/verify", {
    params
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Verification failed');
  }

  return response.data.data;
} 