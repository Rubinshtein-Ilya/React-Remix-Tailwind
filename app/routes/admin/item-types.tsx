import React, {useMemo, useState} from "react";
import { useTranslation } from "react-i18next";
import {
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import MaterialDataTable from "~/components/tables/MaterialDataTable";
import { useTableProps } from "~/hooks/useTableProps";
import { useItemTypes } from "~/queries/public";
import { AppButton} from "~/shared/buttons/AppButton";
import type { IItemType } from "../../../server/models/ItemType";
import { CreateItemTypeDialog } from "~/components/Dialogs/adminModals/createDialog/itemType/CreateItemTypeDialog";
import {
  ConfirmDeleteItemTypeDialog
} from "~/components/Dialogs/adminModals/createDialog/itemType/ConfirmDeleteItemTypeDialog";
import {SportIdChipSelector} from "~/components/SportIdChipSelector";

const ItemTypes: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogItemTypeId, setDeleteDialogItemTypeId] = useState<string | undefined>(undefined);

  const [sportId, setSportId] = useState<string | undefined>(undefined);

  const { data: itemTypesBySport, isLoading, error } = useItemTypes();

  const itemTypes = useMemo(
    () => {
      if (itemTypesBySport) {
        return sportId
          ? itemTypesBySport[sportId] || []
          : Object.keys(itemTypesBySport).reduce((acc: IItemType[], key: string) => [...acc, ...itemTypesBySport[key]], []);
      }

      return [];
    },
    [sportId, itemTypesBySport]
  );

  // Базовые настройки таблицы
  const baseTableProps = useTableProps<IItemType>({
    manualPagination: false
  });

  // Создание колонок для Material React Table
  const columns = useMemo<MRT_ColumnDef<IItemType>[]>(
    () => [
      {
        accessorKey: "_id",
        header: t("admin.item_types.table._id"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "sportId",
        header: t("admin.item_types.table.sport_id"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: t("admin.item_types.table.name"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: t("admin.item_types.table.description"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("admin.item_types.table.created_at"),
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
        header: t("admin.item_types.table.actions"),
        size: 100,
        enableSorting: false,
        Cell: ({ row }) => (
          <button
            onClick={() => setDeleteDialogItemTypeId(row.original._id)}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-medium"
          >
            {t("admin.item_types.actions.delete")}
          </button>
        ),
      },
    ],
    [t]
  );

  // Создание таблицы с помощью MRT v3 hook
  const table = useMaterialReactTable({
    ...baseTableProps, // Применяем базовые настройки

    // Специфичные для этой таблицы настройки
    columns,
    data: itemTypes,
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
      showGlobalFilter: true
    },
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.item_types.title")}</h1>
          <p className="text-gray-600 mt-2">{t("admin.item_types.subtitle")}</p>
        </div>
        <AppButton
          variant="profile"
          onClick={() => setIsCreateDialogOpen(true)}
          className="!w-auto px-6"
        >
          {t("admin.item_types.create_sport")}
        </AppButton>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 rounded-lg p-4">
          <p className="text-red-800">{t("admin.item_types.error_loading")}</p>
        </div>
      ) : (
        <>
          <SportIdChipSelector sportId={sportId} setSportId={setSportId} />

          <div className="rounded-lg border bg-white shadow-sm">
            <MaterialDataTable table={table} />
          </div>
        </>
      )}

      <CreateItemTypeDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
        }}
      />

      <ConfirmDeleteItemTypeDialog
        itemTypeId={deleteDialogItemTypeId || ""}
        isOpen={deleteDialogItemTypeId !== undefined}
        onClose={() => {
          setDeleteDialogItemTypeId(undefined);
        }}
      />
    </div>
  );
};

export default ItemTypes;
