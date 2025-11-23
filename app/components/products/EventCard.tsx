import { Link } from "react-router";
import React from "react";
import { useTranslation } from "react-i18next";

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Link to={`/event/${event.id}`} className="flex-shrink-0 w-full">
      <div className="rounded-lg overflow-hidden h-full flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:shadow-lg transition-shadow">
        <div className="h-48 w-full bg-gradient-to-br from-[var(--bg-dark)] to-[var(--bg-gray)] relative rounded-t-lg flex items-center justify-center">
          {/* Иконка события */}
          <div className="text-4xl text-[var(--text-secondary)]">🏆</div>

          {/* Спорт */}
          {event.sport && (
            <div className="absolute top-4 right-4 bg-[var(--bg-primary)] text-[var(--text-primary)] px-3 py-1 rounded-full text-sm font-medium">
              {event.sport.name}
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-3 grow">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] line-clamp-2">
            {event.name}
          </h3>

          {event.description && (
            <p className="text-sm text-[var(--text-secondary)] line-clamp-3">{event.description}</p>
          )}

          <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{formatDate(event.endDate)}</span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-3">
            <div className="text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-gray)] px-3 py-2 rounded-lg text-center hover:bg-[var(--bg-dark)] hover:text-[var(--text-secondary)] transition-colors">
              {t("event.view_items", "Посмотреть предметы")}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default React.memo(EventCard);
