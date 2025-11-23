/**
 * Извлекает ID из slug
 * @param slug - строка slug в формате "name_id" или просто "id"
 * @returns ID из slug
 */
export const extractIdFromSlug = (slug: string): string => {
  if (slug.includes("_")) {
    const parts = slug.split("_");
    return parts[parts.length - 1];
  }
  // Если нет "_", считаем весь slug как ID
  return slug;
}; 