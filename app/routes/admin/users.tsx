import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import {
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
} from "material-react-table";
import type { User } from "~/types/user";
import { UserRole } from "~/types/user";
import { useUsers, useUpdateUserRole } from "~/queries/admin";
import { Badge } from "~/shared/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shared/ui/Select";
import MaterialDataTable from "~/components/tables/MaterialDataTable";
import { useTableProps } from "~/hooks/useTableProps";

interface AdminOutletContext {
  user: User;
}

const AdminUsers: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useOutletContext<AdminOutletContext>();

  // Состояние фильтров
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    role: "all",
  });

  // Загрузка данных
  const { data, isLoading, error } = useUsers(filters);
  const updateUserRole = useUpdateUserRole();

  // Базовые настройки таблицы
  const baseTableProps = useTableProps<User>();

  // Создание колонок для Material React Table
  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: t("admin.users.table.user"),
        size: 250,
        Cell: ({ row }) => {
          const fullName = row.original.firstName && row.original.lastName
            ? `${row.original.firstName} ${row.original.lastName}`
            : row.original.firstName || row.original.lastName;
          return (
            <div className="space-y-1">
              <div className="font-medium">
                {fullName || row.original.email.split("@")[0]}
              </div>
              <div className="text-sm text-gray-500">{row.original.email}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: t("admin.users.table.role"),
        size: 150,
        Cell: ({ row }) => {
          const isCurrentUser = row.original._id === user._id;

          // Для текущего пользователя показываем только badge
          if (isCurrentUser) {
            return (
              <div className="flex flex-col gap-1">
                <Badge
                  variant={
                    row.original.role === UserRole.ADMIN
                      ? "default"
                      : "secondary"
                  }
                  className={
                    row.original.role === UserRole.ADMIN
                      ? "bg-purple-100 text-purple-800"
                      : ""
                  }
                >
                  {row.original.role === UserRole.ADMIN ? "Admin" : "User"}
                </Badge>
              </div>
            );
          }

          // Для остальных пользователей показываем select
          return (
            <Select
              value={row.original.role}
              onValueChange={(newRole: string) => {
                updateUserRole.mutate({
                  userId: row.original._id,
                  role: newRole as UserRole,
                });
              }}
              disabled={updateUserRole.isPending}
            >
              <SelectTrigger className="w-28">
                <SelectValue>
                  <Badge
                    variant={
                      row.original.role === UserRole.ADMIN
                        ? "default"
                        : "secondary"
                    }
                    className={
                      row.original.role === UserRole.ADMIN
                        ? "bg-purple-100 text-purple-800"
                        : ""
                    }
                  >
                    {row.original.role === UserRole.ADMIN ? "Admin" : "User"}
                  </Badge>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.USER}>
                  <Badge variant="secondary">User</Badge>
                </SelectItem>
                <SelectItem value={UserRole.ADMIN}>
                  <Badge
                    variant="default"
                    className="bg-purple-100 text-purple-800"
                  >
                    Admin
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "verification",
        header: t("admin.users.table.verification"),
        size: 180,
        Cell: ({ row }) => {
          const verification = row.original.verification;
          if (!verification) {
            return (
              <Badge variant="secondary">
                {t("admin.users.verification.not_started")}
              </Badge>
            );
          }

          const completedSteps = [
            verification.step1Completed,
            verification.step2Completed,
            verification.step3Completed,
            verification.step4Completed,
          ].filter(Boolean).length;

          if (completedSteps === 4) {
            return (
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                {t("admin.users.verification.completed")}
              </Badge>
            );
          }

          return (
            <Badge
              variant="outline"
              className="border-yellow-300 text-yellow-800"
            >
              {t("admin.users.verification.in_progress", {
                steps: completedSteps,
              })}
            </Badge>
          );
        },
      },
      {
        accessorKey: "authentications",
        header: t("admin.users.table.auth_provider"),
        size: 150,
        Cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.authentications[0]?.provider || "Unknown"}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("admin.users.table.created_at"),
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
      },
    ],
    [t, updateUserRole, user._id]
  );

  // Состояние пагинации для MRT
  const paginationState: MRT_PaginationState = useMemo(
    () => ({
      pageIndex: filters.page - 1,
      pageSize: filters.limit,
    }),
    [filters.page, filters.limit]
  );

  // Создание таблицы с помощью MRT v3 hook
  const table = useMaterialReactTable({
    ...baseTableProps, // Применяем базовые настройки

    // Специфичные для этой таблицы настройки
    columns,
    data: data?.users || [],
    state: {
      isLoading,
      pagination: paginationState,
      showGlobalFilter: true,
    },
    rowCount: data?.pagination.total || 0,
    getRowId: (originalRow) => originalRow._id,

    // Обработчики событий
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function" ? updater(paginationState) : updater;

      setFilters((prev) => ({
        ...prev,
        page: newPagination.pageIndex + 1,
        limit: newPagination.pageSize,
      }));
    },

    // Кастомные стили для строк (выделяем текущего пользователя)
    muiTableBodyRowProps: ({ row }) => {
      const isCurrentUser = row.original._id === user._id;
      return {
        sx: isCurrentUser
          ? {
              backgroundColor: "rgba(59, 130, 246, 0.05)", // bg-blue-50
              "&:hover": {
                backgroundColor: "rgba(59, 130, 246, 0.1)", // bg-blue-100
              },
            }
          : {},
      };
    },

    // Переопределяем начальное состояние с пагинацией
    initialState: {
      ...baseTableProps.initialState,
      pagination: paginationState,
    },
  });

  // Статистика для отображения
  const renderStats = () => {
    if (!data) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600">
            {t("admin.users.stats.total_users")}
          </div>
          <div className="text-2xl font-bold mt-2">{data.stats.total}</div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600">
            {t("admin.users.stats.verified_users")}
          </div>
          <div className="text-2xl font-bold mt-2">{data.stats.verified}</div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600">
            {t("admin.users.stats.admin_users")}
          </div>
          <div className="text-2xl font-bold mt-2">{data.stats.admins}</div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.users.title")}</h1>
          <p className="text-gray-600 mt-2">{t("admin.users.subtitle")}</p>
        </div>
        <div className="border border-red-300 bg-red-50 rounded-lg p-4">
          <p className="text-red-800">{t("admin.users.error_loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold">{t("admin.users.title")}</h1>
        <p className="text-gray-600 mt-2">{t("admin.users.subtitle")}</p>
      </div>

      {/* Статистика */}
      {renderStats()}

      {/* Material React Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <MaterialDataTable table={table} />
      </div>
    </div>
  );
};

export default AdminUsers;
