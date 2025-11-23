import React from "react";
import { useTranslation } from "react-i18next";
import logoSVG from "../assets/images/logo.svg";
import { AppButton } from "~/shared/buttons/AppButton";
import { RiArrowRightLongLine } from "@remixicon/react";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-black text-white pt-4 lg:pt-10 pb-4 ">
      <div className="container flex flex-col gap-4 lg:flex-row lg:gap-10.5">
        <div>
          <div className="mb-0 sm:mb-4 md:mb-0 flex-shrink-0">
            <img src={logoSVG} alt="Fan's Dream" className="w-18 sm:w-32 mb-0 lg:mb-4" />
          </div>
        </div>
        <div className="w-full flex flex-col gap-11">
          <div className="w-full grid grid-cols-2 gap-y-4 lg:grid-cols-3 lg:flex  lg:justify-between lg:flex-wrap lg:gap-6">
            <div>
              <div className="font-bold mb-2 uppercase">{t("footer.company.name")}</div>
              <ul className="space-y-2 text-[12px] lg:text-sm">
                <li>
                  <a href="/about" className="hover:text-yellow-400 transition-colors">
                    {t("footer.company.about")}
                  </a>
                </li>
                <li>
                  <a href="/about#order" className="hover:text-yellow-400 transition-colors">
                    {t("footer.company.purchase_process")}
                  </a>
                </li>
                <li>
                  <a href="/framing" className="hover:text-yellow-400 transition-colors">
                    {t("footer.company.packaging")}
                  </a>
                </li>
                <li>
                  <a href="/authenticate" className="hover:text-yellow-400 transition-colors">
                    {t("footer.company.authenticate")}
                  </a>
                </li>
                <li>
                  <a href="/delivery" className="hover:text-yellow-400 transition-colors">
                    {t("footer.company.delivery")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-bold mb-2 uppercase">{t("footer.partnerships.title")}</div>
              <ul className="space-y-2 text-[12px] lg:text-sm">
                <li>
                  <a href="/partners" className="hover:text-yellow-400 transition-colors">
                    {t("footer.partnerships.official_partners")}
                  </a>
                </li>
                <li>
                  <a
                    href="/partners#advantages"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    {t("footer.partnerships.become_partner")}
                    <br />
                    {t("footer.partnerships.become_partner_subtitle")}
                  </a>
                </li>
                {/* <li>
                  <a
                    href="/wholesale"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    {t("footer.partnerships.wholesale")}
                  </a>
                </li> */}
              </ul>
            </div>
            <div>
              <div className="font-bold mb-2 uppercase">{t("footer.support.title")}</div>
              <ul className="space-y-2 text-[12px] lg:text-sm">
                <li>
                  <a href="/faq" className="hover:text-yellow-400 transition-colors">
                    {t("footer.support.faq")}
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@fansdream.ru"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    {t("footer.support.contact")}
                  </a>
                </li>
              </ul>
            </div>
            {/* <div>
              <div className="font-bold mb-2 uppercase">{t("footer.framing.title")}</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/framing" className="hover:text-yellow-400 transition-colors">
                    {t("footer.framing.baguette")}
                  </a>
                </li>
                <li>
                  <a href="/framing" className="hover:text-yellow-400 transition-colors">
                    {t("footer.framing.acrylic")}
                  </a>
                </li>
              </ul>
            </div> */}
            <div>
              <div className="font-bold mb-2 uppercase">{t("footer.social.title")}</div>
              <ul className="space-y-2 text-[12px] lg:text-sm">
                <li>
                  <a href="https://vk.com/fansdream_ru" target="_blank" rel="noopener noreferrer">
                    {t("footer.social.vk")}
                  </a>
                </li>
                <li>
                  <a href="https://t.me/fansdreamru" target="_blank" rel="noopener noreferrer">
                    {t("footer.social.telegram")}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/fansdream_ru"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("footer.social.instagram")}
                    {"*"}
                  </a>
                </li>
              </ul>
              <div className="text-[12px] lg:text-xs text-gray-300 mt-1 whitespace-pre-wrap max-w-[200px]">
                {t("footer.social.instagram_notification")}
              </div>
            </div>
          </div>
          {/* <div className="flex flex-col gap-2.5 md:gap-0">
            <div className="flex flex-col gap-2.5 md:flex-row md:gap-7">
              <div className="w-full md:w-1/2 lg:w-1/3">
                <div className="uppercase font-bold text-lg">{t("footer.newsletter.title")}</div>
              </div>
              <form className="flex flex-col gap-2 w-full md:w-64">
                <input
                  type="email"
                  placeholder={t("footer.newsletter.email_placeholder")}
                  className="rounded-full px-4 py-2 text-black outline-none w-full bg-[#F5F5F5] placeholder:text-[var(--text-primary)] placeholder:font-medium placeholder:uppercase"
                />

                <AppButton
                  variant="secondary"
                  icon={<RiArrowRightLongLine size={24} />}
                  className="flex items-center justify-start text-base h-10 font-medium"
                >
                  {t("footer.newsletter.subscribe_button")}
                </AppButton>
              </form>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3 text-xs text-gray-300">
              {t("footer.newsletter.privacy_text")}{" "}
              <a
                href="/privacy-policy"
                className="underline hover:text-yellow-400 transition-colors"
              >
                {t("footer.newsletter.privacy_link")}
              </a>{" "}
              {t("footer.newsletter.privacy_consent")}
            </div>
          </div> */}
        </div>
      </div>
      <div className="container pt-4 lg:pt-12 flex flex-col gap-2.5 md:flex-row md:gap-0 justify-between text-xs text-gray-300">
        <div className="order-2 md:order-1">
          {t("footer.legal.copyright", { year: new Date().getFullYear() })}
        </div>

        <a
          href="/legal/privacy-policy"
          className="hover:underline hover:text-yellow-400 transition-colors order-1"
        >
          {t("footer.legal.privacy_policy")}
        </a>
        <a
          href="/legal/auction-rules"
          className="hover:underline hover:text-yellow-400 transition-colors order-1"
        >
          {t("footer.legal.auction_rules")}
        </a>
        <a
          href="/legal/offer"
          className="hover:underline hover:text-yellow-400 transition-colors order-1"
        >
          {t("footer.legal.offer")}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
