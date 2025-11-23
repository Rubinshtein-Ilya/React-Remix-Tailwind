import React from "react";
import { useTranslation } from "react-i18next";
import GoodsCards from "~/components/products/GoodsCards";

function CurrentEvents() {
  const { t } = useTranslation();

  return (
    <section className="current-events">
      <section className="gaming-goods">
        <GoodsCards
          title={t("become_part.categories.game_items")}
          subtitle={t("become_part.categories.game_items_subtitle")}
        />
      </section>

      <section className="autographed-goods">
        <GoodsCards
          title={t("become_part.categories.autographed_items")}
          subtitle={t("become_part.categories.autographed_items_subtitle")}
        />
      </section>

      <section className="collectible-goods">
        <GoodsCards
          title={t("become_part.categories.collectible_finds")}
          subtitle={t("become_part.categories.collectible_finds_subtitle")}
          blockStyles="mb-10 sm:mb-20 pt-10 sm:pt-20"
        />
      </section>
    </section>
  );
}

export default CurrentEvents;
