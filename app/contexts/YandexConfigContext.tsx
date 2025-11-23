import React, { createContext, useContext } from 'react';

interface YandexConfig {
  apiKey: string;
  mapApiKey: string;
}

const YandexConfigContext = createContext<YandexConfig | null>(null);

export function YandexConfigProvider({ 
  children, 
  value 
}: { 
  children: React.ReactNode; 
  value: YandexConfig;
}) {
  return (
    <YandexConfigContext.Provider value={value}>
      {children}
    </YandexConfigContext.Provider>
  );
}

export function useYandexConfig() {
  const context = useContext(YandexConfigContext);
  if (!context) {
    throw new Error('useYandexConfig must be used within YandexConfigProvider');
  }
  return context;
} 