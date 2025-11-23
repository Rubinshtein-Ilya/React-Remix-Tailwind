import { useState } from "react";
import ProductsCarousel from "../../shared/carousel/ProductsCarousel";
import { productsWithExpiry } from "~/mockData/mockProducts";
import { useTranslation } from "react-i18next";
import { useItems } from "~/queries/public";

function PreviewGoods() {
  const [selectedValue, setSelectedValue] = useState<string>("1");
  const { t } = useTranslation();
  const { data, isLoading, error } = useItems();

  const allItems = data?.pages.flatMap((page) => page.items) || [];

  // Показываем состояние загрузки
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="embla pt-10">
          <div className="w-full flex gap-4 justify-between items-center pb-7">
            <div className="text-5xl text-[var(--text-primary)] font-medium leading-16 uppercase">
              {t("items.loading", "Загрузка предметов...")}
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
            {t("items.error", "Ошибка загрузки предметов")}
          </div>
        </div>
      </div>
    );
  }

  // Если нет предметов, не рендерим блок
  if (!allItems.length) {
    return null;
  }

  const options = [
    {
      id: "new",
      label: "новинки",
      value: "1",
    },
    {
      id: "exclusive",
      label: "Популярные",
      value: "2",
    },
    {
      id: "soon",
      label: "скоро в продаже",
      value: "3",
    },
  ];

  return (
    <ProductsCarousel
      items={allItems}
      heading="btns"
      options={options}
      selectedValue={selectedValue}
      setSelectedValue={setSelectedValue}
    />
  );
}

export default PreviewGoods;
