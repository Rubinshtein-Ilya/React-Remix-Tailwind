import {useQuery, useInfiniteQuery, type InfiniteData} from "@tanstack/react-query";
import {
  getItems,
  getEvents,
  getEventItems,
  getSports,
  getTeams,
  getPlayers,
  getItem,
  getEvent,
  getTeam,
  getPlayer,
  getTeamItems,
  getPlayerItems,
  getItemBids,
  getItemTypesBySport,
  getPlayerPositions,
  getTeamPlayers,
  getItemTypes,
  getItemLabels,
  getPartnersWithItems,
  getPartnerItems,
  getPending,
} from "~/api/public";
import type {FilterType} from "~/shared/admin/tableFilter/TableFilters";
import type {IItem} from "../../server/models/Item";
import type {ITeam} from "../../server/models/Team";
import type {IPlayer} from "../../server/models/Player";
import { useDebounce } from "~/hooks/useDebounce";
import type {LikeResponse, PaginatedResponse} from "~/types/item";

// Sports
export const useSports = () =>
  useQuery({
    queryKey: ["sports"],
    queryFn: getSports,
  });

export const useItemTypesBySport = (sportId: string) =>
  useQuery({
    queryKey: ["item-types", "sport", sportId],
    queryFn: () => getItemTypesBySport(sportId),
    enabled: !!sportId,
  });

export const useItemTypes = () =>
  useQuery({
    queryKey: ["item-types-all"],
    queryFn: () => getItemTypes()
  });

export const usePlayerPositions = () =>
  useQuery({
    queryKey: ["player-positions"],
    queryFn: getPlayerPositions,
  });

// Items
export const useItems = (filter: FilterType<IItem> = {}) =>
  useInfiniteQuery({
    queryKey: ["items"],
    queryFn: ({ pageParam }) => getItems(pageParam, filter),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

// Partner Items
export const usePartnerItems = (
  partnerId: string,
  initial?: PaginatedResponse<LikeResponse<IItem>, "items">,
) =>
  useInfiniteQuery({
    queryKey: ["partner-items", partnerId],
    queryFn: ({ pageParam }) => getPartnerItems(partnerId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,

    // inject the first page
    initialData: initial ? (
      {
        pages: [initial],
        pageParams: [undefined],
      } as InfiniteData<PaginatedResponse<LikeResponse<IItem>, "items">>
    ) : undefined,
  });

// Partners with nested Items
export const usePartnersWithItems = () =>
  useInfiniteQuery({
    queryKey: ["partner-items"],
    queryFn: ({ pageParam }) => getPartnersWithItems(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

// Поиск товаров
export const useSearchItems = (searchQuery: string, enabled: boolean = true) => {
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  return useQuery({
    queryKey: ["items", "search", debouncedSearch],
    queryFn: () => getItems(undefined, { search: debouncedSearch }),
    enabled: enabled && debouncedSearch.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useItem = (itemId: string,refetchInterval?: number) =>
  useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getItem(itemId),
    enabled: !!itemId,
    refetchInterval,
  });

export const useItemBids = (itemId: string) =>
  useInfiniteQuery({
    queryKey: ["item-bids", itemId],
    queryFn: ({ pageParam }) => getItemBids(itemId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!itemId,
  });

// Events
export const useEvents = () =>
  useInfiniteQuery({
    queryKey: ["events"],
    queryFn: ({ pageParam }) => getEvents(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

export const useEvent = (eventId: string) =>
  useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEvent(eventId),
    enabled: !!eventId,
  });

export const useEventItems = (eventId: string) =>
  useInfiniteQuery({
    queryKey: ["event-items", eventId],
    queryFn: ({ pageParam }) => getEventItems(eventId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!eventId,
  });

export const usePending = () =>
  useQuery({
    queryKey: ["pending"],
    queryFn: () => getPending(),
    staleTime: 1000 * 60 * 5,
  });

// Teams
export const useTeams = (filter: FilterType<ITeam> = {}) =>
  useInfiniteQuery({
    queryKey: ["teams"],
    queryFn: ({ pageParam }) => getTeams({
      cursor: pageParam,
      filter
    }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

export const useTeam = (teamId: string) =>
  useQuery({
    queryKey: ["team", teamId],
    queryFn: () => getTeam(teamId),
    enabled: !!teamId,
  });

export const useTeamPlayers = (teamId: string) =>
  useQuery({
    queryKey: ["team-players", teamId],
    queryFn: () => getTeamPlayers(teamId),
    enabled: !!teamId,
  });

export const useTeamItems = (teamId: string) =>
  useInfiniteQuery({
    queryKey: ["team-items", teamId],
    queryFn: ({ pageParam }) => getTeamItems(teamId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!teamId,
  });

// Players
export const usePlayers = (filter: FilterType<IPlayer> = {}) =>
  useInfiniteQuery({
    queryKey: ["players"],
    queryFn: ({ pageParam }) => getPlayers({
      cursor: pageParam,
      filter
    }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

export const usePlayer = (playerId: string) =>
  useQuery({
    queryKey: ["player", playerId],
    queryFn: () => getPlayer(playerId),
    enabled: !!playerId,
  });

export const usePlayerItems = (playerId: string) =>
  useInfiniteQuery({
    queryKey: ["player-items", playerId],
    queryFn: ({ pageParam }) => getPlayerItems(playerId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!playerId,
  });

export const useItemLabels = () =>
  useQuery({
    queryKey: ["item-labels"],
    queryFn: getItemLabels,
    staleTime: 1000 * 60 * 5,
  });
