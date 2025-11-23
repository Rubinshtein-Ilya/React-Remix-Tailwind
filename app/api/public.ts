import type { IPlayer } from "server/models/Player";
import type { ISport } from "server/models/Sport";
import type { ITeam } from "server/models/Team";
import type { IItemType } from "server/models/ItemType";
import type { IPlayerPosition } from "server/models/PlayerPosition";
import type { IItem } from "server/models/Item";
import type { IEvent } from "server/models/Event";
import type { IItemBid } from "server/models/ItemBid";
import { api } from "./axios";
import type {
  PaginatedResponse,
  PublicApiResponse,
  LikeResponse,
} from "~/types/item";
import { type FilterType } from "~/shared/admin/tableFilter/TableFilters";
import type { ItemLabel } from "~/types/itemLabel";
import type { IPartner } from "../../server/models/Partner";
import type { ITeamMinified } from "../../server/models/shared/TeamMinifiedSchema";
import type { IPlayerMinified } from "../../server/models/shared/PlayerMinifiedSchema";
import type { IEventMinified } from "../../server/models/shared/EventMinifiedSchema";

// Sports API
export const getSports = async (): Promise<ISport[]> => {
  const response = await api.get<PublicApiResponse<ISport[], "sports">>(
    "/api/public/sport"
  );
  return response.data.sports;
};

export const getItemTypesBySport = async (
  sportId: string
): Promise<IItemType[]> => {
  const response = await api.get<PublicApiResponse<IItemType[], "itemTypes">>(
    `/api/public/sport/${sportId}/item-type`
  );
  return response.data.itemTypes;
};

export const getItemTypes = async (): Promise<Record<string, IItemType[]>> => {
  const response = await api.get<PublicApiResponse<Record<string, IItemType[]>, "itemTypes">>(
    `/api/public/sport/item-type`
  );
  return response.data.itemTypes;
};

export const getPlayerPositions = async (): Promise<{
  [sportName: string]: IPlayerPosition[];
}> => {
  const response = await api.get<
    PublicApiResponse<{ [sportName: string]: IPlayerPosition[] }, "positions">
  >(`/api/public/sport/player-position`);
  return response.data.positions;
};

// Teams API
export const getTeams = async ({ cursor, filter }: {
  cursor?: string,
  filter: FilterType<ITeam>
}): Promise<PaginatedResponse<ITeam, "teams">> => {
  const params = {
    ...cursor ? { cursor } : {},
    ...filter
  };

  const response = await api.get<PaginatedResponse<ITeam, "teams">>(
    "/api/public/team",
    { params }
  );
  return response.data;
};

export const getTeam = async (teamId: string): Promise<LikeResponse<ITeam>> => {
  const response = await api.get<
    PublicApiResponse<LikeResponse<ITeam>, "team">
  >(`/api/public/team/${teamId}`);
  return response.data.team;
};

export const getPending = async (): Promise<{
  teams: Array<ITeamMinified>;
  players: Array<IPlayerMinified>;
  events: Array<IEventMinified>;
}> => {
  const response = await api.get<
    PublicApiResponse<{
      teams: Array<ITeamMinified>;
      players: Array<IPlayerMinified>;
      events: Array<IEventMinified>;
    }, "pending">
  >(`/api/public/catalog/pending`);
  return response.data.pending;
};

export const getTeamPlayers = async (teamId: string): Promise<IPlayer[]> => {
  const response = await api.get<PublicApiResponse<IPlayer[], "players">>(
    `/api/public/team/${teamId}/players`
  );
  return response.data.players;
};

export const getTeamItems = async (
  teamId: string,
  cursor?: string
): Promise<PaginatedResponse<LikeResponse<IItem>, "items">> => {
  const params = cursor ? { cursor } : {};
  const response = await api.get<
    PaginatedResponse<LikeResponse<IItem>, "items">
  >(`/api/public/team/${teamId}/items`, { params });
  return response.data;
};

