import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { ISport } from "server/models/Sport";
import type { ITeam } from "server/models/Team";
import "./SportDropdown.css";

interface SportDropdownProps {
  sport: ISport;
  teams: ITeam[];
  onLinkClick?: () => void;
  isMobile?: boolean;
}

export function SportDropdown({ sport, teams, onLinkClick, isMobile = false }: SportDropdownProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const toggleTeam = (teamId: string) => {
    setExpandedTeams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  // Мобильная версия
  if (isMobile) {
    return (
      <div className="border-b border-gray-100 last:border-b-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full px-4 py-3 text-left text-[16px] font-medium hover:bg-gray-50 transition-colors"
          style={{ color: "#121212" }}
        >
          <span>{sport.name}</span>
          {teams.length > 0 && (
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

        {teams.length > 0 && isExpanded && (
          <div className="bg-gray-50">
            {teams.map((team) => (
              <div key={team._id} className="border-t border-gray-100">
                {/* Кнопка команды */}
                <div className="flex items-center justify-between">
                  <Link
                    to={`/teams/${team.slug}`}
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-6 py-3 text-[14px] hover:bg-gray-100 transition-colors flex-1"
                    style={{ color: "#121212" }}
                  >
                    {team.images?.[0] && (
                      <img
                        src={team.images[0]}
                        alt={team.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    )}
                    <span>{team.name}</span>
                  </Link>

                  {/* Кнопка раскрытия игроков */}
                  {team.players && team.players.length > 0 && (
                    <button
                      onClick={() => toggleTeam(team._id)}
                      className="px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={`Показать игроков команды ${team.name}`}
                    >
                      <svg
                        className={`w-4 h-4 transform transition-transform ${
                          expandedTeams.has(team._id) ? "rotate-180" : ""
                        }`}
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
                    </button>
                  )}
                </div>

                {/* Игроки команды */}
                {team.players && team.players.length > 0 && expandedTeams.has(team._id) && (
                  <div className="bg-gray-100">
                    {team.players.map((player) => (
                      <Link
                        key={player._id}
                        to={`/players/${player.slug}`}
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 px-8 py-2 text-[13px] hover:bg-gray-200 transition-colors"
                        style={{ color: "#666" }}
                      >
                        {(player.thumbnail || player.image) && (
                          <img
                            src={player.thumbnail || player.image}
                            alt={player.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        )}
                        <span>{player.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
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
      {/* Основная кнопка спорта */}
      <button
        className="flex items-center gap-2 px-3 py-2 text-[15px] uppercase font-medium text-[#121212] hover:text-gray-900 transition-colors duration-200 bg-transparent border-none cursor-pointer"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {sport.name}
        {teams.length > 0 && (
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

      {/* Выпадающее меню команд */}
      {teams.length > 0 && (
        <div className="absolute top-full left-0 min-w-[280px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 invisible transform transition-all duration-200 group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible">
          {/* Список команд */}
          <div className="py-2 max-h-96 overflow-y-auto">
            {teams.map((team, index) => (
              <div
                key={team._id}
                className={`relative team-item team-${team._id}`}
                onMouseEnter={(e) => {
                  const submenu = document.querySelector(`.submenu-${team._id}`) as HTMLElement;
                  if (submenu) {
                    // Вычисляем позицию относительно контейнера с учетом скролла
                    const teamElement = e.currentTarget as HTMLElement;
                    const scrollContainer = teamElement.closest(".overflow-y-auto") as HTMLElement;

                    if (scrollContainer) {
                      const teamOffsetTop = teamElement.offsetTop;
                      const scrollTop = scrollContainer.scrollTop;
                      const containerPaddingTop = 8; // py-2 = 8px
                      const topPosition = teamOffsetTop - scrollTop + containerPaddingTop;
                      submenu.style.top = `${topPosition}px`;
                    }

                    // Загружаем изображения игроков при показе подменю
                    const playerImages = submenu.querySelectorAll(
                      ".player-image"
                    ) as NodeListOf<HTMLImageElement>;
                    playerImages.forEach((img) => {
                      if (img.dataset.src && !img.src) {
                        img.src = img.dataset.src;
                      }
                    });

                    submenu.style.opacity = "1";
                    submenu.style.visibility = "visible";
                    submenu.style.pointerEvents = "auto";
                  }
                }}
                onMouseLeave={() => {
                  const submenu = document.querySelector(`.submenu-${team._id}`) as HTMLElement;
                  if (submenu) {
                    submenu.style.opacity = "0";
                    submenu.style.visibility = "hidden";
                    submenu.style.pointerEvents = "none";
                  }
                }}
              >
                {/* Пункт команды */}
                <Link
                  to={`/teams/${team.slug}`}
                  className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  onClick={() => {
                    if (document.activeElement) {
                      (document.activeElement as HTMLElement).blur();
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    {team.images?.[0] && (
                      <img
                        src={team.images[0]}
                        alt={team.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium">{team.name}</span>
                  </div>

                  {team.players && team.players.length > 0 && (
                    <svg
                      className="w-4 h-4 text-gray-400 transform transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Подменю игроков - всегда рендерятся, управляются CSS */}
      {teams.map((team, index) =>
        team.players && team.players.length > 0 ? (
          <div
            key={`submenu-${team._id}`}
            className={`submenu-${team._id} absolute left-[260px] min-w-[240px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition-all duration-200`}
            onMouseEnter={() => {
              const submenu = document.querySelector(`.submenu-${team._id}`) as HTMLElement;
              if (submenu) {
                // Загружаем изображения игроков если еще не загружены
                const playerImages = submenu.querySelectorAll(
                  ".player-image"
                ) as NodeListOf<HTMLImageElement>;
                playerImages.forEach((img) => {
                  if (img.dataset.src && !img.src) {
                    img.src = img.dataset.src;
                  }
                });

                submenu.style.opacity = "1";
                submenu.style.visibility = "visible";
                submenu.style.pointerEvents = "auto";
              }
            }}
            onMouseLeave={() => {
              const submenu = document.querySelector(`.submenu-${team._id}`) as HTMLElement;
              if (submenu) {
                submenu.style.opacity = "0";
                submenu.style.visibility = "hidden";
                submenu.style.pointerEvents = "none";
              }
            }}
          >
            {/* Список игроков */}
            <div className="py-2 max-h-80 overflow-y-auto">
              {team.players.map((player) => (
                <Link
                  key={player._id}
                  to={`/players/${player.slug}`}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  onClick={() => {
                    if (document.activeElement) {
                      (document.activeElement as HTMLElement).blur();
                    }
                  }}
                >
                  {(player.thumbnail || player.image) && (
                    <img
                      data-src={player.thumbnail || player.image}
                      alt={player.name}
                      className="w-6 h-6 rounded-full object-cover player-image"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <div className="font-medium">{player.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
