import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserLikes } from "~/queries/user";
import { LikeButton } from "~/shared/buttons/LikeButton";
import { AppButton } from "~/shared/buttons/AppButton";
import { Link } from "react-router";
import { cn } from "../../lib/utils";

interface FavoriteItem {
  _id: string;
  name: string;
  image?: string;
  type: "team" | "player" | "event" | "item";
  slug?: string;
}

interface FavoriteCardProps {
  item: FavoriteItem;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({ item }) => {
  const getItemPath = (item: FavoriteItem) => {
    switch (item.type) {
      case "team":
        return `/team/${item.slug || item._id}`;
      case "player":
        return `/player/${item.slug || item._id}`;
      case "event":
        return `/event/${item.slug || item._id}`;
      case "item":
        return `/product/${item.slug || item._id}`;
      default:
        return "#";
    }
  };

  return (
    <div className="rounded-lg overflow-hidden h-full flex flex-col border border-gray-200 hover:shadow-md transition-shadow">
      <Link to={getItemPath(item)} className="block">
        <div className="w-full aspect-[4/5] bg-white border-b border-gray-200 overflow-hidden relative flex items-center justify-center">
          <img
            src={item.image || "/images/placeholder-item.png"}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-contain object-center"
          />
          <LikeButton
            sourceId={item._id}
            type={item.type}
            isLiked={true}
            size="sm"
            className={cn(
              "absolute bg-[var(--bg-dark)] top-4 left-4 flex items-center justify-center z-10 rounded-full"
            )}
          />
        </div>
        <div className="p-4 flex-1">
          <h3 className="text-base font-medium text-[#121212] line-clamp-2">
            {item.name}
          </h3>
        </div>
      </Link>
    </div>
  );
};

const EmptyState: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => (
  <div className="text-center py-16">
    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <svg
        className="w-10 h-10 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </div>
    <p className="text-gray-600 mb-2 text-lg font-medium">{title}</p>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);

export default function FavoriteTeams() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "all" | "events" | "teams" | "athletes"
  >("all");

  const { data: teamsData, fetchNextPage: fetchNextTeams } =
    useUserLikes("team");
  const { data: athletesData, fetchNextPage: fetchNextAthletes } =
    useUserLikes("player");
  const { data: eventsData, fetchNextPage: fetchNextEvents } =
    useUserLikes("event");

  const teams = teamsData?.pages.flatMap((page) => page.likes) ?? [];
  const athletes = athletesData?.pages.flatMap((page) => page.likes) ?? [];
  const events = eventsData?.pages.flatMap((page) => page.likes) ?? [];
  const all = [...events, ...athletes, ...teams];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (activeTab === "teams") {
        fetchNextTeams();
      } else {
        fetchNextAthletes();
      }
    }
  };

  const tabButtonClassName = (isActive: boolean) =>
    `border border-[#121212] rounded-[100px] ${
      isActive ? "" : "border-opacity-50"
    }`;

  const renderFavoritesList = (
    items: FavoriteItem[],
    emptyTitle: string,
    emptySubtitle: string
  ) => (
    <>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <FavoriteCard key={item._id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 flex-wrap">
        <AppButton
          variant={activeTab === "all" ? "primary" : "ghost"}
          size="sm"
          fullWidth={false}
          onClick={() => setActiveTab("all")}
          className={tabButtonClassName(activeTab === "all")}
        >
          {t("profile.favorite_teams.all_tab")}
        </AppButton>
        <AppButton
          variant={activeTab === "events" ? "primary" : "ghost"}
          size="sm"
          fullWidth={false}
          onClick={() => setActiveTab("events")}
          className={tabButtonClassName(activeTab === "events")}
        >
          {t("profile.favorite_teams.events_tab")}
        </AppButton>
        <AppButton
          variant={activeTab === "teams" ? "primary" : "ghost"}
          size="sm"
          fullWidth={false}
          onClick={() => setActiveTab("teams")}
          className={tabButtonClassName(activeTab === "teams")}
        >
          {t("profile.favorite_teams.teams_tab")}
        </AppButton>
        <AppButton
          variant={activeTab === "athletes" ? "primary" : "ghost"}
          size="sm"
          fullWidth={false}
          onClick={() => setActiveTab("athletes")}
          className={tabButtonClassName(activeTab === "athletes")}
        >
          {t("profile.favorite_teams.athletes_tab")}
        </AppButton>
      </div>

      <div className="overflow-auto" onScroll={handleScroll}>
        {activeTab === "all" &&
          renderFavoritesList(
            all,
            t("profile.favorite_teams.empty_all"),
            t("profile.favorite_teams.add_favorites")
          )}
        {activeTab === "events" &&
          renderFavoritesList(
            events,
            t("profile.favorite_teams.empty_events"),
            t("profile.favorite_teams.add_events")
          )}
        {activeTab === "teams" &&
          renderFavoritesList(
            teams,
            t("profile.favorite_teams.empty_teams"),
            t("profile.favorite_teams.add_teams")
          )}
        {activeTab === "athletes" &&
          renderFavoritesList(
            athletes,
            t("profile.favorite_teams.empty_athletes"),
            t("profile.favorite_teams.add_athletes")
          )}
      </div>
    </div>
  );
}
