import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { PendingDropdown } from "~/components/Navigation/PendingDropdown";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { t } = useTranslation();
  // const { data: sports } = useSports();
  // const { data: teams } = useTeams();
  //
  // // Получение команд по виду спорта
  // const getTeamsBySport = (sportId: string) => {
  //   if (!teams?.pages) return [];
  //   return teams.pages.flatMap((page) => page.teams).filter((team) => team.sportId === sportId);
  // };

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Обработчик клика по ссылке
  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      {/* Фон */}
      <div className="absolute inset-0 bg-[rgba(0,0,0,.5)] backdrop-blur-sm" onClick={onClose} />

      {/* Мобильное меню */}
      <div className="relative bg-white w-80 max-w-[80vw] h-full shadow-xl overflow-y-auto">
        {/* Заголовок с кнопкой закрытия */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold" style={{ color: "#121212" }}>
            {t("header.menu")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Закрыть меню"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Навигационные ссылки */}
        <div className="p-4">
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#121212" }}>
              {t("header.nav.auctions")}
            </h3>
            <div className="space-y-2">
              <PendingDropdown
                onLinkClick={handleLinkClick}
                isMobile={true}
              />
            </div>
          </div>

          {/* Основные ссылки */}
          <div className="border-t border-gray-200 pt-4 mt-4 space-y-4 mb-6">
            <Link
              to="/about"
              onClick={handleLinkClick}
              className="block text-[16px] hover:opacity-80 transition py-2"
              style={{ color: "#121212" }}
            >
              {t("header.nav.about_service")}
            </Link>
            <Link
              to="/framing"
              onClick={handleLinkClick}
              className="block text-[16px] hover:opacity-80 transition py-2"
              style={{ color: "#121212" }}
            >
              {t("header.nav.framing")}
            </Link>
            <Link
              to="/partners"
              onClick={handleLinkClick}
              className="block text-[16px] hover:opacity-80 transition py-2"
              style={{ color: "#121212" }}
            >
              {t("header.nav.our_partners")}
            </Link>
            <Link
              to="/authenticate"
              onClick={handleLinkClick}
              className="block text-[16px] hover:opacity-80 transition py-2"
              style={{ color: "#121212" }}
            >
              {t("header.nav.authenticate")}
            </Link>
            <Link
              to="/delivery"
              onClick={handleLinkClick}
              className="block text-[16px] hover:opacity-80 transition py-2"
              style={{ color: "#121212" }}
            >
              {t("header.nav.delivery")}
            </Link>
            <Link
              to="/faq"
              onClick={handleLinkClick}
              className="block text-[16px] hover:opacity-80 transition py-2"
              style={{ color: "#121212" }}
            >
              {t("header.nav.help_contacts")}
            </Link>
          </div>

          {/*/!* Виды спорта *!/*/}
          {/*{sports && sports.length > 0 && (*/}
          {/*  <div className="border-t border-gray-200 pt-4">*/}
          {/*    <h3 className="text-lg font-semibold mb-4" style={{ color: "#121212" }}>*/}
          {/*      {t("header.sports")}*/}
          {/*    </h3>*/}
          {/*    <div className="space-y-2">*/}
          {/*      {sports.map((sport) => (*/}
          {/*        <SportDropdown*/}
          {/*          key={sport._id}*/}
          {/*          sport={sport}*/}
          {/*          teams={getTeamsBySport(sport._id)}*/}
          {/*          onLinkClick={handleLinkClick}*/}
          {/*          isMobile={true}*/}
          {/*        />*/}
          {/*      ))}*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*)}*/}
        </div>
      </div>
    </div>,
    document.body
  );
}
