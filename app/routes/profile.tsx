import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData, useNavigate, useLocation, Outlet, type LoaderFunction } from "react-router";
import type { User } from "~/types/user";
import { UserRole } from "~/types/user";
import "~/types/app-context";
import userSVG from "../assets/images/private/user.svg";
import betSVG from "../assets/images/private/bet.svg";
import ordersSVG from "../assets/images/private/orders.svg";
import addresSVG from "../assets/images/private/addres.svg";
import paymentSVG from "../assets/images/private/payment.svg";
import promoSVG from "../assets/images/private/promo.svg";
import teamsSVG from "../assets/images/private/teams.svg";
import wishlistSVG from "../assets/images/private/wishlist.svg";
import supportSVG from "../assets/images/private/support.svg";
import exitSVG from "../assets/images/private/exit.svg";
import adminSVG from "../assets/images/private/admin.svg";
import notificationSVG from "../assets/images/private/notification.svg";
import notificationActiveSVG from "../assets/images/private/notificationActive.svg";
import { useAuth } from "~/queries/auth";
import { AppButton } from "~/shared/buttons/AppButton";

interface ProfileLoaderData {
  user: User;
}

export const loader: LoaderFunction = async ({ context }) => {
  if (!context?.user || !context?.isAuthenticated) {
    throw new Error("User not authenticated");
  }

  return {
    user: context.user,
  };
};

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user: initialUser } = useLoaderData<ProfileLoaderData>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [hasNotifications, setHasNotifications] = useState(false);

  // Используем данные из хука если доступны, иначе из loader
  const currentUser = user || initialUser;

  // Определяем отображаемое имя
  const displayName =
    currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.firstName ||
        currentUser?.lastName ||
        currentUser?.email?.split("@")[0] ||
        t("profile.user_name");

  // Определяем активную секцию на основе текущего пути
  const getActiveSection = () => {
    const path = location.pathname.split("/").pop();
    return path === "profile" ? "overview" : path;
  };

  const activeSection = getActiveSection();

  // Функция для получения названия и иконки активной страницы
  const getActivePageInfo = () => {
    switch (activeSection) {
      case "overview":
        return {
          title: displayName,
          icon: userSVG,
        };
      case "notifications":
        return {
          title: t("profile.navigation.notifications"),
          icon: notificationSVG,
        };
      case "my-bets":
        return {
          title: t("profile.navigation.my_bets"),
          icon: betSVG,
        };
      case "my-orders":
        return {
          title: t("profile.navigation.my_orders"),
          icon: ordersSVG,
        };
      case "my-addresses":
        return {
          title: t("profile.navigation.my_addresses"),
          icon: addresSVG,
        };
      case "payment-methods":
        return {
          title: t("profile.navigation.payment_methods"),
          icon: paymentSVG,
        };
      case "promo-codes":
        return {
          title: t("profile.navigation.promo_codes"),
          icon: promoSVG,
        };
      case "favorite-teams":
        return {
          title: t("profile.navigation.favorite_teams"),
          icon: teamsSVG,
        };
      case "my-wishlist":
        return {
          title: t("profile.navigation.my_wishlist"),
          icon: wishlistSVG,
        };
      case "support":
        return {
          title: t("profile.navigation.support"),
          icon: supportSVG,
        };
      default:
        return {
          title: displayName,
          icon: userSVG,
        };
    }
  };

  const activePageInfo = getActivePageInfo();

  // Функция для навигации с закрытием мобильного меню
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Функция для выхода с закрытием мобильного меню
  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  // Функция для перехода в админ панель с закрытием мобильного меню
  const handleAdminNavigation = () => {
    navigate("/admin");
    setIsMobileMenuOpen(false);
  };

  // Обработка клика вне меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    // Обработка нажатия Escape
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 mt-10 sm:mt-20 lg:mt-30 pt-12 pb-5">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Мобильное меню - кнопка */}
          <div className="lg:hidden">
            <AppButton
              ref={menuButtonRef}
              variant="secondary"
              size="md"
              fullWidth={false}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <img src={activePageInfo.icon} alt="Active page" className="w-5 h-5" />
                <span>{activePageInfo.title}</span>
              </div>
              <svg
                className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? "rotate-180" : ""}`}
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
            </AppButton>
          </div>

          {/* Мобильное меню - выпадающий список */}
          {isMobileMenuOpen && (
            <div ref={mobileMenuRef} className="lg:hidden bg-white rounded-lg shadow-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <img src={userSVG} alt="User" className="w-6 h-6" />
                  <span className="font-medium text-black text-sm">{displayName}</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-black"
                  aria-label={t("profile.navigation.close_menu")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <nav>
                <ul className="space-y-2">
                  <li>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                        activeSection === "overview" ? "bg-yellow-100 text-black" : "text-gray-700"
                      }`}
                      onClick={() => handleNavigation("/profile")}
                    >
                      <img src={userSVG} alt="User" className="w-5 h-5" />
                      <span className="text-sm">{displayName}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                        activeSection === "notifications"
                          ? "bg-yellow-100 text-black"
                          : "text-gray-700"
                      }`}
                      onClick={() => handleNavigation("/profile/notifications")}
                    >
                      <img src={notificationSVG} alt="notifications" className="w-5 h-5" />
                      <span className="text-sm">{t("profile.navigation.notifications")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                        activeSection === "my-bets" ? "bg-yellow-100 text-black" : "text-gray-700"
                      }`}
                      onClick={() => handleNavigation("/profile/my-bets")}
                    >
                      <img src={betSVG} alt="Bet" className="w-5 h-5" />
                      <span className="text-sm">{t("profile.navigation.my_bets")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                        activeSection === "my-orders" ? "bg-yellow-100 text-black" : "text-gray-700"
                      }`}
                      onClick={() => handleNavigation("/profile/my-orders")}
                    >
                      <img src={ordersSVG} alt="Orders" className="w-5 h-5" />
                      <span className="text-sm">{t("profile.navigation.my_orders")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                        activeSection === "my-addresses"
                          ? "bg-yellow-100 text-black"
                          : "text-gray-700"
                      }`}
                      onClick={() => handleNavigation("/profile/my-addresses")}
                    >
                      <img src={addresSVG} alt="Address" className="w-5 h-5" />
                      <span className="text-sm">{t("profile.navigation.my_addresses")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                        activeSection === "payment-methods"
                          ? "bg-yellow-100 text-black"
                          : "text-gray-700"
                      }`}
                      onClick={() => handleNavigation("/profile/payment-methods")}
                    >
                      <img src={paymentSVG} alt="Payment" className="w-5 h-5" />
                      <span className="text-sm">{t("profile.navigation.payment_methods")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                        activeSection === "promo-codes"
                          ? "bg-yellow-100 text-black"
                          : "text-gray-700"
                      }`}
                      onClick={() => handleNavigation("/profile/promo-codes")}
                    >
                      <img src={promoSVG} alt="Promo" className="w-5 h-5" />
                      <span className="text-sm">{t("profile.navigation.promo_codes")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                        activeSection === "favorite-teams"
                          ? "bg-yellow-100 text-black"
                          : "text-gray-700"
                      }`}
                      onClick={() => handleNavigation("/profile/favorite-teams")}
                    >
                      <img src={teamsSVG} alt="Teams" className="w-5 h-5" />
                      <span className="text-sm">{t("profile.navigation.favorite_teams")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                        activeSection === "my-wishlist"
                          ? "bg-yellow-100 text-black"
                          : "text-gray-700"
                      }`}
                      onClick={() => handleNavigation("/profile/my-wishlist")}
                    >
                      <img src={wishlistSVG} alt="Wishlist" className="w-5 h-5" />
                      <span className="text-sm">{t("profile.navigation.my_wishlist")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                        activeSection === "support" ? "bg-yellow-100 text-black" : "text-gray-700"
                      }`}
                      onClick={() => handleNavigation("/profile/support")}
                    >
                      <img src={supportSVG} alt="Support" className="w-5 h-5" />
                      <span className="text-sm">{t("profile.navigation.support")}</span>
                    </button>
                  </li>
                  {currentUser?.role === UserRole.ADMIN && (
                    <li>
                      <button
                        className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                        onClick={handleAdminNavigation}
                      >
                        <img src={adminSVG} alt="Admin Panel" className="w-5 h-5" />
                        <span className="text-sm">{t("profile.navigation.admin_panel")}</span>
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                      onClick={handleLogout}
                    >
                      <img src={exitSVG} alt="Exit" className="w-5 h-5" />
                      <span className="text-sm">{t("profile.navigation.logout")}</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {/* Десктопное меню */}
          <aside className="hidden h-fit lg:flex w-[280px] lg:shrink-0 bg-white flex-col py-4 sm:py-6 lg:py-8 px-4 sm:px-6 rounded-lg lg:rounded-none">
            <div className=" flex items-center justify-between mb-4 sm:mb-6">
              <div className=" w-full flex items-center space-x-2 cursor-pointer relative">
                {(activeSection === "overview" || activeSection === "notifications") && (
                  <div className="absolute -left-4 lg:-left-6 top-0 bottom-0 w-[4px] lg:w-[6px] bg-[#F4BE40]" />
                )}
                <div
                  className="w-full flex items-center space-x-2 cursor-pointer relative"
                  onClick={() => navigate("/profile")}
                >
                  <img src={userSVG} alt="User" className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="font-medium text-black text-sm sm:text-base">{displayName}</span>
                </div>
                <div
                  aria-label="Notification button"
                  className="w-full flex justify-end "
                  onClick={() => navigate("/profile/notifications")}
                >
                  <img
                    src={hasNotifications ? notificationActiveSVG : notificationSVG}
                    alt="Notification icon"
                  />
                </div>
              </div>
            </div>
            <nav className="flex-1">
              <ul className="space-y-4 sm:space-y-6 text-gray-700">
                <li
                  className={`flex items-center gap-2 hover:text-black cursor-pointer relative py-2`}
                  onClick={() => navigate("/profile/my-bets")}
                >
                  {activeSection === "my-bets" && (
                    <div className="absolute -left-4 lg:-left-6 top-0 bottom-0 w-[4px] lg:w-[6px] bg-[#F4BE40]" />
                  )}
                  <img src={betSVG} alt="Bet" className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-black text-sm sm:text-base">
                    {t("profile.navigation.my_bets")}
                  </span>
                </li>
                <li
                  className={`flex items-center gap-2 hover:text-black cursor-pointer relative py-2`}
                  onClick={() => navigate("/profile/my-orders")}
                >
                  {activeSection === "my-orders" && (
                    <div className="absolute -left-4 lg:-left-6 top-0 bottom-0 w-[4px] lg:w-[6px] bg-[#F4BE40]" />
                  )}
                  <img src={ordersSVG} alt="Orders" className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-black text-sm sm:text-base">
                    {t("profile.navigation.my_orders")}
                  </span>
                </li>
                <li
                  className={`flex items-center gap-2 hover:text-black cursor-pointer relative py-2`}
                  onClick={() => navigate("/profile/my-addresses")}
                >
                  {activeSection === "my-addresses" && (
                    <div className="absolute -left-4 lg:-left-6 top-0 bottom-0 w-[4px] lg:w-[6px] bg-[#F4BE40]" />
                  )}
                  <img src={addresSVG} alt="Address" className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-black text-sm sm:text-base">
                    {t("profile.navigation.my_addresses")}
                  </span>
                </li>
                <li
                  className={`flex items-center gap-2 hover:text-black cursor-pointer relative py-2`}
                  onClick={() => navigate("/profile/payment-methods")}
                >
                  {activeSection === "payment-methods" && (
                    <div className="absolute -left-4 lg:-left-6 top-0 bottom-0 w-[4px] lg:w-[6px] bg-[#F4BE40]" />
                  )}
                  <img src={paymentSVG} alt="Payment" className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-black text-sm sm:text-base">
                    {t("profile.navigation.payment_methods")}
                  </span>
                </li>
                <li
                  className={`flex items-center gap-2 hover:text-black cursor-pointer relative py-2`}
                  onClick={() => navigate("/profile/promo-codes")}
                >
                  {activeSection === "promo-codes" && (
                    <div className="absolute -left-4 lg:-left-6 top-0 bottom-0 w-[4px] lg:w-[6px] bg-[#F4BE40]" />
                  )}
                  <img src={promoSVG} alt="Promo" className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-black text-sm sm:text-base">
                    {t("profile.navigation.promo_codes")}
                  </span>
                </li>
                <li
                  className={`flex items-center gap-2 hover:text-black cursor-pointer relative py-2`}
                  onClick={() => navigate("/profile/favorite-teams")}
                >
                  {activeSection === "favorite-teams" && (
                    <div className="absolute -left-4 lg:-left-6 top-0 bottom-0 w-[4px] lg:w-[6px] bg-[#F4BE40]" />
                  )}
                  <img src={teamsSVG} alt="Teams" className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-black text-sm sm:text-base">
                    {t("profile.navigation.favorite_teams")}
                  </span>
                </li>
                <li
                  className={`flex items-center gap-2 hover:text-black cursor-pointer relative py-2`}
                  onClick={() => navigate("/profile/my-wishlist")}
                >
                  {activeSection === "my-wishlist" && (
                    <div className="absolute -left-4 lg:-left-6 top-0 bottom-0 w-[4px] lg:w-[6px] bg-[#F4BE40]" />
                  )}
                  <img src={wishlistSVG} alt="Wishlist" className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-black text-sm sm:text-base">
                    {t("profile.navigation.my_wishlist")}
                  </span>
                </li>
                <li
                  className={`flex items-center gap-2 hover:text-black cursor-pointer relative py-2`}
                  onClick={() => navigate("/profile/support")}
                >
                  {activeSection === "support" && (
                    <div className="absolute -left-4 lg:-left-6 top-0 bottom-0 w-[4px] lg:w-[6px] bg-[#F4BE40]" />
                  )}
                  <img src={supportSVG} alt="Support" className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-black text-sm sm:text-base">
                    {t("profile.navigation.support")}
                  </span>
                </li>
                {currentUser?.role === UserRole.ADMIN && (
                  <li
                    className="flex items-center gap-2 hover:text-black cursor-pointer py-2"
                    onClick={() => navigate("/admin")}
                  >
                    <img src={adminSVG} alt="Admin Panel" className="w-6 h-6 sm:w-8 sm:h-8" />
                    <span className="text-black text-sm sm:text-base">
                      {t("profile.navigation.admin_panel")}
                    </span>
                  </li>
                )}
                <li
                  className="flex items-center gap-2 hover:text-black cursor-pointer py-2"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  <img src={exitSVG} alt="Exit" className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-black text-sm sm:text-base">
                    {t("profile.navigation.logout")}
                  </span>
                </li>
              </ul>
            </nav>
          </aside>

          <div className="flex-1 lg:pl-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
