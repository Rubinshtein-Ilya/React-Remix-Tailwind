import { usePartnerItems } from "~/queries/public";
import ProductsCarousel from "~/shared/carousel/ProductsCarousel";
import { useTranslation } from "react-i18next";
import type {IPartner} from "../../../server/models/Partner";
import type {LikeResponse, PaginatedResponse} from "~/types/item";
import type {IItem} from "../../../server/models/Item";

interface IProps {
  blockStyles?: string;
  partner: IPartner & {
    items: PaginatedResponse<LikeResponse<IItem>, "items">
  }
}

function PartnersSection({ ...props }: IProps) {
  const { blockStyles = "", partner } = props;
  const { t } = useTranslation();

  const { data, isLoading, error } = usePartnerItems(
    partner._id,
    partner.items
  );

  const allItems = data?.pages.flatMap((page) => page.items) || [];

  // Показываем состояние загрузки
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="embla pt-10">
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
        <div className="text-center py-10">
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

  // todo make Products carousel support partners
  return (
    <div className={blockStyles}>
      <ProductsCarousel items={allItems} title={partner.meta.name} titleLink={`${partner.type}s/${partner.meta?.slug || partner._id}`}  heading="title" />
    </div>
  );
}

export default PartnersSection;
