export async function getYandexConfig() {
  return {
    apiKey: process.env.YANDEX_GEO_API_KEY || '',
    mapApiKey: process.env.YANDEX_MAP_API_KEY || '',
  };
} 