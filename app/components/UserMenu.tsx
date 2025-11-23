import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { User } from "~/types/user";
import { useUnreadNotificationsCount } from "~/queries/notifications";

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Количество непрочитанных уведомлений (только если пользователь авторизован)
  const { data: unreadCount = 0 } = useUnreadNotificationsCount(true);

  // Определяем отображаемое имя
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || user.email.split("@")[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full transition-all hover:opacity-80"
      >
        {user.photo ? (
          <img
            src={user.photo}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-6 h-6 sm:w-8 sm:h-8  rounded-full flex items-center justify-center text-sm font-medium"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="33"
              height="32"
              viewBox="0 0 33 32"
              fill="none"
            >
              <path
                d="M16.9937 16.9814C16.9007 16.9682 16.7811 16.9682 16.6748 16.9814C14.3366 16.9017 12.4766 14.9886 12.4766 12.637C12.4766 10.2323 14.4163 8.2793 16.8343 8.2793C19.239 8.2793 21.192 10.2323 21.192 12.637C21.1787 14.9886 19.332 16.9017 16.9937 16.9814Z"
                stroke="#121212"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M25.788 25.751C23.4232 27.9166 20.2878 29.2318 16.8335 29.2318C13.3792 29.2318 10.2438 27.9166 7.87891 25.751C8.01176 24.5021 8.80891 23.2798 10.2305 22.3233C13.8708 19.9053 19.8228 19.9053 23.4365 22.3233C24.858 23.2798 25.6552 24.5021 25.788 25.751Z"
                stroke="#121212"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.8326 29.2296C24.1701 29.2296 30.1183 23.2814 30.1183 15.9439C30.1183 8.60642 24.1701 2.6582 16.8326 2.6582C9.49509 2.6582 3.54688 8.60642 3.54688 15.9439C3.54688 23.2814 9.49509 29.2296 16.8326 29.2296Z"
                stroke="#121212"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </button>
      {/* Счетчик непрочитанных уведомлений */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-50"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div
            className="p-3 border-b"
            style={{ borderColor: "var(--bg-hover)" }}
          >
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              {displayName}
            </p>
            <p
              className="text-sm opacity-70"
              style={{ color: "var(--text-primary)" }}
            >
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 hover:opacity-80"
              style={{ color: "var(--text-primary)" }}
              onClick={() => setIsOpen(false)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {t("user_menu.profile")}
            </Link>

            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-left hover:opacity-80"
              style={{ color: "var(--text-primary)" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {t("user_menu.logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
