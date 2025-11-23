import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";

const Security: React.FC = () => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика изменения пароля
    console.log("Изменение пароля:", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    // Здесь будет логика включения/выключения двухфакторной аутентификации
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Изменение пароля */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {t("profile.security.change_password")}
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700"
            >
              {t("profile.security.current_password")}
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              {t("profile.security.new_password")}
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              {t("profile.security.confirm_password")}
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end">
            <AppButton type="submit" variant="primary">
              {t("profile.security.change_password")}
            </AppButton>
          </div>
        </form>
      </div>

      {/* Двухфакторная аутентификация */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {t("profile.security.two_factor")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {t("profile.security.two_factor_desc")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleTwoFactorToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              twoFactorEnabled ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                twoFactorEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Активные сессии */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {t("profile.security.active_sessions")}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Windows 10 • Chrome
              </p>
              <p className="text-sm text-gray-500">IP: 192.168.1.1</p>
              <p className="text-sm text-gray-500">
                {t("profile.security.last_active")}: 5 минут назад
              </p>
            </div>
            <AppButton variant="secondary" size="sm">
              {t("profile.security.terminate")}
            </AppButton>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">
                iPhone 12 • Safari
              </p>
              <p className="text-sm text-gray-500">IP: 192.168.1.2</p>
              <p className="text-sm text-gray-500">
                {t("profile.security.last_active")}: 1 час назад
              </p>
            </div>
            <AppButton variant="secondary" size="sm">
              {t("profile.security.terminate")}
            </AppButton>
          </div>
        </div>
      </div>

      {/* История входов */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {t("profile.security.login_history")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("profile.security.date")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("profile.security.device")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("profile.security.ip")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("profile.security.status")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  2024-03-20 15:30
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Windows 10 • Chrome
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  192.168.1.1
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {t("profile.security.successful")}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  2024-03-19 12:45
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  iPhone 12 • Safari
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  192.168.1.2
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    {t("profile.security.failed")}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Security; 