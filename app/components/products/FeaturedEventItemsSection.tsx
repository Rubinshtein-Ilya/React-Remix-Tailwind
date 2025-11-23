import { useEvents } from "~/queries/public";
import EventItemsSection from "./EventItemsSection";
import { useTranslation } from "react-i18next";

interface IProps {
  blockStyles?: string;
}

function FeaturedEventItemsSection({ ...props }: IProps) {
  const { blockStyles = "pt-5 sm:pt-20" } = props;
  const { t } = useTranslation();
  const { data: eventsData, isLoading: eventsLoading } = useEvents();

  // Берем первое событие из списка для демонстрации
  const firstEvent = eventsData?.pages?.[0]?.events?.[0];

  // Показываем состояние загрузки
  if (eventsLoading) {
    return (
      <div className="container mx-auto">
        <div className="text-center py-10">
          <div className="text-[20px] text-[var(--text-primary)]">
            {t("event_items.loading", "Загрузка предметов события...")}
          </div>
        </div>
      </div>
    );
  }

  // Если нет событий, не рендерим блок
  if (!firstEvent) {
    return null;
  }

  return (
    <div className={blockStyles}>
      <EventItemsSection eventId={firstEvent.id} showEventInfo={false} />
    </div>
  );
}

export default FeaturedEventItemsSection;
