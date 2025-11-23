import React, { useState } from "react";
import {
  Outlet,
  useOutletContext,
  Navigate,
  Link,
  useLocation,
} from "react-router";
import { useTranslation } from "react-i18next";
import type { User } from "~/types/user";
import { UserRole } from "~/types/user";
// Импортируем иконки
import userSVG from "../assets/images/private/user.svg";
import playerSVG from "../assets/images/private/player.svg";
import sportSVG from "../assets/images/private/sport.svg";
import itemTypeSVG from "../assets/images/private/item-type.svg";
import playerPositionSVG from "../assets/images/private/player-position.svg";
import ordersSVG from "../assets/images/private/orders.svg";
import paymentSVG from "../assets/images/private/payment.svg";
import teamsSVG from "../assets/images/private/teams.svg";
import promoSVG from "../assets/images/private/promo.svg";
import exitSVG from "../assets/images/private/exit.svg";
import addressSVG from "~/assets/images/private/addres.svg";
import warehouseSVG from "~/assets/images/private/warehouse.svg";
import itemAuthSVG from "~/assets/images/private/item-authentication.svg";
import labelSVG from "~/assets/images/private/item-label.svg";
import eventSVG from "~/assets/images/private/notification.svg";

interface PrivateOutletContext {
  user: User;
}

const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useOutletContext<PrivateOutletContext>();
  const location = useLocation();

  // Загружаем состояние из localStorage при инициализации
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Проверяем, является ли пользователь администратором
  if (!user || user.role !== UserRole.ADMIN) {
    return <Navigate to="/profile" replace />;
  }

  const adminNavItems = [
    {
      path: "/admin",
      label: t("admin.navigation.dashboard"),
      exact: true,
      icon: addressSVG,
    },
    {
      path: "/admin/users",
      label: t("admin.navigation.users"),
      icon: userSVG,
    },
    {
      path: "/admin/promo-codes",
      label: t("admin.navigation.promo_codes"),
      icon: promoSVG,
    },
    {
      path: "/admin/products",
      label: t("admin.navigation.products"),
      icon: warehouseSVG,
    },
    {
      path: "/admin/item-types",
      label: t("admin.navigation.item_types"),
      icon: itemTypeSVG,
    },
    {
      path: "/admin/item-labels",
      label: t("admin.itemLabels.title"),
      icon: labelSVG,
    },
    {
      path: "/admin/sports",
      label: t("admin.navigation.sports"),
      icon: sportSVG,
    },
    {
      path: "/admin/player-positions",
      label: t("admin.navigation.player_positions"),
      icon: playerPositionSVG,
    },
    {
      path: "/admin/teams",
      label: t("admin.navigation.teams"),
      icon: teamsSVG,
    },
    {
      path: "/admin/players",
      label: t("admin.navigation.players"),
      icon: playerSVG,
    },
    {
      path: "/admin/events",
      label: t("admin.navigation.events"),
      icon: eventSVG,
    },
    {
      path: "/admin/orders",
      label: t("admin.navigation.orders"),
      icon: ordersSVG,
    },
    {
      path: "/admin/authentication",
      label: "Аутентификация",
      icon: itemAuthSVG,
    },
  ];

  const isActiveRoute = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    // Сохраняем состояние в localStorage
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(newState));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 mt-30 px-20 pt-12">
      <div className="flex flex-col pt-2">
        <h1 className="text-3xl font-bold mb-8 text-black">
          {t("admin.title")}
        </h1>
      </div>
      <div className="flex flex-row flex-1 min-h-0">
        <aside
          className={`bg-white flex flex-col py-8 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed
              ? 'w-20 px-4'
              : 'w-[280px] px-6'
          } shrink-0`}
        >
          <nav className="flex-1">
            <ul className="space-y-6 text-gray-700">
              {/* Кнопка сворачивания как первый элемент списка */}
              <li className="flex items-center gap-2 hover:text-black cursor-pointer relative">
                <button
                  onClick={toggleSidebar}
                  className="flex items-center ml-2 gap-2 w-full"
                  title={isSidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
                >
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isSidebarCollapsed ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-nowrap text-black transition-all duration-300 ${
                      isSidebarCollapsed
                        ? 'opacity-0 w-0 overflow-hidden'
                        : 'opacity-100'
                    }`}
                  >
                    {isSidebarCollapsed ? "Развернуть" : "Свернуть"}
                  </span>
                </button>
              </li>

              {adminNavItems.map((item) => (
                <li
                  key={item.path}
                  className="flex items-center gap-2 hover:text-black cursor-pointer relative"
                >
                  {isActiveRoute(item.path, item.exact) && (
                    <div className={`absolute top-0 bottom-0 bg-[#F4BE40] transition-all duration-300 ${
                      isSidebarCollapsed
                        ? '-left-4 w-1'
                        : '-left-6 w-[6px]'
                    }`} />
                  )}
                  <Link
                    to={item.path}
                    className="flex items-center ml-2 gap-2 w-full"
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                      <img src={item.icon} alt={item.label} className="w-8 h-8" />
                    </div>
                    <span
                      className={`text-nowrap text-black transition-all duration-300 ${
                        isSidebarCollapsed
                          ? 'opacity-0 w-0 overflow-hidden'
                          : 'opacity-100'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
              <li className="flex items-center gap-2 hover:text-black cursor-pointer">
                <Link
                  to="/profile"
                  className="flex items-center ml-2 gap-2 w-full"
                  title={isSidebarCollapsed ? t("admin.back_to_profile") : undefined}
                >
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                    <img
                      src={exitSVG}
                      alt="Back to Profile"
                      className="w-8 h-8"
                    />
                  </div>
                  <span
                    className={`text-nowrap text-black transition-all duration-300 ${
                      isSidebarCollapsed
                        ? 'opacity-0 w-0 overflow-hidden'
                        : 'opacity-100'
                    }`}
                  >
                    {t("admin.back_to_profile")}
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <div className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'pl-6' : 'pl-10'
        }`}>
          <div className="h-full overflow-auto">
            <Outlet context={{ user }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
