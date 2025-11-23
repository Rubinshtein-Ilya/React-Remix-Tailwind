import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import MaterialDataTable from "~/components/tables/MaterialDataTable";
import { useTableProps } from "~/hooks/useTableProps";
import {usePlayerPositions, useSports, useTeams} from "~/queries/public";
import { AppButton } from "~/shared/buttons/AppButton";
import { SportIdChipSelector } from "~/components/SportIdChipSelector";
import type { ITeam } from "../../../server/models/Team";
import { getLoadMoreQueryProps } from "~/components/tables/LoadMoreQueryProps";
import type { PaginatedResponse } from "~/types/item";
import { Link } from "react-router";
import { ConfirmDeleteTeamDialog } from "~/components/Dialogs/adminModals/createDialog/team/ConfirmDeleteTeamDialog";
import {CreateTeamDialog} from "~/components/Dialogs/adminModals/createDialog/team/CreateTeamDialog";
import {type FilterType, TableFilters} from "~/shared/admin/tableFilter/TableFilters";
import type {IItem} from "../../../server/models/Item";
import {CountryCodes} from "~/utils/countryUtils";
import { ConfirmDialog } from "~/components/Dialogs/adminModals/ConfirmDialog";
import { useMarkAsPartner, useUnmarkAsPartner } from "~/queries/admin";

