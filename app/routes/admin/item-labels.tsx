import React, {useMemo, useState} from "react";
import { useTranslation } from "react-i18next";
import {
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { useAddItemLabel, useDeleteItemLabel, useUpdateItemLabel } from "~/queries/admin";
import MaterialDataTable from "~/components/tables/MaterialDataTable";
import { useTableProps } from "~/hooks/useTableProps";
import { useItemLabels } from "~/queries/public";
import type { ItemLabel } from "~/types/itemLabel";
import { AppButton } from "~/shared/buttons/AppButton";
import { CreateItemLabelDialog } from "~/components/Dialogs/adminModals/createDialog/itemLabel/CreateItemLabelDialog";
import { ConfirmDeleteItemLabelDialog } from "~/components/Dialogs/adminModals/createDialog/itemLabel/ConfirmDeleteItemLabelDialog";
import { EditItemLabelDialog } from "~/components/Dialogs/adminModals/createDialog/itemLabel/EditItemLabelDialog";

const ItemLabels: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogLabelId, setDeleteDialogLabelId] = useState<string | undefined>(undefined);
  const [editDialogLabel, setEditDialogLabel] = useState<ItemLabel | null>(null);

  const { data: itemLabels, isLoading, error } = useItemLabels();

  // Базовые настройки таблицы
  const baseTableProps = useTableProps<ItemLabel>({
    manualPagination: false
  });

  // Создание колонок для Material React Table
  const columns = useMemo<MRT_ColumnDef<ItemLabel>[]>(
    () => [
      {
        accessorKey: "_id",
        header: t("admin.itemLabels.table._id"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "name.ru",
        header: t("admin.itemLabels.table.name_ru"),
        size: 200,
        Cell: ({ row }) => (
          <div className="font-medium">
            {row.original.name.ru}
          </div>
        ),
      },
      {
        accessorKey: "name.en",
        header: t("admin.itemLabels.table.name_en"),
        size: 200,
        Cell: ({ row }) => (
          <div className="font-medium">
            {row.original.name.en}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: t("admin.itemLabels.table.description"),
        size: 250,
        Cell: ({ row }) => {
          const description = row.original.description;
          return (
            <div className="space-y-1">
              <div className="font-medium text-sm">
                <span className="text-gray-500">RU:</span> {description.ru}
              </div>
              <div className="font-medium text-sm">
                <span className="text-gray-500">EN:</span> {description.en}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: t("admin.itemLabels.table.created_at"),
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
        header: t("admin.itemLabels.table.actions"),
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => setEditDialogLabel(row.original)}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50 text-sm font-medium"
            >
              {t("admin.itemLabels.actions.edit")}
            </button>
            <button
              onClick={() => setDeleteDialogLabelId(row.original._id)}
              className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-medium"
            >
              {t("admin.itemLabels.actions.delete")}
            </button>
          </div>
        ),
      },
    ],
    [t]
  );

  // Создание таблицы с помощью MRT v3 hook
  const table = useMaterialReactTable({
    ...baseTableProps,
    columns,
    data: itemLabels || [],
    state: {
      isLoading,
      showGlobalFilter: true,
    },
    getRowId: (originalRow) => originalRow._id,
    enablePagination: false,
    enableBottomToolbar: false,
    initialState: {
      ...baseTableProps.initialState,
    },
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.itemLabels.title")}</h1>
          <p className="text-gray-600 mt-2">{t("admin.itemLabels.subtitle")}</p>
        </div>
        <AppButton
          variant="profile"
          onClick={() => setIsCreateDialogOpen(true)}
          className="!w-auto px-6"
        >
          {t("admin.itemLabels.create_label")}
        </AppButton>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 rounded-lg p-4">
          <p className="text-red-800">{t("admin.itemLabels.error_loading")}</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm">
          <MaterialDataTable table={table} />
        </div>
      )}

      <CreateItemLabelDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
        }}
      />

      <EditItemLabelDialog
        isOpen={editDialogLabel !== null}
        onClose={() => setEditDialogLabel(null)}
        itemLabel={editDialogLabel}
        onSuccess={() => {
          setEditDialogLabel(null);
        }}
      />

      <ConfirmDeleteItemLabelDialog
        labelId={deleteDialogLabelId || ""}
        isOpen={deleteDialogLabelId !== undefined}
        onClose={() => {
          setDeleteDialogLabelId(undefined);
        }}
      />
    </div>
  );
};

export default ItemLabels; 