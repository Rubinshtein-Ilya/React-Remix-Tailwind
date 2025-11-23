import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import { useUserBids } from "~/queries/user";
import { useQueries } from "@tanstack/react-query";
import { getItem } from "~/api/public";
import { getTimeLeft } from "~/utils/dateUtils";
import type { IItemBid } from "server/models/ItemBid";
import type { IItem } from "server/models/Item";
import type { LikeResponse } from "~/types/item";
import { useNavigate } from "react-router";

type TabType = "for_sale" | "won" | "completed";

const MyBets: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("for_sale");
  const { data: userBids, isLoading } = useUserBids();
  const navigate = useNavigate();

  // Получаем все ставки из пагинированного ответа
  const allBids = useMemo(() => {
    if (!userBids?.pages) return [];
    const bids = userBids.pages.flatMap((page) => page.bids || []);
    // return only latest bid for each item
    const groupedBids = bids.reduce((acc, bid) => {
      if (
        !acc[bid.itemId] ||
        new Date(bid.createdAt).getTime() >
          new Date(acc[bid.itemId].createdAt).getTime()
      ) {
        acc[bid.itemId] = bid;
      }
      return acc;
    }, {} as Record<string, IItemBid>);
    return Object.values(groupedBids).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [userBids]);

  // Загружаем информацию о товарах для всех ставок
  const itemQueries = useQueries({
    queries: allBids.map((bid) => ({
      queryKey: ["item", bid.itemId],
      queryFn: () => getItem(bid.itemId),
      enabled: !!bid.itemId,
      retry: false,
    })),
  });

  // Создаем мапу товаров для быстрого доступа
  const itemsMap = useMemo(() => {
    const map: Record<string, LikeResponse<IItem>> = {};
    itemQueries.forEach((query, index) => {
      if (query.data && allBids[index]) {
        map[allBids[index].itemId] = query.data;
      }
    });
    return map;
  }, [itemQueries, allBids]);

  // Фильтруем ставки по статусу для каждой вкладки с учетом endTime товаров
  const filteredBids = useMemo(() => {
    const now = Date.now();

    return allBids.filter((bid) => {
      const item = itemsMap[bid.itemId];
      if (!item) return false; // Если товар еще не загружен, не показываем ставку

      const itemEndTime = new Date(item.endDate).getTime();
      const isAuctionActive = itemEndTime > now;

      switch (activeTab) {
        case "for_sale":
          // Товар еще продается (время не истекло)
          return isAuctionActive;
        case "won":
          // Товар больше не продается (время истекло) и ставка не перебита
          return !isAuctionActive && bid.status !== "outbid";
        case "completed":
          // Товар больше не продается (время истекло) и ставка перебита
          return !isAuctionActive && bid.status === "outbid";
        default:
          return false;
      }
    });
  }, [allBids, itemsMap, activeTab]);

  // Получаем статус ставки для отображения
  const getBidStatus = (bid: IItemBid, item?: LikeResponse<IItem>) => {
    if (!item) return bid.status;

    const now = Date.now();
    const itemEndTime = new Date(item.endDate).getTime();
    const isAuctionActive = itemEndTime > now;

    if (isAuctionActive) {
      // Аукцион еще активен
      if (bid.status === "active" && item.price === bid.price) {
        return t("profile.my_bets.status.active");
      } else {
        return t("profile.my_bets.status.outbid");
      }
    } else {
      // Аукцион завершен
      if (bid.status === "outbid") {
        return t("profile.my_bets.status.outbid");
      } else {
        return t("profile.my_bets.status.won");
      }
    }
  };

  // Получаем цвет для статуса
  const getStatusColor = (bid: IItemBid, item?: LikeResponse<IItem>) => {
    if (!item) return "text-gray-600";

    const now = Date.now();
    const itemEndTime = new Date(item.endDate).getTime();
    const isAuctionActive = itemEndTime > now;

    if (isAuctionActive) {
      if (bid.status === "active" && item.price === bid.price) {
        return "text-green-600";
      } else {
        return "text-red-600";
      }
    } else {
      if (bid.status === "outbid") {
        return "text-red-600";
      } else {
        return "text-green-600";
      }
    }
  };

  // Компонент для отображения одной ставки
  const BidCard: React.FC<{ bid: IItemBid }> = ({ bid }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [timeLeftColor, setTimeLeftColor] = useState("text-[#121212]");
    const item = itemsMap[bid.itemId];

    useEffect(() => {
      if (!item?.endDate) return;

      const updateTimer = () => {
        const timeLeft = getTimeLeft(new Date(item.endDate), t);
        setTimeLeft(timeLeft?.time || "");
        setTimeLeftColor(timeLeft?.color || "");
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }, [item?.endDate, t]);

    if (!item) {
      return (
        <div className="bg-white rounded-lg shadow p-6 mb-4 animate-pulse">
          <div className="flex gap-6">
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      );
    }

    const now = Date.now();
    const itemEndTime = new Date(item.endDate).getTime();
    const isAuctionActive = itemEndTime > now;

    return (
      <>
        <a href={`/product/${item.slug}`}>
          <div className="rounded-lg p-6 mb-4">
            <div className="flex gap-6">
              {/* Левая часть - изображение товара */}
              <div className="w-32 h-32 bg-white p-3 rounded-lg flex-shrink-0 overflow-hidden">
                <img
                  src={
                    item.thumbnail ||
                    item.images?.[0] ||
                    "/images/products/cafu-tshirt.png"
                  }
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Правая часть - информация о ставке */}
              <div className="flex-1 flex flex-col gap-2">
                {/* Статус ставки */}
                <div
                  className={`text-sm font-medium ${getStatusColor(bid, item)}`}
                >
                  {getBidStatus(bid, item)}
                </div>

                {/* Название товара */}
                <h3 className="text-lg font-semibold text-[#121212]">
                  {item.title}
                </h3>

                {/* Клуб, игрок, вид спорта */}
                <div className="text-sm text-[#121212]">
                  {item.team?.name && `${item.team.name}`}
                  {item.player?.name && `${item.player.name}`}
                  {item.details?.season && `${item.details.season}`}
                </div>

                {/* Таймер до конца */}
                {isAuctionActive && timeLeft && (
                  <div className={`text-sm font-medium ${timeLeftColor}`}>
                    {timeLeft}
                  </div>
                )}

                {/* Текущая ставка */}
                <div className="mt-2">
                  <div className="text-sm text-[#121212] mb-1 uppercase font-medium">
                    {t("profile.my_bets.current_bet")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#121212]">
                      {new Intl.NumberFormat(i18n.language).format(item.price)}{" "}
                      ₽
                    </span>
                    {isAuctionActive &&
                      bid.status === "active" &&
                      item.price === bid.price && (
                        <span className="text-sm text-[#121212]">
                          {t("profile.my_bets.your_bet")}
                        </span>
                      )}
                  </div>
                </div>

                {/* Ваша ставка (если она не текущая) */}
                {!isAuctionActive || item.price !== bid.price ? (
                  <div className="mt-1">
                    <div className="text-xs text-gray-500 mb-1">
                      {t("profile.my_bets.your_bid")}
                    </div>
                    <div className="text-lg font-medium text-gray-700">
                      {new Intl.NumberFormat(i18n.language).format(bid.price)} ₽
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </a>
        <div className="h-[1px] bg-[#DCDCDC]" />
      </>
    );
  };

  // Проверяем, загружены ли все товары
  const areItemsLoading = itemQueries.some((query) => query.isLoading);

  if (isLoading || areItemsLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg text-gray-600">
          {t("profile.my_bets.loading")}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Вкладки */}
      <div className="flex gap-2  sm:gap-4 mb-8">
        <AppButton
          variant={activeTab === "for_sale" ? "primary" : "ghost"}
          size="sm"
          fullWidth={false}
          onClick={() => setActiveTab("for_sale")}
          className={`!text-[10px] sm:!text-base ${
            activeTab !== "for_sale"
              ? "border border-[#121212] rounded-[100px]"
              : ""
          }`}
        >
          {t("profile.my_bets.tabs.for_sale")}
        </AppButton>
        <AppButton
          variant={activeTab === "won" ? "primary" : "ghost"}
          size="sm"
          fullWidth={false}
          onClick={() => setActiveTab("won")}
          className={`!text-[10px] sm:!text-base ${
            activeTab !== "won" ? "border border-[#121212] rounded-[100px]" : ""
          }`}
        >
          {t("profile.my_bets.tabs.won")}
        </AppButton>
        <AppButton
          variant={activeTab === "completed" ? "primary" : "ghost"}
          size="sm"
          fullWidth={false}
          onClick={() => setActiveTab("completed")}
          className={`!text-[10px] sm:!text-base ${
            activeTab !== "completed"
              ? "border border-[#121212] rounded-[100px]"
              : ""
          }`}
        >
          {t("profile.my_bets.tabs.completed")}
        </AppButton>
      </div>
      {/* Контент */}

      <div className="min-h-[400px]">
        {filteredBids.length === 0 ? (
          <div className="bg-white rounded-lg shadow py-9 px-[50px] text-left">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("profile.orders.no_orders_title")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("profile.orders.no_orders_desc")}
            </p>
            <AppButton
              variant="secondary"
              size="md"
              fullWidth={false}
              onClick={() => {
                navigate("/");
              }}
            >
              {t("profile.orders.go_shopping")} →
            </AppButton>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBids.map((bid) => (
              <BidCard key={bid._id} bid={bid} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyBets;
