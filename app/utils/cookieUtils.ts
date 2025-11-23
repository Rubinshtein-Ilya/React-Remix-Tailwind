const COOKIE_CONSENT_KEY = "cookie_consent";

export const cookieUtils = {
  /**
   * Проверяет, было ли дано согласие на использование cookies
   */
  hasConsent(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "true";
  },

  /**
   * Сохраняет согласие на использование cookies
   */
  setConsent(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
  },

  /**
   * Удаляет согласие на использование cookies (для тестирования)
   */
  removeConsent(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  }
};

// Добавляем функцию в глобальный объект для тестирования в консоли
if (typeof window !== "undefined") {
  (window as any).resetCookieConsent = () => {
    cookieUtils.removeConsent();
    console.log("Cookie consent reset. Refresh the page to see the notification again.");
  };
} 
