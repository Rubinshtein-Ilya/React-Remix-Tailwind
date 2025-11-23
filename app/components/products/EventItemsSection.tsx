import { useEventItems, useEvent } from "~/queries/public";
import ItemCard from "./ItemCard";
import ProductsCarousel from "~/shared/carousel/ProductsCarousel";
import { useTranslation } from "react-i18next";

interface EventItemsSectionProps {
  eventId: string;
  showEventInfo?: boolean;
}

function EventItemsSection({ eventId, showEventInfo = true }: EventItemsSectionProps) {
  const { t } = useTranslation();
  const { data: eventData, isLoading: eventLoading } = useEvent(eventId);
  const { data, isLoading, error, fetchNextPage, hasNextPage } = useEventItems(eventId);

  const allItems = data?.pages.flatMap(page => page.items) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Показываем состояние загрузки
  if (isLoading || eventLoading) {
    return (
      <div className="container mx-auto">
        <div className="embla pt-10">
          <div className="w-full flex gap-4 justify-between items-center pb-7">
            <div className="text-5xl text-[var(--text-primary)] font-medium leading-16 uppercase">
              {t("event_items.loading", "Загрузка предметов события...")}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-96 bg-[var(--bg-gray)] rounded-lg animate-pulse" />
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
          <div className="text-xl text-red-500 mb-4">
            {t("event_items.error", "Ошибка загрузки предметов события")}
          </div>
        </div>
      </div>
    );
  }

  // Если нет предметов, не рендерим блок
  if (!allItems.length) {
    return null;
  }

  return (
    <div className="container mx-auto">
      {/* Информация о событии */}
      {showEventInfo && eventData && (
        <div className="mb-8 p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              {eventData.name}
            </h2>
            {eventData.sport && (
              <div className="bg-[var(--bg-dark)] text-[var(--text-secondary)] px-4 py-2 rounded-full text-sm font-medium">
                {eventData.sport.name}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{formatDate(eventData.date)}</span>
            </div>
            
            {eventData.location && (
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{eventData.location}</span>
              </div>
            )}
          </div>
          
          {eventData.description && (
            <p className="mt-4 text-[var(--text-secondary)]">
              {eventData.description}
            </p>
          )}
        </div>
      )}

      <ProductsCarousel
        items={allItems}
        title={showEventInfo 
          ? t("event_items.title_with_event", "Предметы с события")
          : t("event_items.title", "Предметы события")
        }
        heading="title"
        renderCard={(item) => <ItemCard item={item} />}
      />
    </div>
  );
}

export default EventItemsSection; 