// Players API
export const getPlayers = async ({
  cursor,
  filter
}: { cursor?: string, filter: FilterType<IPlayer> }): Promise<PaginatedResponse<IPlayer, "players">> => {
  const params = {
    ...cursor ? { cursor } : {},
    ...filter
  };

  const response = await api.get<PaginatedResponse<IPlayer, "players">>(
    `/api/public/player`,
    { params }
  );
  return response.data;
};

export const getPlayer = async (
  playerId: string
): Promise<LikeResponse<IPlayer>> => {
  const response = await api.get<
    PublicApiResponse<LikeResponse<IPlayer>, "player">
  >(`/api/public/player/${playerId}`);
  return response.data.player;
};

export const getPlayerItems = async (
  playerId: string,
  cursor?: string
): Promise<PaginatedResponse<LikeResponse<IItem>, "items">> => {
  const params = cursor ? { cursor } : {};
  const response = await api.get<
    PaginatedResponse<LikeResponse<IItem>, "items">
  >(`/api/public/player/${playerId}/items`, { params });
  return response.data;
};

// Events API
export const getEvents = async (
  cursor?: string
): Promise<PaginatedResponse<IEvent, "events">> => {
  const params = cursor ? { cursor } : {};
  const response = await api.get<PaginatedResponse<IEvent, "events">>(
    "/api/public/event",
    { params }
  );
  return response.data;
};

export const getEvent = async (eventId: string): Promise<LikeResponse<IEvent>> => {
  const response = await api.get<PublicApiResponse<LikeResponse<IEvent>, "event">>(
    `/api/public/event/${eventId}`
  );
  return response.data.event;
};

export const getEventItems = async (
  eventId: string,
  cursor?: string
): Promise<PaginatedResponse<LikeResponse<IItem>, "items">> => {
  const params = cursor ? { cursor } : {};
  const response = await api.get<PaginatedResponse<LikeResponse<IItem>, "items">>(
    `/api/public/event/${eventId}/items`,
    { params }
  );
  return response.data;
};

// Items API
export const getItems = async (
  cursor?: string,
  filter?: FilterType<IItem>
): Promise<PaginatedResponse<LikeResponse<IItem>, "items">> => {
  const params = {
    ...cursor ? { cursor } : {},
    ...filter
  };

  const response = await api.get<
    PaginatedResponse<LikeResponse<IItem>, "items">
  >(`/api/public/catalog/item`, { params });
  return response.data;
};

export const getPartnerItems = async (
  partnerId: string,
  cursor?: string
): Promise<PaginatedResponse<LikeResponse<IItem>, "items">> => {
  const params = {
    ...cursor ? { cursor } : {},
  };

  const response = await api.get<
    PaginatedResponse<LikeResponse<IItem>, "items">
  >(`/api/public/partner/${partnerId}/item`, { params });
  return response.data;
};

export const getPartnersWithItems = async (cursor?: string): Promise<
  PaginatedResponse<
    LikeResponse<
      IPartner &
      { items: PaginatedResponse<LikeResponse<IItem>, "items"> }
    >,
    "partners"
  >
> => {
  const params = {
    ...cursor ? { cursor } : {},
  };

  const response = await api.get<
    PaginatedResponse<
      LikeResponse<
        IPartner &
        { items: PaginatedResponse<LikeResponse<IItem>, "items"> }
      >,
      "partners"
    >
  >(`/api/public/partner-with-item`, { params });
  return response.data;
};

export const getItem = async (itemId: string): Promise<LikeResponse<IItem>> => {
  const response = await api.get<
    PublicApiResponse<LikeResponse<IItem>, "item">
  >(`/api/public/catalog/item/${itemId}`);
  return response.data.item;
};

export const getItemBids = async (
  itemId: string,
  cursor?: string
): Promise<PaginatedResponse<IItemBid, "bids">> => {
  const params = cursor ? { cursor } : {};
  const response = await api.get<PaginatedResponse<IItemBid, "bids">>(
    `/api/public/catalog/item/${itemId}/bids`,
    { params }
  );
  return response.data;
};

// Item Labels API
export const getItemLabels = async (): Promise<ItemLabel[]> => {
  const response = await api.get<PublicApiResponse<ItemLabel[], "itemLabels">>(
    "/api/public/item-label"
  );
  return response.data.itemLabels;
};
