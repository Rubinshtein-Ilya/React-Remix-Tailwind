import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "../shared/buttons/AppButton";
import { cookieUtils } from "../utils/cookieUtils";

export function CookieNotification() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Проверяем, было ли уже дано согласие на cookies
    if (!cookieUtils.hasConsent()) {
      // Небольшая задержка для плавного появления
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // Сохраняем согласие
    cookieUtils.setConsent();
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 transform transition-transform duration-300 ease-out">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            {t("cookie_notification.title")}
          </h3>
          <p 
            className="text-sm text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t("cookie_notification.description") }}
          />
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <AppButton 
            variant="primary" 
            onClick={handleAccept}
            className="w-full sm:w-auto"
            size="md"
          >
            {t("cookie_notification.button")}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
