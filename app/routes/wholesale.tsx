import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";

import p9_svg from "../assets/images/partners/p9_svg.svg";
import p10_svg from "../assets/images/partners/p10_svg.svg";
import p11_svg from "../assets/images/partners/p11_svg.svg";

export default function Wholesale() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 mt-10 sm:mt-20 lg:mt-30 px-4 sm:px-8 lg:px-20 pt-8 sm:pt-12 lg:pt-16">
      <div className="w-full bg-[#F8F8F8] py-10 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-[30px] sm:text-[35px] md:text-[40px] text-[#121212] text-left mb-4 sm:mb-6">
            ОПТОВЫЕ ЗАКУПКИ: КАК НАЧАТЬ
          </h2>
          <div className="text-left mb-5 text-[15px] sm:text-[15px] text-[#121212] mb-6 sm:mb-10">
            Хотите получить доступ к уникальным товарам по оптовым ценам на регулярной основе, вы
            можете написать нам. Преимущества оптовых закупок
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
            <div className="flex items-center bg-white rounded-xl p-4 sm:p-6 lg:p-8">
              <span className="mr-3 sm:mr-4 mt-1 text-yellow-500">
                <img className="w-12 h-12 sm:w-16 sm:h-16" src={p9_svg} alt="Уникальные товары" />
              </span>
              <div>
                <p className="text-[15px] sm:text-[15px] text-pretty">Уникальные товары</p>
                <p className="text-[15px] sm:text-[15px] text-pretty">
                  здесь и сейчас без необходимости участия в аукционе
                </p>
              </div>
            </div>
            <div className="flex items-center bg-white rounded-xl p-4 sm:p-6 lg:p-8">
              <span className="mr-3 sm:mr-4 mt-1 text-yellow-500">
                <img className="w-12 h-12 sm:w-16 sm:h-16" src={p10_svg} alt="Оптовые цены" />
              </span>
              <div>
                <p className="text-[15px] sm:text-[15px] text-pretty">Оптовые цены</p>
              </div>
            </div>
            <div className="flex items-center bg-white rounded-xl p-4 sm:p-6 lg:p-8">
              <span className="mr-3 sm:mr-4 mt-1 text-yellow-500">
                <img
                  className="w-12 h-12 sm:w-16 sm:h-16"
                  src={p11_svg}
                  alt="Быстрое согласование и доставка"
                />
              </span>
              <div>
                <p className="text-[15px] sm:text-[15px] text-pretty">
                  Быстрое согласование и доставка
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-[#F8F8F8] py-10 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-[30px] sm:text-[35px] md:text-[40px] text-[#121212] mb-6">
                {t("partners.coopTitle", "КАК НАЧАТЬ\nСОТРУДНИЧЕСТВО?")}
              </h2>
              <div className="text-[15px] sm:text-[15px] text-pretty text-[#121212] mb-8">
                {t("partners.coopSubtitle", "Заполните короткую форму и мы свяжемся с вами для обсуждения условий")}
              </div>
              <div className="flex flex-col gap-6 md:flex-row md:gap-10">
                <div className="flex items-center gap-4">
                  <span className="bg-black rounded-full w-12 h-12 flex items-center justify-center">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3.08 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.13 1.13.37 2.22.72 3.26a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c1.04.35 2.13.59 3.26.72A2 2 0 0 1 22 16.92z" fill="#fff"/></svg>
                  </span>
                  <span className="text-lg font-medium">+7 (999) 999-99-99</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-black rounded-full w-12 h-12 flex items-center justify-center">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2" fill="#fff"/><path d="m22 6-8.5 7a2 2 0 0 1-2.5 0L2 6" stroke="#000" strokeWidth="2"/></svg>
                  </span>
                  <span className="text-lg font-medium">pochta@mail.ru</span>
                </div>
              </div>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-8 flex flex-col gap-4 w-full max-w-xl mx-auto">
              <input className="rounded-lg px-4 py-3 bg-white text-base outline-none" placeholder={t("partners.form.name", "Ваше имя")} />
              <input className="rounded-lg px-4 py-3 bg-white text-base outline-none" placeholder={t("partners.form.position", "Ваша должность")} />
              <input className="rounded-lg px-4 py-3 bg-white text-base outline-none" placeholder={t("partners.form.company", "Название компании")} />
              <input className="rounded-lg px-4 py-3 bg-white text-base outline-none" placeholder={t("partners.form.email", "Ваш email")} />
              <input className="rounded-lg px-4 py-3 bg-white text-base outline-none" placeholder={t("partners.form.phone", "+7 (999) 999-99-99")} />
              <div className="relative">
                <textarea className="rounded-lg px-4 py-3 bg-white text-base outline-none w-full min-h-[80px] resize-none" placeholder={t("partners.form.comment", "Комментарий")} />
                <span className="absolute bottom-3 right-4 text-gray-500 cursor-pointer">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2" stroke="#222" strokeWidth="2"/><path d="M15 7V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2" stroke="#222" strokeWidth="2"/></svg>
                </span>
              </div>
              <AppButton className="mt-6 w-full rounded-full py-4 text-lg font-medium" type="submit">
                {t("partners.form.submit", "Стать партнёром")} <span className="ml-2">→</span>
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 