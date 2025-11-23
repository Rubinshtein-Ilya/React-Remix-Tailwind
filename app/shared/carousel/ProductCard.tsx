import { Link } from "react-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTimeLeft } from "~/utils/dateUtils";
import { LikeButton } from "../buttons/LikeButton";
import type { IItem } from "server/models/Item";
import type { LikeResponse } from "~/types/item";
import { cn } from "~/lib/utils";
import useWindowWidth from "~/utils/useWindowWidth";
import { useItem } from "~/queries/public";
import LabelChip from "~/shared/carousel/LabelChip";

interface ProductCardProps {
  product: LikeResponse<IItem>;
  loadFullData?: boolean;
  isFullWidth?: boolean;
  showLabels?: boolean;
}

function ProductCard({
  product,
  loadFullData = false,
  isFullWidth = false,
  showLabels = true,
}: ProductCardProps) {
  const { data: fullItemData, isLoading } = useItem(
    loadFullData ? product._id : ""
  );
  const { t, i18n } = useTranslation();
  const itemData = fullItemData || product;
  const { time, color } = getTimeLeft(new Date(itemData.endDate), t) || {
    time: t("productCard.expired"),
    color: "text-red-200",
  };
  const [timeLeft, setTimeLeft] = useState(time);
  const [timeColor, setTimeColor] = useState(color);
  const width = useWindowWidth();

  useEffect(() => {
    if (itemData.endDate && itemData.salesMethod === "bidding") {
      const timer = setInterval(() => {
        const { time, color } = getTimeLeft(new Date(itemData.endDate), t) || {
          time: t("productCard.expired"),
          color: "text-red-200",
        };
        setTimeLeft(time);
        setTimeColor(color);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [itemData.endDate, t]);

  return (
    <Link
      to={`/product/${itemData.slug}`}
      className={`flex-shrink-0 ${isFullWidth ? "w-full" : "w-1/4"}`}
    >
      <div className="rounded-lg overflow-hidden h-full flex flex-col">
        <div className="w-full aspect-[4/5] bg-white border-3 border-[var(--bg-gray)] overflow-hidden relative rounded-lg flex items-center justify-center">
          <LikeButton
            sourceId={itemData._id}
            type="item"
            size={width && width >= 640 ? "lg" : "sm"}
            className={cn(
              "absolute bg-[var(--bg-dark)] top-4 left-4 flex items-center justify-center z-10 rounded-full"
            )}
            isLiked={itemData.isLiked}
          />
          <img
            src={
              itemData.thumbnail ||
              itemData.images?.[0] ||
              "/images/placeholder-item.png"
            }
            alt={itemData.title}
            loading="lazy"
            className="w-full h-full object-contain object-center"
          />
          {showLabels && width && width >= 640 && (
            <div className="absolute bottom-2 left-2 flex gap-2 flex-wrap justify-start">
              {(itemData.labels || []).map((label) => (
                <LabelChip key={label} labelId={label} />
            ))}
            {loadFullData &&
              isLoading &&
              (!itemData.labels || itemData.labels.length === 0) && (
                <>
                  <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-300 rounded animate-pulse"></div>
                    </>
                )}
            </div>
          )}
        </div>

        {/* Лейблы под изображением для мобильных устройств */}
        {showLabels && width && width < 640 && (
          <div className="pt-2 flex gap-2 flex-wrap justify-start">
            {(itemData.labels || []).map((label) => (
              <LabelChip key={label} labelId={label} />
            ))}
            {loadFullData &&
              isLoading &&
              (!itemData.labels || itemData.labels.length === 0) && (
                <>
                  <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-300 rounded animate-pulse"></div>
                </>
              )}
          </div>
        )}

        <div className="text-xs sm:text-base pt-2 sm:pt-4 flex flex-col gap-1 justify-between grow-1">
          <h3 className="line-clamp-1 font-medium text-[var(--text-primary)]">
            {itemData.title}
          </h3>

          <div className="font-black text-[var(--text-primary)]">
            {itemData.price ? (
              <>
                {Intl.NumberFormat(i18n.language).format(itemData.price)}₽{" "}
                {itemData.salesMethod === "bidding" && (
                  <span className="text-md font-medium">
                    ({t("productCard.bid")})
                  </span>
                )}
              </>
            ) : loadFullData && isLoading ? (
              <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
            ) : (
              <span className="text-sm text-gray-500">
                {t("productCard.priceNotAvailable", "Цена уточняется")}
              </span>
            )}
          </div>

          {itemData.endDate && itemData.salesMethod === "bidding" && (
            <span className={cn(" font-bold ", timeColor)}>{timeLeft}</span>
          )}

          {loadFullData && isLoading && !itemData.endDate && (
            <div className="h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default React.memo(ProductCard);