const Teams: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogTeamId, setDeleteDialogTeamId] = useState<string | undefined>(undefined);
  const [partnerDialogTeamId, setPartnerDialogTeamId] = useState<string | undefined>(undefined);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);

  const [filter, setFilter] = useState<FilterType<ITeam>>({ search: "" });

  const teamsQuery = useTeams(filter);
  const { data, isLoading, error } = teamsQuery;

  const markAsPartner = useMarkAsPartner();
  const unmarkAsPartner = useUnmarkAsPartner();

  useEffect(() => {
    teamsQuery.refetch();
  }, [filter]);

  const sportsQuery = useSports();

  const tableFilters = useMemo(() => {
    if (sportsQuery.isFetching || !sportsQuery.data) return null;

    return (
      <TableFilters<ITeam>
        filterDescriptions={[
          {
            name: "sportId",
            label: t("admin.teams.table.sport_id"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: sportsQuery.data.map(({ _id, name }) => ({ _id, name })),
          },
          {
            name: "isPartner",
            label: t("admin.teams.table.partner"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: [
              { _id: "true", name: t("common.yes") },
              { _id: "false", name: t("common.no") }
            ],
          },
          {
            name: "country",
            label: t("admin.teams.table.country"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: CountryCodes.map(countryCode => ({ _id: countryCode, name: t(`country.${countryCode}`) })),
          },
          {
            name: "city",
            label: t("admin.teams.table.city"),
            def: "",
            placeholder: "Санкт-Петербург",
            type: "input"
          }
        ]}
        withSearch={{
          label: t("admin.teams.table.search"),
          placeholder: t("admin.teams.table.search_placeholder")
        }}
        applyFilter={setFilter}
      />
    )
  }, [t, sportsQuery]);

  const players = useMemo(() => {
    return data?.pages.flatMap((page) => page.teams) || [];
  }, [data, filter]);

  // Статистика команд
  const stats = useMemo(() => {
    const totalTeams = players.length;
    const totalPlayers = players.reduce((sum, team) => sum + team.players.length, 0);
    const partners = players.filter(team => team.isPartner).length;

    return {
      totalTeams,
      totalPlayers,
      partners,
      averagePlayersPerTeam: totalTeams > 0 ? Math.round(totalPlayers / totalTeams) : 0
    };
  }, [players]);

  // Базовые настройки таблицы
  const baseTableProps = useTableProps<ITeam>({
    manualPagination: false
  });

  // Создание колонок для Material React Table
  const columns = useMemo<MRT_ColumnDef<ITeam>[]>(
    () => [
      {
        accessorKey: "name",
        accessorFn: (row) => row.name,
        header: t("admin.teams.table.name"),
        size: 250,
        Cell: ({ row }) => (
          <Link
            to={`/teams/${row.original.slug}`}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            {row.original.images.length && (
              <img
                src={row.original.images[0]}
                alt={row.original.name}
                className="w-6 h-6 rounded-full object-cover player-image"
                loading="lazy"
              />
            )}
            <div>
              <div className="font-medium">
                {row.original.name}
              </div>
            </div>
          </Link>
        ),
      },
      {
        accessorKey: "isPartner",
        header: t("admin.teams.table.partner"),
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
        header: t("admin.teams.table._id"),
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
        header: t("admin.teams.table.sport_id"),
        size: 120,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "country",
        header: t("admin.teams.table.country"),
        size: 120,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {t(`country.${cell.getValue() as string}`)}
          </div>
        ),
      },
      {
        accessorKey: "city",
        header: t("admin.teams.table.city"),
        size: 120,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "stadium",
        header: t("admin.teams.table.stadium"),
        size: 150,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() as string || "-"}
          </div>
        ),
      },
      {
        accessorKey: "players",
        header: t("admin.teams.table.players"),
        size: 100,
        Cell: ({ row }) => (
          <div className="font-medium text-center">
            {row.original.players.length}
          </div>
        ),
      },
      {
        accessorKey: "establishedAt",
        header: t("admin.teams.table.established_at"),
        size: 120,
        Cell: ({ row }) => {
          const date = new Date(row.original.establishedAt);
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
        header: t("admin.teams.table.created_at"),
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
        header: t("admin.teams.table.actions"),
        size: 200,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex gap-2">
            {row.original.isPartner ? (
              <button
                onClick={() => {
                  setPartnerDialogTeamId(row.original._id);
                  setIsPartnerDialogOpen(true);
                }}
                className="text-orange-600 hover:text-orange-800 disabled:opacity-50 text-sm font-medium"
              >
                {t("admin.teams.actions.remove_partner")}
              </button>
            ) : (
              <button
                onClick={() => {
                  setPartnerDialogTeamId(row.original._id);
                  setIsPartnerDialogOpen(true);
                }}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50 text-sm font-medium"
              >
                {t("admin.teams.actions.make_partner")}
              </button>
            )}
            <button
              onClick={() => setDeleteDialogTeamId(row.original._id)}
              className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-medium"
            >
              {t("admin.teams.actions.delete")}
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
    data: players,
    state: {
      isLoading: isLoading,
      showGlobalFilter: true,
    },

    getRowId: (originalRow) => originalRow._id,

    // Переопределяем начальное состояние с пагинацией
    initialState: {
      ...baseTableProps.initialState,
      showGlobalFilter: true
    },

    ...getLoadMoreQueryProps<ITeam, PaginatedResponse<ITeam, "teams">>(
      teamsQuery
    ),
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.teams.title")}</h1>
          <p className="text-gray-600 mt-2">{t("admin.teams.subtitle")}</p>

          {/* Статистика */}
          <div className="flex gap-6 mt-4">
            <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-300">
              <div className="text-2xl font-bold text-blue-600">{stats.totalTeams}</div>
              <div className="text-sm text-blue-800">{t("admin.teams.stats.total_teams")}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border-2 border-green-300">
              <div className="text-2xl font-bold text-green-600">{stats.totalPlayers}</div>
              <div className="text-sm text-green-800">{t("admin.teams.stats.total_players")}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border-2 border-purple-300">
              <div className="text-2xl font-bold text-purple-600">{stats.averagePlayersPerTeam}</div>
              <div className="text-sm text-purple-800">{t("admin.teams.stats.average_players_per_team")}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-300">
              <div className="text-2xl font-bold text-yellow-600">{stats.partners}</div>
              <div className="text-sm text-yellow-800">{t("admin.teams.stats.partners")}</div>
            </div>
          </div>
        </div>
        <AppButton
          variant="profile"
          onClick={() => setIsCreateDialogOpen(true)}
          className="!w-auto px-6"
        >
          {t("admin.teams.create_team")}
        </AppButton>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 rounded-lg p-4">
          <p className="text-red-800">{t("admin.teams.error_loading")}</p>
        </div>
      ) : (
        <>
          {tableFilters}

          <div className="rounded-lg border bg-white shadow-sm">
            <MaterialDataTable table={table} />
          </div>
        </>
      )}

      <CreateTeamDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      <ConfirmDeleteTeamDialog
        teamId={deleteDialogTeamId || ""}
        isOpen={deleteDialogTeamId !== undefined}
        onClose={() => {
          setDeleteDialogTeamId(undefined);
        }}
      />

      <ConfirmDialog
        isOpen={isPartnerDialogOpen}
        onClose={() => {
          setIsPartnerDialogOpen(false);
          setPartnerDialogTeamId(undefined);
        }}
        titleTranslationKey={partnerDialogTeamId && players.find(t => t._id === partnerDialogTeamId)?.isPartner 
          ? "admin.teams.partner_dialog.remove_title" 
          : "admin.teams.partner_dialog.title"}
        supportTextTranslationKey={partnerDialogTeamId && players.find(t => t._id === partnerDialogTeamId)?.isPartner 
          ? "admin.teams.partner_dialog.remove_text" 
          : "admin.teams.partner_dialog.text"}
        yesButtonTranslationKey={partnerDialogTeamId && players.find(t => t._id === partnerDialogTeamId)?.isPartner 
          ? "admin.teams.partner_dialog.remove_confirm" 
          : "admin.teams.partner_dialog.confirm"}
        yesButtonPendingTranslationKey="admin.teams.partner_dialog.confirming"
        isConfirming={markAsPartner.isPending || unmarkAsPartner.isPending}
        onConfirm={() => {
          if (partnerDialogTeamId) {
            const team = players.find(t => t._id === partnerDialogTeamId);
            if (team?.isPartner) {
              unmarkAsPartner.mutate({ sourceId: partnerDialogTeamId, type: "team" }, {
                onSuccess: () => {
                  setIsPartnerDialogOpen(false);
                  setPartnerDialogTeamId(undefined);
                }
              });
            } else {
              markAsPartner.mutate({ sourceId: partnerDialogTeamId, type: "team" }, {
                onSuccess: () => {
                  setIsPartnerDialogOpen(false);
                  setPartnerDialogTeamId(undefined);
                }
              });
            }
          }
        }}
      />
    </div>
  );
};

export default Teams;
