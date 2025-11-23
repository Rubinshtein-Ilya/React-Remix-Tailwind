import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { AppButton } from "~/shared/buttons/AppButton";
import {
  useAdminPromoCodes,
  useCreatePromoCode,
  useDeletePromoCode,
} from "~/queries/admin/promoCode";
import { CreatePromoCodeDialog } from "~/components/Dialogs/CreatePromoCodeDialog";
import { Badge } from "~/shared/ui/Badge";
import MaterialDataTable from "~/components/tables/MaterialDataTable";
import { useTableProps } from "~/hooks/useTableProps";
import type { AdminPromoCode } from "~/api/admin/promoCode";

const AdminPromoCodes: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Хуки для работы с промокодами
  const { data: promoCodes = [], isLoading, refetch } = useAdminPromoCodes();
  const deletePromoCodeMutation = useDeletePromoCode();

  // Базовые настройки таблицы
  const baseTableProps = useTableProps<AdminPromoCode>();

  // Обработчик удаления промокода
  const handleDelete = async (id: string) => {
    if (window.confirm(t("admin.promo_codes.confirm_delete"))) {
      await deletePromoCodeMutation.mutateAsync(id);
    }
  };

  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // Форматирование срока действия
  const formatValidUntil = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  // Создание колонок для Material React Table
  const columns = useMemo<MRT_ColumnDef<AdminPromoCode>[]>(
    () => [
      {
        accessorKey: "code",
        header: t("admin.promo_codes.table.code"),
        size: 120,
        Cell: ({ row }) => (
          <div className="text-sm font-medium text-black">
            {row.original.code}
          </div>
        ),
      },
      {
        accessorKey: "discount",
        header: t("admin.promo_codes.table.discount"),
        size: 100,
        Cell: ({ row }) => (
          <div className="text-sm text-black">{row.original.discount}%</div>
        ),
      },
      {
        accessorKey: "description",
        header: t("admin.promo_codes.table.description"),
        size: 250,
        Cell: ({ row }) => (
          <div className="text-sm text-gray-700 max-w-xs truncate">
            {row.original.description}
          </div>
        ),
      },
      {
        accessorKey: "currentUses",
        header: t("admin.promo_codes.table.uses"),
        size: 120,
        Cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {row.original.currentUses}
            {row.original.maxUses && ` / ${row.original.maxUses}`}
          </div>
        ),
      },
      {
        accessorKey: "validUntil",
        header: t("admin.promo_codes.table.valid_until"),
        size: 120,
        Cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {formatValidUntil(row.original.validUntil)}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: t("admin.promo_codes.table.status"),
        size: 120,
        Cell: ({ row }) => {
          const isExpired = new Date(row.original.validUntil) < new Date();
          const isActive = row.original.isActive && !isExpired;

          return (
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={
                isActive
                  ? "bg-green-100 text-green-800"
                  : isExpired
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {isActive
                ? t("admin.promo_codes.status.active")
                : isExpired
                ? t("admin.promo_codes.status.expired")
                : t("admin.promo_codes.status.inactive")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: t("admin.promo_codes.table.created_at"),
        size: 150,
        Cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {formatDate(row.original.createdAt)}
          </div>
        ),
      },
      {
        accessorKey: "actions",
        header: t("admin.promo_codes.table.actions"),
        size: 100,
        enableSorting: false,
        Cell: ({ row }) => (
          <button
            onClick={() => handleDelete(row.original._id)}
            disabled={deletePromoCodeMutation.isPending}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-medium"
          >
            {t("admin.promo_codes.table.delete")}
          </button>
        ),
      },
    ],
    [
      t,
      deletePromoCodeMutation.isPending,
      handleDelete,
      formatDate,
      formatValidUntil,
    ]
  );

  // Создание таблицы с помощью MRT v3 hook
  const table = useMaterialReactTable({
    ...baseTableProps, // Применяем базовые настройки

    // Специфичные для этой таблицы настройки
    columns,
    data: promoCodes || [],
    state: {
      isLoading,
      showGlobalFilter: true,
    },
    getRowId: (originalRow) => originalRow._id,

    // Отключаем пагинацию для простоты (можно включить позже)
    enablePagination: false,
    enableBottomToolbar: false,

    // Переопределяем начальное состояние
    initialState: {
      ...baseTableProps.initialState,
      showGlobalFilter: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка добавления */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            {t("admin.promo_codes.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("admin.promo_codes.subtitle")}
          </p>
        </div>
        <AppButton
          variant="profile"
          onClick={() => setIsCreateDialogOpen(true)}
          className="!w-auto px-6"
        >
          {t("admin.promo_codes.create_new")}
        </AppButton>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-black">
            {promoCodes.length}
          </div>
          <div className="text-sm text-gray-600">
            {t("admin.promo_codes.stats.total_codes")}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-green-600">
            {promoCodes.filter((code) => code.isActive).length}
          </div>
          <div className="text-sm text-gray-600">
            {t("admin.promo_codes.stats.active_codes")}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-blue-600">
            {promoCodes.reduce((sum, code) => sum + code.currentUses, 0)}
          </div>
          <div className="text-sm text-gray-600">
            {t("admin.promo_codes.stats.total_uses")}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-orange-600">
            {
              promoCodes.filter(
                (code) => new Date(code.validUntil) < new Date()
              ).length
            }
          </div>
          <div className="text-sm text-gray-600">
            {t("admin.promo_codes.stats.expired_codes")}
          </div>
        </div>
      </div>

      {/* Material React Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <MaterialDataTable table={table} />
      </div>

      {/* Диалог создания промокода */}
      <CreatePromoCodeDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default AdminPromoCodes;
