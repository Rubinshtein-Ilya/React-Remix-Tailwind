import { usePartnersWithItems } from "~/queries/public";
import { useTranslation } from "react-i18next";
import SinglePartnerSection from "~/components/partners/SinglePartnerSection";
import type { IPartner, PartnerType } from "../../../server/models/Partner";

interface IProps {
  blockStyles?: string;
}

const typePriority: Record<PartnerType, number> = {
  event: 0,
  player: 1,
  team: 2,
};

const sortPartners = (
  p1: Pick<IPartner, "createdAt" | "type">,
  p2: Pick<IPartner, "createdAt" | "type">
) => {
  const typeComparison = typePriority[p1.type] - typePriority[p2.type];
  if (typeComparison !== 0) return typeComparison;

  const date1 = new Date(p1.createdAt).getTime();
  const date2 = new Date(p2.createdAt).getTime();
  return date2 - date1; // from newest to oldest
}

function PartnersSection({ ...props }: IProps) {
  const { blockStyles = "" } = props;
  const { t } = useTranslation();
  const { data, isLoading, error } = usePartnersWithItems();

  const allPartners = data?.pages
    .flatMap((page) => page.partners)
    .sort(sortPartners)
    || [];

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
  if (!allPartners.length) {
    return null;
  }

  return (
    <>
      {allPartners.map(partner => (
        <SinglePartnerSection partner={partner} blockStyles={blockStyles} />
      ))}
    </>
  );
}

export default PartnersSection;
