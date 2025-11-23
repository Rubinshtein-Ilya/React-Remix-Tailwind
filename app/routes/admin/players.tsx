import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import MaterialDataTable from "~/components/tables/MaterialDataTable";
import { useTableProps } from "~/hooks/useTableProps";
import { usePlayerPositions, usePlayers, useSports } from "~/queries/public";
import { AppButton } from "~/shared/buttons/AppButton";
import type { IPlayer } from "../../../server/models/Player";
import { getLoadMoreQueryProps } from "~/components/tables/LoadMoreQueryProps";
import type { PaginatedResponse } from "~/types/item";
import { Link } from "react-router";
import { ConfirmDeletePlayerDialog } from "~/components/Dialogs/adminModals/createDialog/player/ConfirmDeletePlayerDialog";
import { CreatePlayerDialog } from "~/components/Dialogs/adminModals/createDialog/player/CreatePlayerDialog";
import {
  type FilterType,
  TableFilters,
} from "~/shared/admin/tableFilter/TableFilters";
import { CountryCodes } from "~/utils/countryUtils";
import { ConfirmDialog } from "~/components/Dialogs/adminModals/ConfirmDialog";
import { useMarkAsPartner, useUnmarkAsPartner } from "~/queries/admin";

const PlayersAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogPlayerId, setDeleteDialogPlayerId] = useState<
    string | undefined
  >(undefined);
  const [partnerDialogPlayerId, setPartnerDialogPlayerId] = useState<
    string | undefined
  >(undefined);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);

  const [filter, setFilter] = useState<FilterType<IPlayer>>({ search: "" });

  const playersQuery = usePlayers(filter);
  const { data, isLoading, isFetching, error } = playersQuery;

  const markAsPartner = useMarkAsPartner();
  const unmarkAsPartner = useUnmarkAsPartner();

  useEffect(() => {
    playersQuery.refetch();
  }, [filter]);

  const sportsQuery = useSports();
  const playerPositionsQuery = usePlayerPositions();

  const tableFilters = useMemo(() => {
    if (sportsQuery.isFetching || !sportsQuery.data) return null;
    if (playerPositionsQuery.isFetching || !playerPositionsQuery.data)
      return null;

    const playerPositions = Object.values(playerPositionsQuery.data).flat();

    return (
      <TableFilters<IPlayer>
        filterDescriptions={[
          {
            name: "sportId",
            label: t("admin.players.table.sport_id"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: sportsQuery.data.map(({ _id, name }) => ({ _id, name })),
          },
          {
            name: "isPartner",
            label: t("admin.players.table.partner"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: [
              { _id: "true", name: t("common.yes") },
              { _id: "false", name: t("common.no") },
            ],
          },
          {
            name: "team._id",
            label: t("admin.players.table.team_id"),
            def: "",
            placeholder: "0etrfmixjyv3",
            type: "input",
          },
          {
            name: "position",
            label: t("admin.players.table.position"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: playerPositions.map(({ _id, name, sportId }) => ({
              _id,
              name: `${name} (${sportId})`,
            })),
          },
          {
            name: "gender",
            label: t("admin.players.table.gender"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: [
              {
                _id: "male",
                name: t("admin.players.create_dialog.fields.gender_male"),
              },
              {
                _id: "female",
                name: t("admin.players.create_dialog.fields.gender_female"),
              },
            ],
          },
          {
            name: "birthPlaceCountry",
            label: t("admin.players.table.country"),
            def: "",
            type: "select",
            allLabel: t("common.all"),
            options: CountryCodes.map((countryCode) => ({
              _id: countryCode,
              name: t(`country.${countryCode}`),
            })),
          },
          {
            name: "birthPlaceCity",
            label: t("admin.players.table.city"),
            def: "",
            placeholder: "Санкт-Петербург",
            type: "input",
          },
          {
            name: "number",
            label: t("admin.players.table.number"),
            def: "",
            placeholder: "10",
            type: "input",
          },
        ]}
        withSearch={{
          label: t("admin.players.table.search"),
          placeholder: t("admin.players.table.search_placeholder"),
        }}
        applyFilter={setFilter}
      />
    );
  }, [t, sportsQuery]);

  const players = useMemo(() => {
    return data?.pages.flatMap((page) => page.players) || [];
  }, [data, data?.pages]);

  // Статистика игроков
  const stats = useMemo(() => {
    const totalPlayers = players.length;
    const malePlayers = players.filter(
      (player) => player.gender === "male"
    ).length;
    const femalePlayers = players.filter(
      (player) => player.gender === "female"
    ).length;
    const playersWithTeam = players.filter((player) => player.team).length;
    const playersWithNumber = players.filter(
      (player) => player.number && player.number.trim()
    ).length;
    const partners = players.filter((player) => player.isPartner).length;

    return {
      totalPlayers,
      malePlayers,
      femalePlayers,
      playersWithTeam,
      playersWithNumber,
      partners,
      averageAge:
        totalPlayers > 0
          ? Math.round(
              players.reduce((sum, player) => {
                const age =
                  new Date().getFullYear() -
                  new Date(player.birthDate).getFullYear();
                return sum + age;
              }, 0) / totalPlayers
            )
          : 0,
    };
  }, [players]);

  // Базовые настройки таблицы
  const baseTableProps = useTableProps<IPlayer>({
    manualPagination: false,
  });

  // Создание колонок для Material React Table
  const columns = useMemo<MRT_ColumnDef<IPlayer>[]>(
    () => [
      {
        accessorKey: "name",
        accessorFn: (row) =>
          `${row.name}${row.middleName ? ` ${row.middleName}` : ""} ${
            row.lastName
          }`,
        header: t("admin.players.table.name"),
        size: 250,
        Cell: ({ row }) => (
          <Link
            to={`/players/${row.original.slug}`}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            {(row.original.thumbnail || row.original.images[0]) && (
              <img
                src={row.original.thumbnail || row.original.images[0]}
                alt={row.original.name}
                className="w-6 h-6 rounded-full object-cover player-image"
                loading="lazy"
              />
            )}
            <div>
              <div className="font-medium">{`${row.original.name}${
                row.original.middleName ? ` ${row.original.middleName}` : ""
              } ${row.original.lastName}`}</div>
            </div>
          </Link>
        ),
      },
      {
        accessorKey: "isPartner",
        header: t("admin.players.table.partner"),
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
        header: t("admin.players.table._id"),
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
        header: t("admin.players.table.sport_id"),
        size: 120,
        Cell: ({ cell }) => (
          <div className="font-medium">{cell.getValue() as string}</div>
        ),
      },
      {
        accessorKey: "team",
        accessorFn: (row) => row.team?.name || "-",
        header: t("admin.players.table.team"),
        size: 200,
        Cell: ({ row }) =>
          row.original.team ? (
            <Link
              to={`/teams/${row.original.team.slug}`}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              {row.original.team.image && (
                <img
                  src={row.original.team.image}
                  alt={row.original.team.name}
                  className="w-6 h-6 rounded-full object-cover player-image"
                  loading="lazy"
                />
              )}
              <div>
                <div className="font-medium">{row.original.team.name}</div>
              </div>
            </Link>
          ) : (
            <div className="font-medium text-gray-400">-</div>
          ),
      },
      {
        accessorKey: "position",
        header: t("admin.players.table.position"),
        size: 120,
        Cell: ({ cell }) => (
          <div className="font-medium">{cell.getValue() as string}</div>
        ),
      },
      {
        accessorKey: "number",
        header: t("admin.players.table.number"),
        size: 80,
        Cell: ({ cell }) => (
          <div className="font-medium text-center">
            {(cell.getValue() as string) || "-"}
          </div>
        ),
      },
      {
        accessorKey: "gender",
        header: t("admin.players.table.gender"),
        size: 100,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {cell.getValue() === "male"
              ? t("admin.players.create_dialog.fields.gender_male")
              : t("admin.players.create_dialog.fields.gender_female")}
          </div>
        ),
      },
      {
        accessorKey: "birthPlaceCountry",
        header: t("admin.players.table.country"),
        size: 120,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {t(`country.${cell.getValue() as string}`)}
          </div>
        ),
      },
      {
        accessorKey: "birthPlaceCity",
        header: t("admin.players.table.city"),
        size: 120,
        Cell: ({ cell }) => (
          <div className="font-medium">
            {(cell.getValue() as string) || "-"}
          </div>
        ),
      },
      {
        accessorKey: "birthDate",
        header: t("admin.players.table.birth_date"),
        size: 120,
        Cell: ({ row }) => {
          const date = new Date(row.original.birthDate);
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
        header: t("admin.players.table.created_at"),
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
        header: t("admin.players.table.actions"),
        size: 200,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex gap-2">
            {row.original.isPartner ? (
              <button
                onClick={() => {
                  setPartnerDialogPlayerId(row.original._id);
                  setIsPartnerDialogOpen(true);
                }}
                className="text-orange-600 hover:text-orange-800 disabled:opacity-50 text-sm font-medium"
              >
                {t("admin.players.actions.remove_partner")}
              </button>
            ) : (
              <button
                onClick={() => {
                  setPartnerDialogPlayerId(row.original._id);
                  setIsPartnerDialogOpen(true);
                }}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50 text-sm font-medium"
              >
                {t("admin.players.actions.make_partner")}
              </button>
            )}
            <button
              onClick={() => setDeleteDialogPlayerId(row.original._id)}
              className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-medium"
            >
              {t("admin.players.actions.delete")}
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
      showGlobalFilter: true,
    },

    ...getLoadMoreQueryProps<IPlayer, PaginatedResponse<IPlayer, "players">>(
      playersQuery
    ),
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.players.title")}</h1>
          <p className="text-gray-600 mt-2">{t("admin.players.subtitle")}</p>

          {/* Статистика */}
          <div className="flex gap-6 mt-4">
            <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-300">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalPlayers}
              </div>
              <div className="text-sm text-blue-800">
                {t("admin.players.stats.total_players")}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border-2 border-green-300">
              <div className="text-2xl font-bold text-green-600">
                {stats.malePlayers}
              </div>
              <div className="text-sm text-green-800">
                {t("admin.players.stats.male_players")}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border-2 border-purple-300">
              <div className="text-2xl font-bold text-purple-600">
                {stats.femalePlayers}
              </div>
              <div className="text-sm text-purple-800">
                {t("admin.players.stats.female_players")}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border-2 border-orange-300">
              <div className="text-2xl font-bold text-orange-600">
                {stats.playersWithTeam}
              </div>
              <div className="text-sm text-orange-800">
                {t("admin.players.stats.players_with_team")}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border-2 border-red-300">
              <div className="text-2xl font-bold text-red-600">
                {stats.averageAge}
              </div>
              <div className="text-sm text-red-800">
                {t("admin.players.stats.average_age")}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-300">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.partners}
              </div>
              <div className="text-sm text-yellow-800">
                {t("admin.players.stats.partners")}
              </div>
            </div>
          </div>
        </div>
        <AppButton
          variant="profile"
          onClick={() => setIsCreateDialogOpen(true)}
          className="!w-auto px-6"
        >
          {t("admin.players.create_player")}
        </AppButton>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 rounded-lg p-4">
          <p className="text-red-800">{t("admin.players.error_loading")}</p>
        </div>
      ) : (
        <>
          {tableFilters}

          <div className="rounded-lg border bg-white shadow-sm">
            <MaterialDataTable table={table} />
          </div>
        </>
      )}

      <CreatePlayerDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      <ConfirmDeletePlayerDialog
        playerId={deleteDialogPlayerId || ""}
        isOpen={deleteDialogPlayerId !== undefined}
        onClose={() => {
          setDeleteDialogPlayerId(undefined);
        }}
      />

      <ConfirmDialog
        isOpen={isPartnerDialogOpen}
        onClose={() => {
          setIsPartnerDialogOpen(false);
          setPartnerDialogPlayerId(undefined);
        }}
        titleTranslationKey={
          partnerDialogPlayerId &&
          players.find((p) => p._id === partnerDialogPlayerId)?.isPartner
            ? "admin.players.partner_dialog.remove_title"
            : "admin.players.partner_dialog.title"
        }
        supportTextTranslationKey={
          partnerDialogPlayerId &&
          players.find((p) => p._id === partnerDialogPlayerId)?.isPartner
            ? "admin.players.partner_dialog.remove_text"
            : "admin.players.partner_dialog.text"
        }
        yesButtonTranslationKey={
          partnerDialogPlayerId &&
          players.find((p) => p._id === partnerDialogPlayerId)?.isPartner
            ? "admin.players.partner_dialog.remove_confirm"
            : "admin.players.partner_dialog.confirm"
        }
        yesButtonPendingTranslationKey="admin.players.partner_dialog.confirming"
        isConfirming={markAsPartner.isPending || unmarkAsPartner.isPending}
        onConfirm={() => {
          if (partnerDialogPlayerId) {
            const player = players.find((p) => p._id === partnerDialogPlayerId);
            if (player?.isPartner) {
              unmarkAsPartner.mutate(
                { sourceId: partnerDialogPlayerId, type: "player" },
                {
                  onSuccess: () => {
                    setIsPartnerDialogOpen(false);
                    setPartnerDialogPlayerId(undefined);
                  },
                }
              );
            } else {
              markAsPartner.mutate(
                { sourceId: partnerDialogPlayerId, type: "player" },
                {
                  onSuccess: () => {
                    setIsPartnerDialogOpen(false);
                    setPartnerDialogPlayerId(undefined);
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

export default PlayersAdminPage;
