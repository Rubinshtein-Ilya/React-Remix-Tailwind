import { useItems } from "~/queries/public";
import ProductsCarousel from "~/shared/carousel/ProductsCarousel";
import { useTranslation } from "react-i18next";

interface IProps {
  blockStyles?: string;
}

function ItemsSection({ ...props }: IProps) {
  const { blockStyles = "" } = props;
  const { t } = useTranslation();
  const { data, isLoading, error } = useItems();

  const allItems = data?.pages.flatMap((page) => page.items) || [];

  // Показываем состояние загрузки
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="embla">
          <div className="w-full flex gap-4 justify-between items-center pb-7">
            <div className="text-[20px] text-[var(--text-primary)] font-medium leading-16 uppercase">
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
        <div className="text-center">
          <div className="text-[20px] text-red-500 mb-4">
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

  return (
    <div className={blockStyles}>
      <ProductsCarousel
        items={allItems}
        title={t("items.title", "ТОВАРЫ В ПРОДАЖЕ")}
        heading="title"
      />
    </div>
  );
}

export default ItemsSection;
