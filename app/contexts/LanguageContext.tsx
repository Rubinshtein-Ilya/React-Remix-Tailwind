import { createContext, useContext, useState, useEffect } from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Импортируем переводы
import enCommon from "~/locales/en/common.json";
import ruCommon from "~/locales/ru/common.json";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const i18nInstance = i18n.createInstance();

i18nInstance
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      ru: { common: ruCommon },
    },
    fallbackLng: "ru",
    supportedLngs: ["ru", "en"],
    load: "languageOnly",
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["cookie", "querystring", "localStorage", "navigator"],
      lookupCookie: "language",
      lookupLocalStorage: "language",
      caches: ["cookie"],
    },
    preload: ["ru", "en"],
  });

export function LanguageProvider({
  children,
  defaultLocale,
}: {
  children: React.ReactNode;
  defaultLocale: string;
}) {
  const [language, setLanguage] = useState(defaultLocale);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      i18nInstance.changeLanguage(defaultLocale).then(() => {
        setIsInitialized(true);
        setLanguage(defaultLocale);
      });
    }
  }, [defaultLocale, isInitialized]);

  const changeLanguage = (lang: string) => {
    i18nInstance.changeLanguage(lang);
    setLanguage(lang);
    document.cookie = `language=${lang};path=/;max-age=31536000`;
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error(
      "useLanguageContext must be used within a LanguageProvider"
    );
  }
  return context;
}
