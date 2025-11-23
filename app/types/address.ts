// Типы для работы с адресами, синхронизированные с User.ts

export interface Address {
  street: string;
  city: string;
  country: string;
  postalCode: string;
  apartmentNumber?: string;
  isDefault?: boolean;
}

// Расширенная структура адреса для внутреннего использования
export interface FullAddress extends Address {
  house?: string;
}

// Структура ответа Yandex Suggest API согласно официальной документации
export interface YandexSuggestResponse {
  results?: YandexSuggestResult[];
}

export interface YandexSuggestResult {
  title: {
    text: string;
    hl?: Array<{
      begin: number;
      end: number;
    }>;
  };
  subtitle?: {
    text: string;
    hl?: Array<{
      begin: number;
      end: number;
    }>;
  };
  tags?: string[];
  distance?: {
    text: string;
    value: number;
  };
  address?: {
    formatted_address: string;
    component: YandexAddressComponent[];
  };
  uri?: string;
}

export interface YandexAddressComponent {
  name: string;
  kind: YandexAddressKind[]; // kind - это массив строк согласно документации
}

// Типы компонентов адреса согласно документации
export type YandexAddressKind =
  | "country" // страна
  | "region" // регион
  | "province" // область
  | "area" // район области, городской совет
  | "locality" // населенный пункт
  | "district" // район, микрорайон, квартал города, посёлок
  | "street" // улица
  | "house" // дом
  | "hydro" // река, озеро, ручей, водохранилище и т.п.
  | "station" // остановка
  | "metro_station" // станция метро
  | "railway_station" // железнодорожная станция
  | "route" // линия метро, шоссе, ж.д. линия
  | "vegetation" // лес, парк, сад и т.п.
  | "airport" // аэропорт
  | "other" // прочее
  | "entrance" // вход
  | "level" // этаж
  | "apartment" // квартира
  | "unknown"; // ничего из перечисленного
