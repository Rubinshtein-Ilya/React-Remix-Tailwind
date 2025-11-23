import { Link } from "react-router";
import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import StatusChip from "~/shared/carousel/StatusChip";
import HeartIcon from "~/shared/icons/HeartIcon";
import type { LikeResponse } from "~/types/item";
import type { IItem } from "server/models/Item";

interface ItemCardProps {
  item: LikeResponse<IItem>;
}

function ItemCard({ item }: ItemCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { t } = useTranslation();

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  }, []);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currency || "RUB",
    }).format(price);
  };

  const getStatusChips = () => {
    const chips = [];

    // if (item.condition) {
    //   chips.push({ title: item.condition.toUpperCase() });
    // }

    if (item.team?.name) {
      chips.push({ title: item.team.name });
    }

    if (item.player?.name) {
      chips.push({ title: item.player.name });
    }

    if (item.event?.name) {
      chips.push({ title: item.event.name });
    }

    return chips.slice(0, 3); // Показываем максимум 3 чипа
  };

  const mainPhoto = item.images?.[0] || "/images/placeholder-item.png";

  return (
    <Link to={`/product/${item.slug}`} className="flex-shrink-0 w-full">
      <div className="rounded-lg overflow-hidden h-full flex flex-col">
        <div className="h-99 w-full bg-[var(--bg-gray)] overflow-hidden relative rounded-lg">
          <div
            onClick={handleFavoriteClick}
            className={clsx(
              "absolute bg-[var(--bg-dark)] top-4 left-4 w-11 h-11 flex items-center justify-center z-10 rounded-full cursor-pointer hover:bg-opacity-80 transition-all"
            )}
          >
            <HeartIcon
              width={24}
              height={24}
              color={isFavorite ? "#ef4444" : "#fff"}
            />
          </div>

          <img
            src={mainPhoto}
            alt={item.title}
            className="w-56 h-56 mt-12 mx-auto object-cover"
            loading="lazy"
          />

          <div className="flex gap-2 p-4 flex-wrap">
            {getStatusChips().map((chip, index) => (
              <StatusChip key={index} title={chip.title} />
            ))}
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-1 justify-between grow-1">
          <h3 className="text-md font-medium text-[var(--text-primary)] line-clamp-2">
            {item.title}
          </h3>

          <div className="text-md font-black text-[var(--text-primary)]">
            {formatPrice(item.price, "RUB")}
            <span className="text-md font-medium">
              {item.type === "auction"
                ? ` (${t("item.current_bid", "текущая ставка")})`
                : ` (${t("item.buy_now", "купить сейчас")})`}
            </span>
          </div>

          {item.stockBySize && (
            <div className="text-sm text-[var(--text-secondary)]">
              {t("item.size", "Размер")}:{" "}
              {Object.keys(item.stockBySize)
                .map((size) => size)
                .join(", ")}
            </div>
          )}

          <div className="text-sm text-[var(--text-secondary)]">
            {t("item.condition", "Состояние")}: {item.authenticity}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default React.memo(ItemCard);
