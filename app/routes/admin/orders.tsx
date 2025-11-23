import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import MaterialDataTable from "~/components/tables/MaterialDataTable";
import { useTableProps } from "~/hooks/useTableProps";
import { useAdminOrders } from "~/queries/admin";
import { getLoadMoreQueryProps } from "~/components/tables/LoadMoreQueryProps";
import { TableFilters, type FilterType } from "~/shared/admin/tableFilter/TableFilters";
import type { IOrder } from "server/models/Order";
import { Link } from "react-router";

const AdminOrders: React.FC = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterType<IOrder>>({ search: "" });

  const ordersQuery = useAdminOrders(filter);
  const { data, isLoading, isFetching, error } = ordersQuery;

  useEffect(() => {
    ordersQuery.refetch();
  }, [filter]);

  const tableFilters = useMemo(() => {
    return (
      <TableFilters<IOrder>
        filterDescriptions={[
          {
            name: "status",
            label: t("admin.orders.table.status"),
            def: "",
            type: "select",
            allLabel: t("admin.orders.filter.all_statuses"),
            sortOptions: false,
            options: [
              {
                _id: "CANCELLED",
                name: t("admin.orders.status.cancelled")
              },
              {
                _id: "WAITING_PAYMENT",
                name: t("admin.orders.status.waiting_payment")
              },
              {
                _id: "WAITING_CONFIRMATION",
                name: t("admin.orders.status.waiting_confirmation")
              },
              {
                _id: "IN_ASSEMBLY",
                name: t("admin.orders.status.in_assembly")
              },
              {
                _id: "IN_DELIVERY",
                name: t("admin.orders.status.in_delivery")
              },
              {
                _id: "COMPLETED",
                name: t("admin.orders.status.completed")
              },
            ],
          },
          {
            name: "salesMethod",
            label: t("admin.orders.table.sales_method"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: [
              {
                _id: "fixed",
                name: t("admin.orders.table.sales_method_fixed")
              },
              {
                _id: "bidding",
                name: t("admin.orders.table.sales_method_bidding")
              },
            ],
          },
          {
            name: "userId",
            label: t("admin.orders.table.user_id"),
            def: "",
            placeholder: "ID пользователя",
            type: "input"
          }
        ]}
        applyFilter={(newFilter) => {
          setFilter({
            search: newFilter.search,
            status: newFilter.status,
            salesMethod: newFilter.salesMethod,
            userId: newFilter.userId
          });
        }}
      />
    )
  }, [t]);

  const orders = useMemo(() => {
    return data?.pages.flatMap((page) => page.orders) || [];
  }, [data, filter]);

  // Базовые настройки таблицы
  const baseTableProps = useTableProps<IOrder>({
    manualPagination: false
  });

  // Создание колонок для Material React Table
  const columns = useMemo<MRT_ColumnDef<IOrder>[]>(
    () => [
      {
        accessorKey: "_id",
        header: t("admin.orders.table._id"),
        size: 200,
        Cell: ({ cell }) => (
          <div className="flex items-center gap-2">
            <div className="font-medium text-sm">
              {cell.getValue() as string}
            </div>
            <Link
              to={`/admin/order/${cell.getValue() as string}`}
              className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
              title={t("admin.orders.actions.view")}
            >
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </Link>
          </div>
        ),
      },
      {
        accessorKey: "userId",
        header: t("admin.orders.table.user_id"),
        size: 200,
        Cell: ({ cell }) => (
          <div className="font-medium text-sm">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t("admin.orders.table.status"),
        size: 150,
        Cell: ({ cell }) => {
          const status = cell.getValue() as string;
          const statusTranslations: Record<string, string> = {
            WAITING_PAYMENT: t("admin.orders.status.waiting_payment"),
            WAITING_CONFIRMATION: t("admin.orders.status.waiting_confirmation"),
            IN_ASSEMBLY: t("admin.orders.status.in_assembly"),
            IN_DELIVERY: t("admin.orders.status.in_delivery"),
            COMPLETED: t("admin.orders.status.completed"),
            CANCELLED: t("admin.orders.status.cancelled"),
          };

          const statusColors: Record<string, string> = {
            WAITING_PAYMENT: "bg-yellow-100 text-yellow-800",
            WAITING_CONFIRMATION: "bg-blue-100 text-blue-800",
            IN_ASSEMBLY: "bg-purple-100 text-purple-800",
            IN_DELIVERY: "bg-orange-100 text-orange-800",
            COMPLETED: "bg-green-100 text-green-800",
            CANCELLED: "bg-red-100 text-red-800",
          };

          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
              {statusTranslations[status] || status}
            </span>
          );
        },
      },
      {
        accessorKey: "amount",
        header: t("admin.orders.table.amount"),
        size: 120,
        Cell: ({ cell }) => (
          <div className="text-sm">
            {cell.getValue() as number}
          </div>
        ),
      },
      {
        accessorKey: "total",
        header: t("admin.orders.table.total"),
        size: 120,
        Cell: ({ cell }) => (
          <div className="text-sm font-medium">
            {(cell.getValue() as number).toLocaleString('ru-RU')} ₽
          </div>
        ),
      },
      {
        accessorKey: "salesMethod",
        header: t("admin.orders.table.sales_method"),
        size: 120,
        Cell: ({ cell }) => {
          const method = cell.getValue() as string;
          return (
            <span className="text-sm">
              {method === "fixed"
                ? t("admin.orders.table.sales_method_fixed")
                : t("admin.orders.table.sales_method_bidding")
              }
            </span>
          );
        },
      },
      {
        accessorKey: "address",
        header: t("admin.orders.table.address"),
        size: 250,
        Cell: ({ row }) => {
          const address = row.original.address;
          return (
            <div className="text-sm">
              <div>{address.street}</div>
              <div className="text-gray-500">
                {address.city}, {address.country} {address.postalCode}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "paymentDeadlineAt",
        header: t("admin.orders.table.payment_deadline"),
        size: 150,
        Cell: ({ row }) => {
          const date = new Date(row.original.paymentDeadlineAt);
          return (
            <span className="text-sm text-gray-500">
              {date.toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: t("admin.orders.table.created_at"),
        size: 120,
        Cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <span className="text-sm text-gray-500">
              {date.toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          );
        },
      }
    ],
    [t]
  );

  // Создание таблицы с помощью MRT v3 hook
  const table = useMaterialReactTable({
    ...baseTableProps, // Применяем базовые настройки

    // Специфичные для этой таблицы настройки
    columns,
    data: orders,
    state: {
      isLoading: isLoading || isFetching,
      showGlobalFilter: true,
    },

    getRowId: (originalRow) => originalRow._id,

    // Переопределяем начальное состояние с пагинацией
    initialState: {
      ...baseTableProps.initialState,
      showGlobalFilter: true
    },

    ...getLoadMoreQueryProps<IOrder, any>(
      ordersQuery
    ),
  });

  if (error) {
    return (
      <div className="space-y-6 pb-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.orders.title")}</h1>
            <p className="text-gray-600 mt-2">{t("admin.orders.subtitle")}</p>
          </div>
        </div>

        <div className="border border-red-300 bg-red-50 rounded-lg p-4">
          <p className="text-red-800">{t("admin.orders.error_loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.orders.title")}</h1>
          <p className="text-gray-600 mt-2">{t("admin.orders.subtitle")}</p>
        </div>
      </div>

      {tableFilters}

      <div className="rounded-lg border bg-white shadow-sm">
        <MaterialDataTable table={table} />
      </div>
    </div>
  );
};

export default AdminOrders; 