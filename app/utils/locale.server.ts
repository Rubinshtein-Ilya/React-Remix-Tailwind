const supportedLocales = ["ru"];

export async function getClientLocales(request: Request): Promise<string> {
  // Проверяем cookie
  const cookieHeader = request.headers.get("Cookie");
  const cookies = new URLSearchParams(cookieHeader?.replace(/; /g, "&") || "");
  const savedLocale = cookies.get("language");
  
  if (savedLocale && supportedLocales.includes(savedLocale)) {
    return savedLocale;
  }

  // Проверяем заголовок Accept-Language
  const acceptLanguage = request.headers.get("Accept-Language");
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(",")
      .map(lang => lang.split(";")[0])
      .find(lang => supportedLocales.includes(lang.substring(0, 2)));
    
    if (preferredLocale) {
      return preferredLocale.substring(0, 2);
    }
  }

  // Возвращаем дефолтный язык
  return "ru";
} 
