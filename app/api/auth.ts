import type { User } from "~/types/user";
import type {
  LoginData,
  LoginResponse,
  SocialLoginResponse,
} from "~/types/auth";
import { api } from "./axios";

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await api.get<{ user: User | null }>("/api/auth/user");
  return data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

// Функция для обычного входа
export async function login(data: LoginData): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/auth/login", data);
  return response.data;
}

// Функция для входа через Яндекс
export async function loginWithYandex(data: any): Promise<SocialLoginResponse> {
  const response = await api.post<SocialLoginResponse>(
    "/api/auth/yandex/token",
    data
  );
  return response.data;
}

// Новая функция для входа через VK с кодом
export async function loginWithVKCode(data: {
  code: string;
  device_id: string;
  code_verifier: string;
  state: string;
}): Promise<SocialLoginResponse> {
  const response = await api.post<SocialLoginResponse>(
    "/api/auth/vk/code",
    data
  );
  return response.data;
}
