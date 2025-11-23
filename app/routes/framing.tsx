import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";

import lot1 from "../assets/images/about/b1.jpg";
import lot2 from "../assets/images/about/b2.jpg";
import acryl from "../assets/images/about/acryl.png";
import baget from "../assets/images/about/baget.png";

export default function Framing() {
  const { t } = useTranslation();

  return (
    <div className="container mt-10 sm:mt-20 lg:mt-30 pt-0">
      <div className="w-full bg-[var(--bg-primary)] pt-16 pb-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[30px] sm:text-[35px] md:text-[40px] mb-4 lg:mb-6 text-left uppercase text-[var(--text-primary)]">
            {t("pages.framing1.title")}
          </h2>
          <p className="mb-5 sm:mb-10 text-[15px] sm:text-[15px] text-pretty text-[var(--text-primary)]">
            <Trans
              i18nKey="pages.framing1.description"
              components={{
                br: <br />,
              }}
            />
          </p>
          {/* Варианты оформления */}
          <div className="flex flex-wrap gap-8 mb-12 justify-between">
            <div className="flex flex-col items-start flex-1 min-w-[280px] max-w-[320px]">
              <div className="mb-6 rounded-xl shadow-lg bg-[var(--bg-primary)] p-4 w-full flex items-center justify-center h-[220px] border border-[var(--border-muted)]">
                <img
                  src="/images/products/1.png"
                  alt="Стандартная упаковка"
                  className="object-contain h-full w-full"
                />
              </div>
              <div className="font-bold mb-1 text-[var(--text-primary)]">
                {t("pages.framing1.packaging.standard.title")}
              </div>
              <div className="text-[15px] sm:text-[15px] text-sm text-left text-[var(--text-primary)]">
                {t("pages.framing1.packaging.standard.description")}
              </div>
              <div className="font-bold mb-1 text-[var(--text-primary)]">
                {t("pages.framing1.packaging.standard.price")}
              </div>
            </div>
            <div className="flex flex-col items-start flex-1 min-w-[280px] max-w-[320px]">
              <div className="mb-6 rounded-xl shadow-lg bg-[var(--bg-primary)] p-4 w-full flex items-center justify-center h-[220px] border border-[var(--border-muted)]">
                <img src={baget} alt="Багетные рамки" className="object-contain h-full w-full" />
              </div>
              <div className="font-bold mb-1 text-[var(--text-primary)]">
                {t("pages.framing1.packaging.frames.title")}
              </div>
              <div className="text-[15px] sm:text-[15px] text-left text-[var(--text-primary)]">
                {t("pages.framing1.packaging.frames.description")}
              </div>
              <div className="font-bold mb-1 text-[var(--text-primary)]">
                {t("pages.framing1.packaging.frames.price")}
              </div>
            </div>
            <div className="flex flex-col items-start flex-1 min-w-[280px] max-w-[320px]">
              <div className="mb-6 rounded-xl shadow-lg bg-[var(--bg-primary)] p-4 w-full flex items-center justify-center h-[220px] border border-[var(--border-muted)]">
                <img src={acryl} alt="Акриловые кейсы" className="object-contain h-full w-full" />
              </div>
              <div className="font-bold mb-1 text-[var(--text-primary)]">
                {t("pages.framing1.packaging.acrylic_cases.title")}
              </div>
              <div className="text-[15px] sm:text-[15px] text-left text-[var(--text-primary)]">
                {t("pages.framing1.packaging.acrylic_cases.description")}
              </div>
              <div className="font-bold mb-1 text-[var(--text-primary)]">
                {t("pages.framing1.packaging.acrylic_cases.price")}
              </div>
            </div>
          </div>
          <div>* Услуги оформления появятся в ближайшее время</div>
        </div>
      </div>
      {/* <div className="">
        <h2 className="text-[30px] sm:text-[35px] md:text-[40px] mb-8 sm:mb-12 text-left uppercase text-[var(--text-primary)]">
          {t("pages.framing1.how_to_order.title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-12">
          <div className="flex flex-col items-start">
            <div className="w-full aspect-[3/4] bg-[var(--bg-secondary)] rounded-xl mb-6 border border-[var(--border-muted)]"></div>
            <div className="text-[15px] sm:text-[15px] text-[var(--text-primary)] text-left">
              {t("pages.framing1.how_to_order.steps.step1")}
            </div>
          </div>
          <div className="flex flex-col items-start">
            <div className="w-full aspect-[3/4] bg-[var(--bg-secondary)] rounded-xl mb-6 border border-[var(--border-muted)]"></div>
            <div className="text-[15px] sm:text-[15px] text-[var(--text-primary)] text-left">
              {t("pages.framing1.how_to_order.steps.step2")}
            </div>
          </div>
          <div className="flex flex-col items-start">
            <div className="w-full aspect-[3/4] bg-[var(--bg-secondary)] rounded-xl mb-6 border border-[var(--border-muted)]"></div>
            <div className="text-[15px] sm:text-[15px] text-[var(--text-primary)] text-left">
              {t("pages.framing1.how_to_order.steps.step3")}
            </div>
          </div>
          <div className="flex flex-col items-start">
            <div className="w-full aspect-[3/4] bg-[var(--bg-secondary)] rounded-xl mb-6 border border-[var(--border-muted)]"></div>
            <div className="text-[15px] sm:text-[15px] text-[var(--text-primary)] text-left">
              {t("pages.framing1.how_to_order.steps.step4")}
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
