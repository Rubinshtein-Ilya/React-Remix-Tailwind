import React, {useMemo, useState} from "react";
import { useTranslation } from "react-i18next";
import {
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import MaterialDataTable from "~/components/tables/MaterialDataTable";
import { useTableProps } from "~/hooks/useTableProps";
import { usePlayerPositions } from "~/queries/public";
import { AppButton} from "~/shared/buttons/AppButton";
import type { IItemType } from "../../../server/models/ItemType";
import {SportIdChipSelector} from "~/components/SportIdChipSelector";
import {
  ConfirmDeletePlayerPositionDialog
} from "~/components/Dialogs/adminModals/createDialog/playerPosition/ConfirmDeletePlayerPositionDialog";
import {
  CreatePlayerPositionDialog
} from "~/components/Dialogs/adminModals/createDialog/playerPosition/CreatePlayerPositionDialog";

const PlayerPositions: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogPlayerPositionId, setDeleteDialogPlayerPositionId] = useState<string | undefined>(undefined);

  const [sportId, setSportId] = useState<string | undefined>(undefined);

  const { data: playerPositionsBySportId, isLoading, error } = usePlayerPositions();

  const itemTypes = useMemo(
    () => {
      if (playerPositionsBySportId) {
        return sportId
          ? playerPositionsBySportId[sportId] || []
          : Object.keys(playerPositionsBySportId).reduce((acc: IItemType[], key: string) => [...acc, ...playerPositionsBySportId[key]], []);
      }

      return [];
    },
    [sportId, playerPositionsBySportId]
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
        header: t("admin.player_positions.table._id"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "sportId",
        header: t("admin.player_positions.table.sport_id"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: t("admin.player_positions.table.name"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: t("admin.player_positions.table.description"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("admin.player_positions.table.created_at"),
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
        header: t("admin.player_positions.table.actions"),
        size: 100,
        enableSorting: false,
        Cell: ({ row }) => (
          <button
            onClick={() => setDeleteDialogPlayerPositionId(row.original._id)}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-medium"
          >
            {t("admin.player_positions.actions.delete")}
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
          <h1 className="text-3xl font-bold">{t("admin.player_positions.title")}</h1>
          <p className="text-gray-600 mt-2">{t("admin.player_positions.subtitle")}</p>
        </div>
        <AppButton
          variant="profile"
          onClick={() => setIsCreateDialogOpen(true)}
          className="!w-auto px-6"
        >
          {t("admin.player_positions.create_sport")}
        </AppButton>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 rounded-lg p-4">
          <p className="text-red-800">{t("admin.player_positions.error_loading")}</p>
        </div>
      ) : (
        <>
          <SportIdChipSelector sportId={sportId} setSportId={setSportId} />

          <div className="rounded-lg border bg-white shadow-sm">
            <MaterialDataTable table={table} />
          </div>
        </>
      )}

      <CreatePlayerPositionDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
        }}
      />

      <ConfirmDeletePlayerPositionDialog
        playerPositionId={deleteDialogPlayerPositionId || ""}
        isOpen={deleteDialogPlayerPositionId !== undefined}
        onClose={() => {
          setDeleteDialogPlayerPositionId(undefined);
        }}
      />
    </div>
  );
};

export default PlayerPositions;
