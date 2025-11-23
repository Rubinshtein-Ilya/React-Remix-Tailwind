import { useCallback } from "react";
import type {
  YandexMetrikaHitOptions,
  YandexMetrikaGoalOptions,
  YandexMetrikaExtLinkOptions,
  YandexMetrikaFileOptions,
  YandexMetrikaUserParams,
  YandexMetrikaParams,
} from "~/types/yandex-metrika";

interface UseYandexMetrikaParams {
  counterId?: number;
}

export function useYandexMetrika({
  counterId = 102343901,
}: UseYandexMetrikaParams = {}) {
  // Отправка цели
  const reachGoal = useCallback(
    (goalName: string, params?: any, options?: YandexMetrikaGoalOptions) => {
      if (typeof window !== "undefined" && window.ym) {
        if (options && params) {
          window.ym(counterId, "reachGoal", goalName, params, options);
        } else if (params) {
          window.ym(counterId, "reachGoal", goalName, params);
        } else {
          window.ym(counterId, "reachGoal", goalName);
        }
      }
    },
    [counterId]
  );

  // Отправка события
  const hit = useCallback(
    (url: string, options?: YandexMetrikaHitOptions) => {
      if (typeof window !== "undefined" && window.ym) {
        if (options) {
          window.ym(counterId, "hit", url, options);
        } else {
          window.ym(counterId, "hit", url);
        }
      }
    },
    [counterId]
  );

  // Отправка пользовательских параметров
  const params = useCallback(
    (parameters: YandexMetrikaParams) => {
      if (typeof window !== "undefined" && window.ym) {
        window.ym(counterId, "params", parameters);
      }
    },
    [counterId]
  );

  // Отправка пользовательских данных
  const userParams = useCallback(
    (parameters: YandexMetrikaUserParams) => {
      if (typeof window !== "undefined" && window.ym) {
        window.ym(counterId, "userParams", parameters);
      }
    },
    [counterId]
  );

  // Отслеживание внешних ссылок
  const extLink = useCallback(
    (url: string, options?: YandexMetrikaExtLinkOptions) => {
      if (typeof window !== "undefined" && window.ym) {
        if (options) {
          window.ym(counterId, "extLink", url, options);
        } else {
          window.ym(counterId, "extLink", url);
        }
      }
    },
    [counterId]
  );

  // Отслеживание скачивания файлов
  const file = useCallback(
    (url: string, options?: YandexMetrikaFileOptions) => {
      if (typeof window !== "undefined" && window.ym) {
        if (options) {
          window.ym(counterId, "file", url, options);
        } else {
          window.ym(counterId, "file", url);
        }
      }
    },
    [counterId]
  );

  // Не отскакивать (для длинных страниц)
  const notBounce = useCallback(() => {
    if (typeof window !== "undefined" && window.ym) {
      window.ym(counterId, "notBounce");
    }
  }, [counterId]);

  return {
    reachGoal,
    hit,
    params,
    userParams,
    extLink,
    file,
    notBounce,
  };
}
