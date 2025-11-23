import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import "./SportDropdown.css";
import { usePending } from "~/queries/public";

const RecordingAnimation = () => (
  <div className="flex items-center gap-2">
    <div className="relative">
      <div className="w-3 h-3 bg-gray-800 rounded-full animate-pulse"></div>
      <div className="absolute inset-0 w-3 h-3 bg-gray-800 rounded-full animate-ping opacity-75"></div>
    </div>
    {/* <span className="text-[var(--text-primary)] font-medium animate-pulse">LIVE</span> */}
  </div>
);

interface PendingDropdownProps {
  onLinkClick?: () => void;
  isMobile?: boolean;
}

export function PendingDropdown({ onLinkClick, isMobile = false }: PendingDropdownProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedType, setExpandedType] = useState<Set<string>>(new Set());

  const { data } = usePending()

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const toggleTeam = (type: string) => {
    setExpandedType((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  if (!data) return null;

  const grouped: Record<string, {
    slug: string;
    thumbnail: string;
    name: string;
    type: "players" | "teams" | "events";
  }[]> = {
    ...data.players.length ? {
      players: data.players.map(({ slug, thumbnail, image, name, lastName }) => ({
        slug,
        thumbnail: thumbnail || image,
        name: `${name} ${lastName || ""}`.trim(),
        type: "players"
      }))
    } : {},
    ...data.teams.length ? {
      teams: data.teams.map(({ slug, image, name }) => ({
        slug,
        thumbnail: image,
        name,
        type: "teams"
      })),
    } : {},
    ...data.events.length ? {
      events: data.events.map(({ slug, image, name }) => ({
        slug,
        thumbnail: image,
        name,
        type: "events"
      }))
    } : {},
  };

  const all = Object.values(grouped).flat();

  const hasAny = all.length > 0;

  if (!hasAny) return null;

  // Мобильная версия
  if (isMobile) {
    return (
      <div className="border-b border-gray-100 last:border-b-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full px-4 py-3 text-left text-[16px] font-medium hover:bg-gray-50 transition-colors"
          style={{ color: "#121212" }}
        >
          <div className="flex items-center gap-2">
            <RecordingAnimation />
            <span>{t("header.nav.now_live")}</span>
          </div>
          {hasAny && (
            <svg
              className={`w-4 h-4 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {all.length > 0 && isExpanded && (
          <div className="bg-gray-50">
            {all.map((object) => (
              <div key={object.slug} className="border-t border-gray-100">
                {/* Кнопка типа партнера */}
                <Link
                  key={object.slug}
                  to={`/${object.type}/${object.slug}`}
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-3 py-2 text-[15px] hover:bg-gray-200 transition-colors"
                  style={{ color: "#666" }}
                >
                  {object.thumbnail && (
                    <img
                      src={object.thumbnail}
                      alt={object.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  )}
                  <span>{object.name}</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Десктопная версия (оригинальная)
  return (
    <div className="group relative hidden lg:inline-block">
      {/* Основная кнопка типа партнера */}
      <button
        className="flex items-center gap-2 px-3 py-2 text-[15px] uppercase font-medium text-[#121212] hover:text-gray-900 transition-colors duration-200 bg-transparent border-none cursor-pointer"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <RecordingAnimation />
        <span>{t("header.nav.now_live")}</span>
        {hasAny && (
          <svg
            className="w-3 h-2 transform transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L6 6L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Выпадающее меню партнеров */}
      {all.length > 0 && (
        <div className="absolute top-full left-0 min-w-[280px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 invisible transform transition-all duration-200 group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible">
          {/* Список партнеров */}
          <div className="py-2 max-h-96 overflow-y-auto">
            {all.map((object, index) => (
              <Link
                key={object.slug}
                to={`/${object.type}/${object.slug}`}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => {
                  if (document.activeElement) {
                    (document.activeElement as HTMLElement).blur();
                  }
                }}
              >
                {object.thumbnail && (
                  <img
                    src={object.thumbnail}
                    data-src={object.thumbnail}
                    alt={object.name}
                    className="w-6 h-6 rounded-full object-cover object-image"
                    loading="lazy"
                  />
                )}
                <div>
                  <div className="font-medium">{object.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
