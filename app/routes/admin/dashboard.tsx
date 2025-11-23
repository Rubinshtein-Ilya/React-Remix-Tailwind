import React from "react";
import { Link, useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import type { User } from "~/types/user";

interface AdminOutletContext {
  user: User;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useOutletContext<AdminOutletContext>();

  // Моковые данные для статистики
  const stats = [
    {
      title: t("admin.dashboard.stats.total_users"),
      value: "1,247",
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: t("admin.dashboard.stats.total_products"),
      value: "89",
      change: "+3%",
      changeType: "positive" as const,
    },
    {
      title: t("admin.dashboard.stats.total_orders"),
      value: "456",
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: t("admin.dashboard.stats.revenue"),
      value: "₽2,847,392",
      change: "+15%",
      changeType: "positive" as const,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "user_registered",
      description: t("admin.dashboard.activity.user_registered", { email: "user@example.com" }),
      timestamp: "2 минуты назад",
    },
    {
      id: 2,
      type: "order_placed",
      description: t("admin.dashboard.activity.order_placed", { orderId: "#12345", amount: "₽15,000" }),
      timestamp: "5 минут назад",
    },
    {
      id: 3,
      type: "product_added",
      description: t("admin.dashboard.activity.product_added", { product: "Футболка Реал Мадрид" }),
      timestamp: "1 час назад",
    },
    {
      id: 4,
      type: "user_verified",
      description: t("admin.dashboard.activity.user_verified", { email: "user2@example.com" }),
      timestamp: "2 часа назад",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("admin.dashboard.title")}
        </h1>
        <p className="text-gray-600 mt-2">
          {t("admin.dashboard.subtitle")}
        </p>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                stat.changeType === "positive" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Последняя активность */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("admin.dashboard.recent_activity")}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "user_registered" ? "bg-blue-500" :
                    activity.type === "order_placed" ? "bg-green-500" :
                    activity.type === "product_added" ? "bg-purple-500" :
                    "bg-yellow-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("admin.dashboard.quick_actions")}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="text-sm font-medium text-blue-900">
                  {t("admin.dashboard.actions.add_product")}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {t("admin.dashboard.actions.add_product_desc")}
                </div>
              </button>

              <Link to="/admin/orders">
                <button className="p-4 w-full text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="text-sm font-medium text-green-900">
                    {t("admin.dashboard.actions.view_orders")}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {t("admin.dashboard.actions.view_orders_desc")}
                  </div>
                </button>
              </Link>
              
              <button className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="text-sm font-medium text-purple-900">
                  {t("admin.dashboard.actions.manage_users")}
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  {t("admin.dashboard.actions.manage_users_desc")}
                </div>
              </button>
              
              <button className="p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <div className="text-sm font-medium text-orange-900">
                  {t("admin.dashboard.actions.view_analytics")}
                </div>
                <div className="text-xs text-orange-600 mt-1">
                  {t("admin.dashboard.actions.view_analytics_desc")}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 