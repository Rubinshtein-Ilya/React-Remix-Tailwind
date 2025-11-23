import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import { MRT_Localization_RU } from "material-react-table/locales/ru";
import { AppButton } from "~/shared/buttons/AppButton";
import { Input } from "~/shared/inputs/Input";
import type { Bet, BetStatus, BetType, BetFilters } from "~/types/bet";
import { BetStatus as BetStatusEnum, BetType as BetTypeEnum } from "~/types/bet";
import axios from "axios";

interface MyBetsProps {
  onBack: () => void;
}

const MyBets: React.FC<MyBetsProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [filters, setFilters] = useState<BetFilters>({});

  // Запрос ставок
  const {
    data: betsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["bets", pagination, sorting, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
        ...filters,
      });

      const response = await axios.get(`/api/bets?${params}`);
      return response.data;
    },
  });

  // Получение статуса ставки на русском
  const getBetStatusText = (status: BetStatus) => {
    switch (status) {
      case BetStatusEnum.ACTIVE:
        return t("bets.status.active", "Активная");
      case BetStatusEnum.WON:
        return t("bets.status.won", "Выиграна");
      case BetStatusEnum.LOST:
        return t("bets.status.lost", "Проиграна");
      case BetStatusEnum.CANCELLED:
        return t("bets.status.cancelled", "Отменена");
      case BetStatusEnum.PENDING:
        return t("bets.status.pending", "Ожидает");
      default:
        return status;
    }
  };

  // Получение типа ставки на русском
  const getBetTypeText = (type: BetType) => {
    switch (type) {
      case BetTypeEnum.AUCTION:
        return t("bets.type.auction", "Аукцион");
      case BetTypeEnum.INSTANT_BUY:
        return t("bets.type.instant_buy", "Мгновенная покупка");
      case BetTypeEnum.RESERVE:
        return t("bets.type.reserve", "Резерв");
      default:
        return type;
    }
  };

  // Получение цвета статуса
  const getStatusColor = (status: BetStatus) => {
    switch (status) {
      case BetStatusEnum.ACTIVE:
        return "text-blue-600";
      case BetStatusEnum.WON:
        return "text-green-600";
      case BetStatusEnum.LOST:
        return "text-red-600";
      case BetStatusEnum.CANCELLED:
        return "text-gray-600";
      case BetStatusEnum.PENDING:
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  // Определение колонок таблицы
  const columns = useMemo<MRT_ColumnDef<Bet>[]>(
    () => [
      {
        accessorKey: "productImage",
        header: "",
        size: 80,
        enableSorting: false,
        Cell: ({ cell }) => (
          <img
            src={cell.getValue<string>()}
            alt="Product"
            className="w-12 h-12 object-cover rounded"
          />
        ),
      },
      {
        accessorKey: "productName",
        header: t("bets.table.product", "Товар"),
        size: 200,
      },
      {
        accessorKey: "amount",
        header: t("bets.table.amount", "Сумма ставки"),
        size: 120,
        Cell: ({ cell }) => (
          <span className="font-medium">
            {cell.getValue<number>().toLocaleString()} ₽
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: t("bets.table.type", "Тип"),
        size: 120,
        Cell: ({ cell }) => (
          <span className="px-2 py-1 rounded-full text-sm bg-gray-100">
            {getBetTypeText(cell.getValue<BetType>())}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: t("bets.table.status", "Статус"),
        size: 120,
        Cell: ({ cell }) => {
          const status = cell.getValue<BetStatus>();
          return (
            <span className={`font-medium ${getStatusColor(status)}`}>
              {getBetStatusText(status)}
            </span>
          );
        },
      },
      {
        accessorKey: "placedAt",
        header: t("bets.table.placed_at", "Дата размещения"),
        size: 150,
        Cell: ({ cell }) => (
          <span>
            {new Date(cell.getValue<number>()).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ),
      },
      {
        accessorKey: "currentBid",
        header: t("bets.table.current_bid", "Текущая ставка"),
        size: 120,
        Cell: ({ cell, row }) => {
          const bet = row.original;
          if (bet.type !== BetTypeEnum.AUCTION) return null;
          
          const currentBid = cell.getValue<number>();
          return currentBid ? (
            <span className="font-medium">
              {currentBid.toLocaleString()} ₽
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          );
        },
      },
      {
        accessorKey: "endTime",
        header: t("bets.table.end_time", "Окончание"),
        size: 150,
        Cell: ({ cell, row }) => {
          const bet = row.original;
          if (bet.type !== BetTypeEnum.AUCTION) return null;
          
          const endTime = cell.getValue<number>();
          if (!endTime) return <span className="text-gray-400">—</span>;
          
          const now = Date.now();
          const timeLeft = endTime - now;
          
          if (timeLeft <= 0) {
            return <span className="text-red-600">Завершен</span>;
          }
          
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          
          return (
            <span className="text-blue-600">
              {hours}ч {minutes}м
            </span>
          );
        },
      },
    ],
    [t]
  );

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка назад */}
      <div className="flex items-center gap-4">
        <AppButton
          onClick={onBack}
          variant="secondary"
          size="sm"
        >
          ← {t("common.back", "Назад")}
        </AppButton>
        <h1 className="text-2xl font-bold text-black">
          {t("bets.title", "Мои ставки")}
        </h1>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-black mb-4">
          {t("bets.filters.title", "Фильтры")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("bets.filters.status", "Статус")}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value as BetStatus || undefined,
                })
              }
            >
              <option value="">{t("bets.filters.all_statuses", "Все статусы")}</option>
              <option value={BetStatusEnum.ACTIVE}>
                {getBetStatusText(BetStatusEnum.ACTIVE)}
              </option>
              <option value={BetStatusEnum.WON}>
                {getBetStatusText(BetStatusEnum.WON)}
              </option>
              <option value={BetStatusEnum.LOST}>
                {getBetStatusText(BetStatusEnum.LOST)}
              </option>
              <option value={BetStatusEnum.CANCELLED}>
                {getBetStatusText(BetStatusEnum.CANCELLED)}
              </option>
              <option value={BetStatusEnum.PENDING}>
                {getBetStatusText(BetStatusEnum.PENDING)}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("bets.filters.type", "Тип")}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.type || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: e.target.value as BetType || undefined,
                })
              }
            >
              <option value="">{t("bets.filters.all_types", "Все типы")}</option>
              <option value={BetTypeEnum.AUCTION}>
                {getBetTypeText(BetTypeEnum.AUCTION)}
              </option>
              <option value={BetTypeEnum.INSTANT_BUY}>
                {getBetTypeText(BetTypeEnum.INSTANT_BUY)}
              </option>
              <option value={BetTypeEnum.RESERVE}>
                {getBetTypeText(BetTypeEnum.RESERVE)}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("bets.filters.date_from", "Дата с")}
            </label>
            <Input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  dateFrom: e.target.value || undefined,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("bets.filters.date_to", "Дата до")}
            </label>
            <Input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  dateTo: e.target.value || undefined,
                })
              }
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <AppButton
            onClick={() => refetch()}
            variant="primary"
            size="sm"
          >
            {t("bets.filters.apply", "Применить")}
          </AppButton>
          <AppButton
            onClick={() => {
              setFilters({});
              refetch();
            }}
            variant="secondary"
            size="sm"
          >
            {t("bets.filters.reset", "Сбросить")}
          </AppButton>
        </div>
      </div>

      {/* Таблица ставок */}
      <div className="bg-white rounded-lg shadow">
        <MaterialReactTable
          columns={columns}
          data={betsData?.bets || []}
          localization={MRT_Localization_RU}
          state={{
            isLoading,
            pagination,
            sorting,
          }}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          manualPagination
          manualSorting
          rowCount={betsData?.total || 0}
          enableColumnActions={false}
          enableColumnFilters={false}
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          muiTableProps={{
            sx: {
              '& .MuiTableCell-root': {
                borderBottom: '1px solid #e5e7eb',
              },
              '& .MuiTableHead-root': {
                backgroundColor: '#f9fafb',
              },
            },
          }}
          muiTableHeadCellProps={{
            sx: {
              fontWeight: 600,
              color: '#374151',
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              color: '#111827',
            },
          }}
          renderEmptyRowsFallback={() => (
            <div className="p-8 text-center text-gray-500">
              {isError
                ? t("bets.error", "Ошибка загрузки ставок")
                : t("bets.no_bets", "У вас нет ставок")}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default MyBets; 