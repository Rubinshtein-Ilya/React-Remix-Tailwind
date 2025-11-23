import { useEvents } from "~/queries/public";
import EventCard from "~/components/products/EventCard";
import ProductsCarousel from "~/shared/carousel/ProductsCarousel";
import { useTranslation } from "react-i18next";

interface IProps {
  blockStyles?: string;
}

function EventsSection({ ...props }: IProps) {
  const { blockStyles = "pt-5 sm:pt-20" } = props;
  const { t } = useTranslation();
  const { data, isLoading, error, fetchNextPage, hasNextPage } = useEvents();

  const allEvents = data?.pages.flatMap((page) => page.events) || [];

  // Показываем состояние загрузки
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="embla pt-10">
          <div className="w-full flex gap-4 justify-between items-center pb-7">
            <div className="text-[20px] text-[var(--text-primary)] font-medium leading-16 uppercase">
              {t("events.loading", "Загрузка событий...")}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-64 bg-[var(--bg-gray)] rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="container mx-auto">
        <div className="text-center py-10">
          <div className="text-[20px] text-red-500 mb-4">
            {t("events.error", "Ошибка загрузки событий")}
          </div>
        </div>
      </div>
    );
  }

  // Если нет событий, не рендерим блок
  if (!allEvents.length) {
    return null;
  }

  return (
    <div className={blockStyles}>
      <ProductsCarousel
        events={allEvents}
        title={t("events.title", "События")}
        heading="title"
        slideWidth="24rem"
        renderCard={(event) => <EventCard event={event} />}
      />
    </div>
  );
}

export default EventsSection;
