import { useState, useRef, useEffect } from "react";
import { useLanguageContext } from "~/contexts/LanguageContext";
import { GB, RU } from 'country-flag-icons/react/3x2';

interface Language {
  code: string;
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const languages: Language[] = [
  { 
    code: "ru", 
    name: "Русский", 
    Icon: RU 
  },
  { 
    code: "en", 
    name: "English", 
    Icon: GB 
  },
];

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguageContext();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full transition-all"
        style={{ 
          backgroundColor: "var(--bg-secondary)",
          color: "var(--text-primary)" 
        }}
      >
        <currentLanguage.Icon className="w-5 h-5 rounded" />
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 py-2 w-48 rounded-lg shadow-xl z-50"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-left hover:opacity-80 transition-opacity"
              style={{ 
                color: "var(--text-primary)",
                backgroundColor: lang.code === language ? "var(--bg-hover)" : "transparent" 
              }}
            >
              <lang.Icon className="w-5 h-5 rounded" />
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 
