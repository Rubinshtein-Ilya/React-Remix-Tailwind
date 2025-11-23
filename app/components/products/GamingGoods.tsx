import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ProductFilter from "../../shared/productFilter/ProductFilter";
import Select from "../../shared/select/Select";
import CarouselHeading from "../../shared/carousel/CarouselHeading";
import ProductsCarousel from "../../shared/carousel/ProductsCarousel";

function GamingGoods() {
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = useState<string>("");

  return (
    <>
      <div className="container mx-auto flex justify-between items-center">
        <CarouselHeading
          title={t("become_part.categories.game_items")}
          subtitle={t("become_part.categories.game_items_subtitle")}
        />
        <div className="flex gap-4">
          <Select onSelect={setSelectedValue} />
          <ProductFilter />
        </div>
      </div>
      {Array(3)
        .fill(null)
        .map((_, index) => (
          <section key={index}>
            <ProductsCarousel items={[]} />
          </section>
        ))}
    </>
  );
}

export default GamingGoods;
