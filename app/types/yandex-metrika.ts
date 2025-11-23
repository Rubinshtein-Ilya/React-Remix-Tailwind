// Конфигурация для инициализации Яндекс.Метрики
export interface YandexMetrikaConfig {
  counterId: number;
  clickmap?: boolean;
  trackLinks?: boolean;
  accurateTrackBounce?: boolean;
  webvisor?: boolean;
  trackHash?: boolean;
  ecommerce?: boolean | string;
  triggerEvent?: boolean;
}

// Опции для различных методов Яндекс.Метрики
export interface YandexMetrikaHitOptions {
  callback?: () => void;
  ctx?: any;
  params?: any;
  referer?: string;
  title?: string;
}

export interface YandexMetrikaGoalOptions {
  callback?: () => void;
  ctx?: any;
}

export interface YandexMetrikaExtLinkOptions {
  callback?: () => void;
  ctx?: any;
  title?: string;
}

export interface YandexMetrikaFileOptions {
  callback?: () => void;
  ctx?: any;
  referer?: string;
  title?: string;
}

export interface YandexMetrikaUserParams {
  UserID?: string | number;
  [key: string]: any;
}

export interface YandexMetrikaParams {
  [key: string]: any;
}

// Список распространенных целей для e-commerce
export enum YandexMetrikaGoals {
  PURCHASE = 'purchase',
  ADD_TO_CART = 'add_to_cart',
  VIEW_PRODUCT = 'view_product',
  REGISTER = 'register',
  LOGIN = 'login',
  CONTACT_FORM = 'contact_form',
  DOWNLOAD = 'download',
  SUBSCRIBE = 'subscribe',
  PHONE_CALL = 'phone_call',
  EMAIL_CLICK = 'email_click',
}

// Глобальная типизация window.ym
declare global {
  interface Window {
    ym?: {
      // Отправка целей
      (id: number, action: "reachGoal", target: string): void;
      (id: number, action: "reachGoal", target: string, params: any): void;
      (id: number, action: "reachGoal", target: string, params: any, options: YandexMetrikaGoalOptions): void;
      
      // Отправка хитов
      (id: number, action: "hit", url: string): void;
      (id: number, action: "hit", url: string, options: YandexMetrikaHitOptions): void;
      
      // Параметры и пользовательские данные
      (id: number, action: "params", parameters: YandexMetrikaParams): void;
      (id: number, action: "userParams", parameters: YandexMetrikaUserParams): void;
      
      // Внешние ссылки и файлы
      (id: number, action: "extLink", url: string): void;
      (id: number, action: "extLink", url: string, options: YandexMetrikaExtLinkOptions): void;
      (id: number, action: "file", url: string): void;
      (id: number, action: "file", url: string, options: YandexMetrikaFileOptions): void;
      
      // Дополнительные методы
      (id: number, action: "notBounce"): void;
      (id: number, action: "init", config: YandexMetrikaConfig): void;
      
      // Fallback для совместимости
      (...args: any[]): void;
      
      // Свойства для инициализации
      a?: any[];
      l?: number;
    };
  }
} 