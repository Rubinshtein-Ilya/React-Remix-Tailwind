import { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  // useEffect(() => {
  //   // Проверяем сохраненную тему или системные настройки
  //   const savedTheme = localStorage.getItem("theme");
  //   const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  //   const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);

  //   if (shouldUseDark) {
  //     setDarkMode(true);
  //     document.documentElement.setAttribute("data-theme", "dark");
  //   }
  // }, []);

  useEffect(() => {
    // const savedTheme = localStorage.getItem("theme");

    // if (savedTheme === "dark") {
    //   setDarkMode(true);
    //   document.documentElement.setAttribute("data-theme", "dark");
    // } else {
    setDarkMode(false);
    document.documentElement.setAttribute("data-theme", "light");

    // if (!savedTheme) {
    //   localStorage.setItem("theme", "light");
    // }
    // }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = false; // !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.setAttribute("data-theme", newDarkMode ? "dark" : "light");

    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
