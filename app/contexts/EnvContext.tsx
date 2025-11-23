import React, { createContext, useContext } from 'react';

interface EnvContextValue {
  YANDEX_CLIENT_ID?: string;
  VK_CLIENT_ID?: string;
}

const EnvContext = createContext<EnvContextValue>({});

interface EnvProviderProps {
  children: React.ReactNode;
  env: EnvContextValue;
}

export function EnvProvider({ children, env }: EnvProviderProps) {
  return (
    <EnvContext.Provider value={env}>
      {children}
    </EnvContext.Provider>
  );
}

export function useEnv() {
  const context = useContext(EnvContext);
  if (!context) {
    throw new Error('useEnv must be used within an EnvProvider');
  }
  return context;
} 