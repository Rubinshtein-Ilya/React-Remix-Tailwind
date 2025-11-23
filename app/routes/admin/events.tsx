import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import MaterialDataTable from "~/components/tables/MaterialDataTable";
import { useTableProps } from "~/hooks/useTableProps";
import { useSports } from "~/queries/public";
import { AppButton } from "~/shared/buttons/AppButton";
import type { IEvent } from "../../../server/models/Event";
import { getLoadMoreQueryProps } from "~/components/tables/LoadMoreQueryProps";
import type { PaginatedResponse } from "~/types/item";
import { Link } from "react-router";
import { ConfirmDeleteEventDialog } from "~/components/Dialogs/adminModals/createDialog/event/ConfirmDeleteEventDialog";
import { CreateEventDialog } from "~/components/Dialogs/adminModals/createDialog/event/CreateEventDialog";
import {
  type FilterType,
  TableFilters,
} from "~/shared/admin/tableFilter/TableFilters";

import { ConfirmDialog } from "~/components/Dialogs/adminModals/ConfirmDialog";
import {
  useMarkAsPartner,
  useUnmarkAsPartner,
  useAdminEvents,
} from "~/queries/admin";

const EventsAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogEventId, setDeleteDialogEventId] = useState<
    string | undefined
  >(undefined);
  const [partnerDialogEventId, setPartnerDialogEventId] = useState<
    string | undefined
  >(undefined);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);

  const [filter, setFilter] = useState<FilterType<IEvent>>({ search: "" });

  const eventsQuery = useAdminEvents(filter);
  const { data, isLoading, isFetching, error } = eventsQuery;

  const markAsPartner = useMarkAsPartner();
  const unmarkAsPartner = useUnmarkAsPartner();

  useEffect(() => {
    eventsQuery.refetch();
  }, [filter]);

  const sportsQuery = useSports();

  const tableFilters = useMemo(() => {
    if (sportsQuery.isFetching || !sportsQuery.data) return null;

    return (
      <TableFilters<IEvent>
        filterDescriptions={[
          {
            name: "sportId",
            label: t("admin.events.table.sport_id"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: sportsQuery.data.map(({ _id, name }) => ({ _id, name })),
          },
          {
            name: "isPartner",
            label: t("admin.events.table.partner"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: [
              { _id: "true", name: t("common.yes") },
              { _id: "false", name: t("common.no") },
            ],
          },

        ]}
        withSearch={{
          label: t("admin.events.table.search"),
          placeholder: t("admin.events.table.search_placeholder"),
        }}
        applyFilter={setFilter}
      />
    );
  }, [t, sportsQuery]);

  const events = useMemo(() => {
    return (data?.pages.flatMap((page) => page.events) || []).filter(
      (event) => event
    );
  }, [data, data?.pages]);

  console.log(events);

  // Статистика событий
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const upcomingEvents = events.filter(
      (event) => new Date(event?.startDate || "") > new Date()
    ).length;
    const pastEvents = events.filter(
      (event) => new Date(event?.endDate || "") < new Date()
    ).length;
    const partnerEvents = events.filter((event) => event?.isPartner).length;
    const eventsThisMonth = events.filter((event) => {
      const eventDate = new Date(event?.startDate || "");
      const now = new Date();
      return (
        eventDate.getMonth() === now.getMonth() &&
        eventDate.getFullYear() === now.getFullYear()
      );
    }).length;
    return {
      totalEvents,
      upcomingEvents,
      pastEvents,
      partnerEvents,
      eventsThisMonth,
    };
  }, [events]);

  // Базовые настройки таблицы
  const baseTableProps = useTableProps<IEvent>({
    manualPagination: false,
  });

  // Создание колонок для Material React Table
  const columns = useMemo<MRT_ColumnDef<IEvent>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("admin.events.table.name"),
        size: 250,
        Cell: ({ row }) => (
          <Link
            to={`/events/${row.original.slug}`}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            {row.original.images[0] && (
              <img
                src={row.original.images[0]}
                alt={row.original.name}
                className="w-6 h-6 rounded-full object-cover event-image"
                loading="lazy"
              />
            )}
            <div>
              <div className="font-medium">{row.original.name}</div>
            </div>
          </Link>
        ),
      },
      {
        accessorKey: "isPartner",
        header: t("admin.events.table.partner"),
        size: 100,
        Cell: ({ row }) => (
          <div className="font-medium">
            {row.original.isPartner ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Да
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Нет
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "_id",
        header: t("admin.events.table._id"),
        size: 200,
        Cell: ({ cell }) => (
          <div className="font-mono text-xs text-gray-600">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "slug",
        header: "Slug",
        size: 150,
        Cell: ({ cell }) => (
          <div className="font-mono text-xs text-gray-600">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "sportId",
        header: t("admin.events.table.sport_id"),
        size: 120,
        Cell: ({ cell }) => (
          <div className="font-medium">{cell.getValue() as string}</div>
        ),
      },
      {
        accessorKey: "description",
        header: t("admin.events.table.description"),
        size: 200,
        Cell: ({ cell }) => (
          <div className="font-medium text-gray-600 truncate">
            {(cell.getValue() as string) || "-"}
          </div>
        ),
      },
      {
        accessorKey: "startDate",
        header: t("admin.events.table.start_date"),
        size: 120,
        Cell: ({ row }) => {
          const date = new Date(row.original.startDate);
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
        accessorKey: "endDate",
        header: t("admin.events.table.end_date"),
        size: 120,
        Cell: ({ row }) => {
          const date = new Date(row.original.endDate);
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
        accessorKey: "createdAt",
        header: t("admin.events.table.created_at"),
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
        header: t("admin.events.table.actions"),
        size: 200,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex gap-2">
            {row.original.isPartner ? (
              <button
                onClick={() => {
                  setPartnerDialogEventId(row.original._id);
                  setIsPartnerDialogOpen(true);
                }}
                className="text-orange-600 hover:text-orange-800 disabled:opacity-50 text-sm font-medium"
              >
                {t("admin.events.actions.remove_partner")}
              </button>
            ) : (
              <button
                onClick={() => {
                  setPartnerDialogEventId(row.original._id);
                  setIsPartnerDialogOpen(true);
                }}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50 text-sm font-medium"
              >
                {t("admin.events.actions.make_partner")}
              </button>
            )}
            <button
              onClick={() => setDeleteDialogEventId(row.original._id)}
              className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-medium"
            >
              {t("admin.events.actions.delete")}
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
    data: events,
    state: {
      isLoading: isLoading,
      showGlobalFilter: true,
    },

    getRowId: (originalRow) => originalRow?._id || "",

    // Переопределяем начальное состояние с пагинацией
    initialState: {
      ...baseTableProps.initialState,
      showGlobalFilter: true,
    },

    ...getLoadMoreQueryProps<IEvent, PaginatedResponse<IEvent, "events">>(
      eventsQuery
    ),
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.events.title")}</h1>
          <p className="text-gray-600 mt-2">{t("admin.events.subtitle")}</p>

          {/* Статистика */}
          <div className="flex gap-6 mt-4">
            <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-300">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalEvents}
              </div>
              <div className="text-sm text-blue-800">
                {t("admin.events.stats.total_events")}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border-2 border-green-300">
              <div className="text-2xl font-bold text-green-600">
                {stats.upcomingEvents}
              </div>
              <div className="text-sm text-green-800">
                {t("admin.events.stats.upcoming_events")}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border-2 border-purple-300">
              <div className="text-2xl font-bold text-purple-600">
                {stats.pastEvents}
              </div>
              <div className="text-sm text-purple-800">
                {t("admin.events.stats.past_events")}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border-2 border-orange-300">
              <div className="text-2xl font-bold text-orange-600">
                {stats.partnerEvents}
              </div>
              <div className="text-sm text-orange-800">
                {t("admin.events.stats.partner_events")}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border-2 border-red-300">
              <div className="text-2xl font-bold text-red-600">
                {stats.eventsThisMonth}
              </div>
              <div className="text-sm text-red-800">
                {t("admin.events.stats.events_this_month")}
              </div>
            </div>

          </div>
        </div>
        <AppButton
          variant="profile"
          onClick={() => setIsCreateDialogOpen(true)}
          className="!w-auto px-6"
        >
          {t("admin.events.create_event")}
        </AppButton>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 rounded-lg p-4">
          <p className="text-red-800">{t("admin.events.error_loading")}</p>
        </div>
      ) : (
        <>
          {tableFilters}

          <div className="rounded-lg border bg-white shadow-sm">
            <MaterialDataTable table={table} />
          </div>
        </>
      )}

      <CreateEventDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      <ConfirmDeleteEventDialog
        eventId={deleteDialogEventId || ""}
        isOpen={deleteDialogEventId !== undefined}
        onClose={() => {
          setDeleteDialogEventId(undefined);
        }}
      />

      <ConfirmDialog
        isOpen={isPartnerDialogOpen}
        onClose={() => {
          setIsPartnerDialogOpen(false);
          setPartnerDialogEventId(undefined);
        }}
        titleTranslationKey={
          partnerDialogEventId &&
          events.find((e) => e._id === partnerDialogEventId)?.isPartner
            ? "admin.events.partner_dialog.remove_title"
            : "admin.events.partner_dialog.title"
        }
        supportTextTranslationKey={
          partnerDialogEventId &&
          events.find((e) => e._id === partnerDialogEventId)?.isPartner
            ? "admin.events.partner_dialog.remove_text"
            : "admin.events.partner_dialog.text"
        }
        yesButtonTranslationKey={
          partnerDialogEventId &&
          events.find((e) => e._id === partnerDialogEventId)?.isPartner
            ? "admin.events.partner_dialog.remove_confirm"
            : "admin.events.partner_dialog.confirm"
        }
        yesButtonPendingTranslationKey="admin.events.partner_dialog.confirming"
        isConfirming={markAsPartner.isPending || unmarkAsPartner.isPending}
        onConfirm={() => {
          if (partnerDialogEventId) {
            const event = events.find((e) => e._id === partnerDialogEventId);
            if (event?.isPartner) {
              unmarkAsPartner.mutate(
                { sourceId: partnerDialogEventId, type: "event" },
                {
                  onSuccess: () => {
                    setIsPartnerDialogOpen(false);
                    setPartnerDialogEventId(undefined);
                  },
                }
              );
            } else {
              markAsPartner.mutate(
                { sourceId: partnerDialogEventId, type: "event" },
                {
                  onSuccess: () => {
                    setIsPartnerDialogOpen(false);
                    setPartnerDialogEventId(undefined);
                  },
                }
              );
            }
          }
        }}
      />
    </div>
  );
};

export default EventsAdminPage;
