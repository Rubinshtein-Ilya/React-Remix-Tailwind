import { useParams, useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { usePlayerPositions, useTeam, useTeamItems, useTeamPlayers } from "~/queries/public";
import { LikeButton } from "~/shared/buttons/LikeButton";
import ProductsCarousel from "~/shared/carousel/ProductsCarousel";
import { AppButton } from "~/shared/buttons/AppButton";
import { Spinner } from "~/shared/Spinner";
import { extractIdFromSlug } from "~/utils/slugUtils";
import useWindowWidth from "~/utils/useWindowWidth";

function TeamPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const width = useWindowWidth();

  // Извлекаем ID из slug
  const teamId = extractIdFromSlug(slug || "");

  // Загружаем данные команды через ID
  const { data: team, isLoading: teamLoading, error: teamError } = useTeam(teamId);
  const { data: playerPositions } = usePlayerPositions();
  const { data: teamItems, isLoading: itemsLoading } = useTeamItems(teamId);
  const { data: teamPlayers, isLoading: playersLoading } = useTeamPlayers(teamId);

  const allItems = teamItems?.pages.flatMap((page) => page.items) || [];

  // Показываем состояние загрузки
  if (teamLoading) {
    return (
      <div className="flex flex-col gap-4 mx-auto py-8 sm:py-12 lg:py-16 mt-15 bg-[var(--bg-gray)]">
        <div className="container px-4 pb-8 sm:pb-12 lg:pb-21">
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <Spinner size="lg" text={t("pages.teams.loading")} />
          </div>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (teamError || !team) {
    return (
      <div className="flex flex-col gap-4 mx-auto py-8 sm:py-12 lg:py-16 mt-15 bg-[var(--bg-gray)]">
        <div className="container px-4 pb-8 sm:pb-12 lg:pb-21">
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="text-xl sm:text-2xl text-red-500">{t("pages.teams.not_found")}</div>
            <AppButton
              variant="primary"
              className="mt-4 max-w-xs mx-auto"
              onClick={() => navigate("/")}
            >
              {t("common.back", "Назад")}
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mx-auto py-8 sm:py-12 lg:py-16 mt-15 bg-[var(--bg-gray)]">
      <div className="container px-4 pb-8 sm:pb-12 lg:pb-21">
        {/* Team info section */}
        <section className="team-info">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* left - Информация о команде */}
            <div className="w-full lg:w-[36rem] lg:shrink-0 flex flex-col gap-6 lg:gap-8">
              {/* Основная информация */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-4 sm:p-6 lg:p-8 border border-[var(--border-muted)]">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  {/* Логотип команды */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg bg-[var(--bg-gray)] overflow-hidden shrink-0 mx-auto sm:mx-0">
                    {team.images?.[0] && (
                      <img
                        src={team.images[0]}
                        alt={team.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Основная информация */}
                  <div className="flex flex-col gap-3 sm:gap-4 flex-1 text-center sm:text-left">
                    <div className="flex items-center sm:items-start sm:justify-between gap-3">
                      <h1 className="text-2xl sm:text-3xl font-medium text-[var(--text-primary)]">
                        {team.name}
                      </h1>
                      <LikeButton
                        sourceId={team._id}
                        type="team"
                        size={width && width < 640 ? "sm" : "lg"}
                        isLiked={team.isLiked}
                      />
                    </div>

                    {/* Информация о команде в формате описания */}
                    <div className="flex flex-col gap-2 sm:gap-3 text-[var(--text-primary)]">
                      <div className="flex sm:items-center gap-1 sm:gap-2">
                        <span className="font-medium text-sm sm:text-base">
                          {t("pages.teams.info.city")}:
                        </span>
                        <span className="text-[var(--text-primary)] text-sm sm:text-base">
                          {team.city}
                        </span>
                      </div>

                      <div className="flex  sm:items-center gap-1 sm:gap-2">
                        <span className="font-medium text-sm sm:text-base">
                          {t("pages.teams.info.established")}:
                        </span>
                        <span className="text-[var(--text-primary)] text-sm sm:text-base">
                          {new Date(team.establishedAt).getFullYear()}
                        </span>
                      </div>

                      <div className="flex sm:items-center gap-1 sm:gap-2">
                        <span className="font-medium text-sm sm:text-base">
                          {t("pages.teams.info.stadium")}:
                        </span>
                        <span className="text-[var(--text-primary)] text-sm sm:text-base">
                          {team.stadium}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Игроки команды */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-4 sm:p-6 lg:p-8 border border-[var(--border-muted)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-medium text-[var(--text-primary)]">
                    {t("pages.teams.players.title")}
                  </h2>
                  {teamPlayers && teamPlayers.length > 0 && (
                    <div className="text-sm text-[var(--text-primary)]">
                      {t("pages.teams.info.players_count")}: {teamPlayers.length}
                    </div>
                  )}
                </div>

                {playersLoading ? (
                  <div className="flex justify-center py-6 sm:py-8">
                    <Spinner size="md" text={t("common.loading", "Загрузка...")} />
                  </div>
                ) : teamPlayers && teamPlayers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 max-h-60 sm:max-h-80 overflow-y-auto">
                    {teamPlayers
                      .sort((a, b) => a.position.localeCompare(b.position))
                      .map((player) => (
                        <Link
                          key={player._id}
                          to={`/players/${player.slug}`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-gray)] hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                          {player.images?.[0] && (
                            <img
                              src={player.images[0]}
                              alt={player.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[var(--text-primary)] truncate text-sm sm:text-base">
                              {player.name} {player.lastName}
                            </div>
                            <div className="text-xs sm:text-sm text-[var(--text-primary)]">
                              {
                                playerPositions?.[team.sportId]?.find(
                                  (position) => position._id === player.position
                                )?.name
                              }{" "}
                              {player.number && `#${player.number}`}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-[var(--text-secondary)] text-sm sm:text-base">
                      {t("pages.teams.players.no_players", "У команды пока нет игроков")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* right - Карусель товаров */}
            <div className="flex-1 pt-0 lg:pt-8">
              <div className="top-20">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[var(--text-primary)] mb-4 sm:mb-6 lg:mb-8">
                  {t("pages.teams.items.title")}
                </h2>

                {itemsLoading ? (
                  <div className="flex justify-center py-12 sm:py-16">
                    <Spinner size="lg" text={t("pages.teams.items.loading")} />
                  </div>
                ) : allItems.length > 0 ? (
                  <div className="overflow-hidden">
                    <ProductsCarousel
                      items={allItems}
                      title={team.name}
                      imgSrc={team.images?.[0]}
                      heading="team"
                      slideWidth="18rem"
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16 lg:py-24 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-muted)]">
                    <div className="text-xl sm:text-2xl text-[var(--text-primary)] mb-3 sm:mb-4">
                      {t("pages.teams.items.no_items")}
                    </div>
                    <div className="text-sm sm:text-base text-[var(--text-primary)] px-4">
                      {t(
                        "pages.teams.items.no_items_description",
                        "Товары этой команды скоро появятся в нашем каталоге"
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TeamPage;
