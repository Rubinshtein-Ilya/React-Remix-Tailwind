import React from "react";
import { useTranslation } from "react-i18next";
import type { Route } from "../../+types/root";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Правила проведения онлайн-аукционов | Fan's Dream" },
    {
      name: "description",
      content:
        "Правила проведения онлайн-аукционов в интернет-магазине Fan's Dream. Условия участия в конкурентных торгах в электронной форме.",
    },
  ];
};

export default function AuctionRules() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--bg-gray)] py-16 mt-18">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-md font-bold text-gray-900 mb-4">{t("auction_rules.title")}</h1>
          <p className="text-xs text-gray-600 italic">{t("auction_rules.revision")}</p>
        </div>

        {/* Основной контент */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-gray max-w-none">
            {/* 1. Общие положения */}
            <section id="general" className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 mb-4">
                {t("auction_rules.sections.general.title")}
              </h2>
              <div className="space-y-4 text-xs">
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.general.content.1.1")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.general.content.1.2")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.general.content.1.3")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.general.content.1.3_continuation")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.general.content.1.4")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.general.content.1.5")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.general.content.1.5_continuation")}
                </p>
              </div>
            </section>

            {/* 2. Требования к участникам */}
            <section id="requirements" className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 mb-4">
                {t("auction_rules.sections.requirements.title")}
              </h2>
              <div className="space-y-4 text-xs">
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.requirements.content.2.1")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.requirements.content.2.2")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.requirements.content.2.2_continuation")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.requirements.content.2.3")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.requirements.content.2.3_continuation")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.requirements.content.2.4")}
                </p>
              </div>
            </section>

            {/* 3. Порядок проведения аукционов */}
            <section id="auction-procedure" className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 mb-4">
                {t("auction_rules.sections.auction_procedure.title")}
              </h2>
              <div className="space-y-4 text-xs">
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.auction_procedure.content.3.1")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.auction_procedure.content.3.2")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.auction_procedure.content.3.3")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.auction_procedure.content.3.4")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.auction_procedure.content.3.5")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.auction_procedure.content.3.6")}
                </p>
              </div>
            </section>

            {/* 4. Обязательства Победителя */}
            <section id="bidding" className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 mb-4">
                {t("auction_rules.sections.bidding.title")}
              </h2>
              <div className="space-y-4 text-xs">
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.bidding.content.4.1")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.bidding.content.4.2")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.bidding.content.4.3")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.bidding.content.4.4")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.bidding.content.4.4_continuation")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.bidding.content.4.5")}
                </p>
                <p className="text-justify leading-relaxed">
                  {t("auction_rules.sections.bidding.content.4.5_continuation")}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
