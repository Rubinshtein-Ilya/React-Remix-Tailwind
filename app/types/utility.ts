export type Join<K, P> = K extends string
  ? P extends (string | boolean)
    ? `${K}.${P}`
    : never
  : never;

export type NestedStringPaths<T> = {
  [K in keyof T]: T[K] extends string
    ? K
    : NonNullable<T[K]> extends Record<string, any>
      ? Join<K, {
        [P in keyof NonNullable<T[K]>]: NonNullable<T[K]>[P] extends string ? P : never;
      }[keyof NonNullable<T[K]>]>
      : never;
}[keyof T] & string;

export type NestedStringOrBooleanPaths<T> = {
  [K in keyof T]: T[K] extends (string | boolean)
    ? K
    : NonNullable<T[K]> extends Record<string, any>
      ? Join<K, {
        [P in keyof NonNullable<T[K]>]: NonNullable<T[K]>[P] extends (string | boolean) ? P : never;
      }[keyof NonNullable<T[K]>]>
      : never;
}[keyof T] & string;