import React, { useEffect, useMemo } from "react";
import {
  redirect,
  Outlet,
  useLoaderData,
  useNavigate,
  type LoaderFunction,
} from "react-router";
import type { User } from "~/types/user";
import { useAuth } from "~/queries/auth";
import { getYandexConfig } from "~/loaders/yandexConfig";
import { YandexConfigProvider } from "~/contexts/YandexConfigContext";
import "~/types/app-context";

interface PrivateLayoutData {
  user: User;
  yandexConfig: {
    apiKey: string;
    mapApiKey: string;
  };
}

export const loader: LoaderFunction = async ({ request, context }) => {
  // Используем данные пользователя из контекста вместо fetch запроса
  if (!context?.user || !context?.isAuthenticated) {
    console.log("Private layout: пользователь не авторизован, перенаправляем на главную");
    return redirect("/");
  }

  try {
    // Загружаем Yandex конфигурацию
    const yandexConfig = await getYandexConfig();

    return { 
      user: context.user,
      yandexConfig
    };
  } catch (error) {
    console.log("Private layout: ошибка при загрузке конфигурации, перенаправляем на главную");
    return redirect("/");
  }
};

const PrivateLayout: React.FC = () => {
  const { user: initialUser, yandexConfig } = useLoaderData<PrivateLayoutData>();
  const navigate = useNavigate();

  // Периодическая проверка сессии каждые 5 минут
  const { user: currentUser, error } = useAuth({
    sessionCheckInterval: 5 * 60 * 1000, // 5 минут
    onSessionExpired: () => {
      console.log("Private layout: сессия истекла, перенаправляем на главную");
      navigate("/", { replace: true });
    },
  });

  // Используем данные из loader'а как fallback
  const user = currentUser || initialUser;
  const isError = useMemo(() => error !== null, [error]);

  // Перенаправляем на главную, если сессия истекла
  useEffect(() => {
    if (isError || user === null) {
      console.log(
        "Private layout: сессия истекла или ошибка, перенаправляем на главную"
      );
      navigate("/", { replace: true });
    }
  }, [isError, user, navigate]);

  // Если сессия истекла, показываем загрузку пока происходит редирект
  if (isError || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-2 text-gray-600">Перенаправление...</p>
        </div>
      </div>
    );
  }

  return (
    <YandexConfigProvider value={yandexConfig}>
      <div className="min-h-screen">
        {/* Здесь можно добавить общие элементы для всех приватных страниц */}
        <Outlet context={{ user }} />
      </div>
    </YandexConfigProvider>
  );
};

export default PrivateLayout;
