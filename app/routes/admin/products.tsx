import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import MaterialDataTable from "~/components/tables/MaterialDataTable";
import { useTableProps } from "~/hooks/useTableProps";
import { useItems, useItemTypes, useSports } from "~/queries/public";
import { AppButton } from "~/shared/buttons/AppButton";
import { getLoadMoreQueryProps } from "~/components/tables/LoadMoreQueryProps";
import type { PaginatedResponse } from "~/types/item";
import { Link } from "react-router";
import type { IItem } from "../../../server/models/Item";
import { CreateItemDialog } from "~/components/Dialogs/adminModals/createDialog/item/CreateItemDialog";
import { ConfirmDeleteItemDialog } from "~/components/Dialogs/adminModals/createDialog/item/ConfirmDeleteItemDialog";
import {
  TableFilters,
  type FilterType,
} from "~/shared/admin/tableFilter/TableFilters";
import axios from "axios";
import { EditItemDialog } from "~/components/Dialogs/adminModals/createDialog/item/EditItemDialog";

const Products: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogItemId, setDeleteDialogItemId] = useState<
    string | undefined
  >(undefined);
  const [editDialogItem, setEditDialogItem] = useState<IItem | null>(null);

  const [filter, setFilter] = useState<FilterType<IItem>>({ search: "" });

  const itemsQuery = useItems(filter);
  const { data, isLoading, isFetching, error } = itemsQuery;

  useEffect(() => {
    itemsQuery.refetch();
  }, [filter]);

  const sportsQuery = useSports();
  const itemTypesQuery = useItemTypes();

  const tableFilters = useMemo(() => {
    if (sportsQuery.isFetching || !sportsQuery.data) return null;
    if (itemTypesQuery.isFetching || !itemTypesQuery.data) return null;

    const itemTypes = Object.values(itemTypesQuery.data).flat();

    return (
      <TableFilters<IItem>
        filterDescriptions={[
          {
            name: "sportId",
            label: t("admin.items.table.sport_id"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: sportsQuery.data.map(({ _id, name }) => ({ _id, name })),
          },
          {
            name: "type",
            label: t("admin.items.table.type"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: itemTypes.map(({ _id, name, sportId }) => ({
              _id,
              name: `${name} - (${sportId})`,
            })),
          },
          {
            name: "salesMethod",
            label: t("admin.items.table.sales_method"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: [
              {
                _id: "fixed",
                name: t("admin.items.table.sales_method_fixed"),
              },
              {
                _id: "bidding",
                name: t("admin.items.table.sales_method_bidding"),
              },
            ],
          },
          {
            name: "team._id",
            label: t("admin.items.table.team_id"),
            def: "",
            placeholder: "ID команды",
            type: "input",
          },
          {
            name: "player._id",
            label: t("admin.items.table.player_id"),
            def: "",
            placeholder: "ID игрока",
            type: "input",
          },
        ]}
        withSearch={{
          label: t("admin.items.table.search"),
          placeholder: t("admin.items.table.search_placeholder"),
        }}
        applyFilter={setFilter}
      />
    );
  }, [t, sportsQuery, itemTypesQuery]);

  const items = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data, filter]);

  // Базовые настройки таблицы
  const baseTableProps = useTableProps<IItem>({
    manualPagination: false,
  });

  // Создание колонок для Material React Table
  const columns = useMemo<MRT_ColumnDef<IItem>[]>(
    () => [
      {
        accessorKey: "title",
        accessorFn: (row) => row.title,
        header: t("admin.items.table.title"),
        size: 250,
        Cell: ({ row }) => (
          <Link
            to={`/product/${row.original.slug}`}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            {row.original.images.length && (
              <img
                src={row.original.thumbnail || row.original.images[0]}
                alt={row.original.title}
                className="w-6 h-6 rounded-full object-cover player-image"
                loading="lazy"
              />
            )}
            <div>
              <div className="font-medium">{row.original.title}</div>
            </div>
          </Link>
        ),
      },
      {
        accessorKey: "_id",
        header: t("admin.items.table._id"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">{cell.getValue() as string}</div>
        ),
      },
      {
        accessorKey: "sportId",
        header: t("admin.items.table.sport_id"),
        size: 250,
        Cell: ({ cell }) => (
          <div className="font-medium">{cell.getValue() as string}</div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("admin.items.table.created_at"),
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
        header: t("admin.items.table.actions"),
        size: 160,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => setEditDialogItem(row.original)}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50 text-sm font-medium"
            >
              {t("admin.items.actions.edit")}
            </button>
            <button
              onClick={() => setDeleteDialogItemId(row.original._id)}
              className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-medium"
            >
              {t("admin.items.actions.delete")}
            </button>
          </div>
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
    data: items,
    state: {
      isLoading: isLoading,
      showGlobalFilter: true,
    },

    getRowId: (originalRow) => originalRow._id,

    // Переопределяем начальное состояние с пагинацией
    initialState: {
      ...baseTableProps.initialState,
      showGlobalFilter: true,
    },

    ...getLoadMoreQueryProps<IItem, PaginatedResponse<IItem, "items">>(
      itemsQuery
    ),
  });

  if (error) {
    return (
      <div className="space-y-6 pb-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.items.title")}</h1>
            <p className="text-gray-600 mt-2">{t("admin.items.subtitle")}</p>
          </div>
        </div>

        <div className="border border-red-300 bg-red-50 rounded-lg p-4">
          <p className="text-red-800">{t("admin.items.error_loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.items.title")}</h1>
          <p className="text-gray-600 mt-2">{t("admin.items.subtitle")}</p>
        </div>
        <AppButton
          variant="profile"
          onClick={() => setIsCreateDialogOpen(true)}
          className="!w-auto px-6"
        >
          {t("admin.items.create_item")}
        </AppButton>
      </div>

      {tableFilters}

      <div className="rounded-lg border bg-white shadow-sm">
        <MaterialDataTable table={table} />
      </div>

      <CreateItemDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      <ConfirmDeleteItemDialog
        itemId={deleteDialogItemId || ""}
        isOpen={deleteDialogItemId !== undefined}
        onClose={() => {
          setDeleteDialogItemId(undefined);
        }}
      />

      {editDialogItem ? (
        <EditItemDialog
          isOpen={!!editDialogItem}
          item={editDialogItem as IItem}
          onClose={() => setEditDialogItem(null)}
          onSuccess={() => setEditDialogItem(null)}
        />
      ) : null}
    </div>
  );
};

export default Products;
