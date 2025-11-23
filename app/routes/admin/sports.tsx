import React, {useMemo, useState} from "react";
import { useTranslation } from "react-i18next";
import {
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { useAddSport, useDeleteSport } from "~/queries/admin";
import MaterialDataTable from "~/components/tables/MaterialDataTable";
import { useTableProps } from "~/hooks/useTableProps";
import { useSports } from "~/queries/public";
import type { ISport } from "../../../server/models/Sport";
import {AppButton} from "~/shared/buttons/AppButton";
import {CreateSportDialog} from "~/components/Dialogs/adminModals/createDialog/sport/CreateSportDialog";
import {ConfirmDeleteSportDialog} from "~/components/Dialogs/adminModals/createDialog/sport/ConfirmDeleteSportDialog";

const Sports: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogSportId, setDeleteDialogSportId] = useState<string | undefined>(undefined);

  const { data: sports, isLoading, error } = useSports();

  const useDeleteSportMutation = useDeleteSport();

  // Базовые настройки таблицы
  const baseTableProps = useTableProps<ISport>({
    manualPagination: false
  });

  // Создание колонок для Material React Table
  const columns = useMemo<MRT_ColumnDef<ISport>[]>(
    () => [
      {
        accessorKey: "_id",
        header: t("admin.sports.table._id"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: t("admin.sports.table.name"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: t("admin.sports.table.description"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("admin.sports.table.created_at"),
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
      {
        accessorKey: "actions",
        header: t("admin.sports.table.actions"),
        size: 100,
        enableSorting: false,
        Cell: ({ row }) => (
          <button
            onClick={() => setDeleteDialogSportId(row.original._id)}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-medium"
          >
            {t("admin.sports.actions.delete")}
          </button>
        ),
      },
    ],
    [t, useDeleteSportMutation]
  );

  // Создание таблицы с помощью MRT v3 hook
  const table = useMaterialReactTable({
    ...baseTableProps, // Применяем базовые настройки

    // Специфичные для этой таблицы настройки
    columns,
    data: sports || [],
    state: {
      isLoading,
      showGlobalFilter: true,
    },

    getRowId: (originalRow) => originalRow._id,

    // Отключаем пагинацию для простоты (можно включить позже)
    enablePagination: false,
    enableBottomToolbar: false,

    // Переопределяем начальное состояние с пагинацией
    initialState: {
      ...baseTableProps.initialState,
    },
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.sports.title")}</h1>
          <p className="text-gray-600 mt-2">{t("admin.sports.subtitle")}</p>
        </div>
        <AppButton
          variant="profile"
          onClick={() => setIsCreateDialogOpen(true)}
          className="!w-auto px-6"
        >
          {t("admin.sports.create_sport")}
        </AppButton>
      </div>


      {error ? (
        <div className="border border-red-300 bg-red-50 rounded-lg p-4">
          <p className="text-red-800">{t("admin.sports.error_loading")}</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm">
          <MaterialDataTable table={table} />
        </div>
      )}

      <CreateSportDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
        }}
      />

      <ConfirmDeleteSportDialog
        sportId={deleteDialogSportId || ""}
        isOpen={deleteDialogSportId !== undefined}
        onClose={() => {
          setDeleteDialogSportId(undefined);
        }}
      />
    </div>
  );
};

export default Sports;
