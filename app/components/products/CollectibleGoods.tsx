import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import CarouselHeading from "../../shared/carousel/CarouselHeading";
import Select from "../../shared/select/Select";
import ProductFilter from "../../shared/productFilter/ProductFilter";
import ProductsCarousel from "../../shared/carousel/ProductsCarousel";

function CollectibleGoods() {
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = useState<string>("");

  return (
    <>
      <div className="container mx-auto flex justify-between items-center">
        <CarouselHeading
          title={t("become_part.categories.collectible_finds")}
          subtitle={t("become_part.categories.collectible_finds_subtitle")}
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

export default CollectibleGoods;
