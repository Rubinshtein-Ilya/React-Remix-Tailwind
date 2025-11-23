export type PaginatedResponse<T, K extends string = string> = {
  success: boolean;
  hasMore: boolean;
  nextCursor?: string;
} & {
  [Key in K]: T[];
};

export type PublicApiResponse<T, K extends string = string> = {
  success: boolean;
} & {
  [Key in K]: T;
};

export type LikeResponse<T> = T & { isLiked: boolean };
