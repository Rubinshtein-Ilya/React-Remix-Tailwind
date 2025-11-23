import { useParams } from "react-router";
import EventItemsSection from "~/components/products/EventItemsSection";
import { useTranslation } from "react-i18next";

export default function EventPage() {
  const { eventId } = useParams();
  const { t } = useTranslation();

  if (!eventId) {
    return (
      <div className="container mx-auto py-20">
        <div className="text-center">
          <h1 className="text-2xl text-red-500 mb-4">
            {t("event.not_found", "Событие не найдено")}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20">
      <EventItemsSection eventId={eventId} showEventInfo={true} />
    </div>
  );
} 