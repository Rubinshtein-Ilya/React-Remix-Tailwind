import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const TransactionHistory: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"all" | "deposits" | "withdrawals">("all");

  // Временные данные для демонстрации
  const transactions = [
    {
      id: 1,
      type: "deposit",
      amount: "5000 ₽",
      method: "Банковская карта",
      status: "completed",
      date: "2024-03-20 15:30",
    },
    {
      id: 2,
      type: "withdrawal",
      amount: "3000 ₽",
      method: "Банковский перевод",
      status: "pending",
      date: "2024-03-19 12:45",
    },
    {
      id: 3,
      type: "deposit",
      amount: "10000 ₽",
      method: "Электронный кошелек",
      status: "completed",
      date: "2024-03-18 09:15",
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === "all") return true;
    return transaction.type === activeTab;
  });

  return (
    <>
      {/* Табы */}
      <div className="flex space-x-4 mb-8">
        <button
          className={`px-6 py-3 rounded-lg font-medium ${
            activeTab === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("all")}
        >
          {t("profile.transactions.all")}
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-medium ${
            activeTab === "deposits"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("deposits")}
        >
          {t("profile.transactions.deposits")}
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-medium ${
            activeTab === "withdrawals"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("withdrawals")}
        >
          {t("profile.transactions.withdrawals")}
        </button>
      </div>

      {/* Таблица транзакций */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("profile.transactions.type")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("profile.transactions.amount")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("profile.transactions.method")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("profile.transactions.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("profile.transactions.date")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === "deposit"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {transaction.type === "deposit"
                        ? t("profile.transactions.deposit")
                        : t("profile.transactions.withdrawal")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {transaction.status === "completed"
                        ? t("profile.transactions.completed")
                        : t("profile.transactions.pending")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TransactionHistory; 