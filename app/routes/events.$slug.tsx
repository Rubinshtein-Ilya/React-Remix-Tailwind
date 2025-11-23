import { useParams, useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useEvent, useEventItems, useSports } from "~/queries/public";
import { LikeButton } from "~/shared/buttons/LikeButton";
import ProductsCarousel from "~/shared/carousel/ProductsCarousel";
import { AppButton } from "~/shared/buttons/AppButton";
import { Spinner } from "~/shared/Spinner";
import { extractIdFromSlug } from "~/utils/slugUtils";
import useWindowWidth from "~/utils/useWindowWidth";

function EventPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const width = useWindowWidth();

  // Извлекаем ID из slug
  const eventId = extractIdFromSlug(slug || "");

  // Загружаем данные события через ID
  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId);
  const { data: eventItems, isLoading: itemsLoading } = useEventItems(eventId);
  const { data: sports } = useSports();

  const allItems = eventItems?.pages.flatMap((page) => page.items) || [];

  // Показываем состояние загрузки
  if (eventLoading) {
    return (
      <div className="flex flex-col gap-4 mx-auto py-8 sm:py-12 lg:py-16 mt-15 bg-[var(--bg-gray)]">
        <div className="container px-4 pb-8 sm:pb-12 lg:pb-21">
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <Spinner size="lg" text={t("pages.events.loading")} />
          </div>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (eventError || !event) {
    return (
      <div className="flex flex-col gap-4 mx-auto py-8 sm:py-12 lg:py-16 mt-15 bg-[var(--bg-gray)]">
        <div className="container px-4 pb-8 sm:pb-12 lg:pb-21">
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="text-xl sm:text-2xl text-red-500">{t("pages.events.not_found")}</div>
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

  // Получаем название спорта
  const sportName = sports?.find(sport => sport._id === event.sportId)?.name || event.sportId;

  // Формируем место проведения
  const eventLocation = event.city && event.country
    ? `${event.city}, ${t(`country.${event.country}`)}`
    : event.city || (event.country ? t(`country.${event.country}`) : "");

  // Формируем место со стадионом
  const fullLocation = event.stadium
    ? `${event.stadium}${eventLocation ? `, ${eventLocation}` : ""}`
    : eventLocation;

  return (
    <div className="flex flex-col gap-4 mx-auto py-8 sm:py-12 lg:py-14 mt-14">
      <div className="w-full px-10 lg:h-120 bg-[var(--bg-gray)]">
        <div className="flex flex-col lg:h-120 mx-auto lg:max-w-[1195px] lg:flex-row lg:justify-between 2xl:justify-start gap-25.75">
          <div className="h-full self-center relative mx-auto sm:min-w-113.5 w-full xl:w-113.5 flex-shrink-0 flex flex-col justify-center gap-y-4.5 sm:gap-y-5.25 text-[var(--text-primary)]">
            <div className="xl:hidden w-full h-60 flex-shrink-0">
              <img
                className="w-full h-full object-contain"
                src={
                  event.images[0] ||
                  "https://fansdream.ru/assets/logo-Bho2Piyd.svg"
                }
                alt="event banner"
              />
            </div>

            <div className="flex flex-col justify-center gap-y-2 xl:gap-y-4.5 text-[var(--text-primary)] px-4 pt-0 pb-4 xl:px-0">
              <div className="gap-4 flex items-center">
                <LikeButton
                  sourceId={event._id}
                  type="event"
                  size={width && width < 640 ? "sm" : "lg"}
                  isLiked={event.isLiked}
                />
                <h1 className="text-[22px] lg:text-[30px] font-medium uppercase">
                  {event.name}
                </h1>
              </div>

              {event.description && (
                <p className="text-[14px] lg:text-[16px] text-pretty">
                  {event.description}
                </p>
              )}

              {!event.description && (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium text-sm sm:text-base">
                        {t("pages.events.info.sport")}:
                      </span>
                      <span className="text-[var(--text-primary)] text-sm sm:text-base">
                        {sportName}
                      </span>
                    </div>

                    <div className="flex sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium text-sm sm:text-base">
                        {t("pages.events.info.start_date")}:
                      </span>
                      <span className="text-[var(--text-primary)] text-sm sm:text-base">
                        {new Date(event.startDate).toLocaleDateString("ru-RU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {event.startDate !== event.endDate && (
                      <div className="flex sm:items-center gap-1 sm:gap-2">
                        <span className="font-medium text-sm sm:text-base">
                          {t("pages.events.info.end_date")}:
                        </span>
                        <span className="text-[var(--text-primary)] text-sm sm:text-base">
                          {new Date(event.endDate).toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}

                    {fullLocation && (
                      <div className="flex sm:items-center gap-1 sm:gap-2">
                        <span className="font-medium text-sm sm:text-base">
                          {t("pages.events.info.location")}:
                        </span>
                        <span className="text-[var(--text-primary)] text-sm sm:text-base">
                          {fullLocation}
                        </span>
                      </div>
                    )}

                    {event.participants && event.participants.length > 0 && (
                      <div className="flex sm:items-start gap-1 sm:gap-2">
                        <span className="font-medium text-sm sm:text-base">
                          {t("pages.events.info.participants")}:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {event.participants.map((participant, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {participant.name}
                              {participant.isHome &&
                                ` (${t("pages.events.info.home")})`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <div
            className="shrink-0 hidden xl:block"
            style={{ minWidth: "30vw" }}
          >
            <img
              className="w-full h-full object-contain"
              src={
                event.images[0] ||
                "https://fansdream.ru/assets/logo-Bho2Piyd.svg"
              }
              alt="event banner"
            />
          </div>
        </div>
      </div>

      <div className="container px-4 pb-8 sm:pb-12 lg:pb-21">
        {/* Event items section */}
        <section className="event-items">
          {itemsLoading ? (
            <div className="flex justify-center py-12 sm:py-16">
              <Spinner size="lg" text={t("pages.events.items.loading")} />
            </div>
          ) : allItems.length > 0 ? (
            <div className="overflow-hidden">
              <ProductsCarousel
                items={allItems}
                title={t("pages.events.items.items_on_sale")}
                heading="title"
                slideWidth="18rem"
              />
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 lg:py-24 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-muted)]">
              <div className="text-xl sm:text-2xl text-[var(--text-primary)] mb-3 sm:mb-4">
                {t("pages.events.items.no_items")}
              </div>
              <div className="text-sm sm:text-base text-[var(--text-primary)] px-4">
                {t(
                  "pages.events.items.no_items_description",
                  "Товары этого события скоро появятся в нашем каталоге"
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default EventPage; 
