import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";
import logoSVG from "../assets/images/logo.svg";
import creators from "../assets/images/creators.png";
import auth1 from "../assets/images/about/a1.png";
import auth2 from "../assets/images/about/a2.png";
import auth3 from "../assets/images/about/a3.png";
import auth4 from "../assets/images/about/a4.png";
import auth5 from "../assets/images/about/a5.png";
import auth6 from "../assets/images/about/a6.png";
import { LoginModal } from "~/components/Dialogs/LoginModal";
import { useEffect, useRef, useState } from "react";
import { useUser } from "~/queries/auth";

export default function About() {
  // const { t } = useTranslation();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const orderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.hash === "#order" && orderRef.current) {
      orderRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-gray-50 mt-10 sm:mt-20 lg:mt-30 px-0 pt-16 mb-[-20px]">
      <div className="w-full bg-[#F8F8F8]">
        <div className="max-w-7xl mx-auto">
          <div id="about" className="mb-6 px-4">
            <h1 className="text-[30px] sm:text-[35px] md:text-[40px] text-[#121212] text-left uppercase">
              О нас
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 px-4">
            <div className="md:col-span-9">
              <p className="text-[15px] sm:text-[15px] mb-8 text-left">
                Fan’s Dream — это платформа, где болельщики могут приобрести уникальные спортивные
                товары напрямую от спортсменов и клубов. Здесь собраны подлинные предметы, связанные
                с карьерой звезд спорта: от экипировки, использованной в официальных матчах, до
                сувенирной продукции с личным автографом.
              </p>
              <p className="text-[15px] sm:text-[15px] mb-8 text-left">
                В центре внимания — подлинность, доверие и прямой контакт между болельщиками и миром
                профессионального спорта. Каждый лот проходит проверку, имеет уникальный код и
                сопровождается сертификатом. История спорта — теперь в ваших руках!
              </p>
            </div>
            <div className="col-span-3 rounded-lg hidden lg:block">
              <img src={logoSVG} alt="Fan's Dream" className="h-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-[#FFF]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 py-8 sm:py-16 px-4">
            <h2 className="text-[30px] sm:text-[35px] md:text-[40px] text-[#121212] text-left uppercase mb-8">
              Преимущества Fan's Dream
            </h2>
            <div className="space-y-10">
              <div>
                <h3 className="font-bold uppercase mb-2 text-[17px]">Уникальные товары</h3>
                <p className="text-[15px] ">
                  Наша платформа предоставляет доступ к спортивным лотам, которые раньше были
                  недоступны широкой аудитории. Экипировка, использованная в матчах и соревнованиях,
                  а также футболки, джерси и свитшоты с автографами теперь могут стать частью вашей
                  коллекции.
                </p>
              </div>
              <div>
                <h3 className="font-bold uppercase mb-2 text-[17px]">Качество и подлинность</h3>
                <p className="text-[15px]">
                  Мы сотрудничаем напрямую со спортсменами и клубами, что гарантирует подлинность
                  каждого лота. Все товары сопровождаются сертификатом, а в отдельных категориях
                  дополнительно используется NFC-чип, который можно отсканировать телефоном для
                  подтверждения оригинальности.
                </p>
              </div>
              <div>
                <h3 className="font-bold uppercase mb-2 text-[17px]">Доставка</h3>
                <p className="text-[15px] pb-3">
                  Все товары бережно упаковываются и доставляются по всей территории России, а также
                  в страны ЕАЭС: Казахстан, Киргизию, Армению и Беларусь.
                </p>
                <p className="text-[15px]">
                  Доступны два варианта доставки — стандартная и экспресс. Вы можете выбрать удобный
                  способ перед оплатой заказа.
                </p>
              </div>
              <div>
                <h3 className="font-bold uppercase mb-2 text-[17px]">Упаковка и оформление</h3>
                <p className="text-[15px] pb-3">
                  Каждый товар Fan’s Dream бережно упаковывается с учётом его особенностей. Для
                  большинства лотов используется фирменная подарочная упаковка. Дополнительно все
                  заказы защищаются внешней упаковкой для безопасной доставки.
                </p>
                <p className="text-[15px]">
                  Также мы предлагаем услуги по оформлению товаров в багетные рамы и акриловые кейсы
                  — для тех, кто хочет превратить лот в полноценный экспонат. Услуга доступна после
                  завершения аукциона.
                </p>
              </div>
              <div>
                <h3 className="font-bold uppercase mb-2 text-[17px]">Благотворительность</h3>
                <p className="text-[15px]">
                  Часть выручки от продаж передаётся в благотворительные организации. Покупая на
                  Fan’s Dream, вы не только пополняете коллекцию, но и поддерживаете важные
                  социальные инициативы.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="order" ref={orderRef} className="w-full bg-[#F8F8F8] pb-16 scroll-mt-40">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-[30px] sm:text-[35px] md:text-[40px] mb-8 sm:mb-16 uppercase text-left">
            Как участвовать в аукционе
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-6 sm:gap-10 mb-12">
            <div className="flex flex-col items-start md:col-span-4">
              <div className="mb-6 rounded-xl shadow-lg bg-white p-4 w-full max-w-xs flex items-center justify-center h-[220px]">
                <img src={auth1} alt="Регистрация" className="object-contain h-full w-full" />
              </div>
              <div className="font-bold mb-1">1. Регистрация</div>
              <div className="text-left">
                Зарегистрируйтесь с помощью электронной почты, Яндекс ID или VK ID.
              </div>
            </div>
            <div className="flex flex-col items-start md:col-span-4">
              <div className="mb-6 rounded-xl shadow-lg bg-white p-4 w-full max-w-xs flex items-center justify-center h-[220px]">
                <img src={auth2} alt="Верификация" className="object-contain h-full w-full" />
              </div>
              <div className="font-bold mb-1">2. Верификация</div>
              <div className="text-left">
                Подтвердите свой номер телефона, укажите адрес для доставки и привяжите банковскую
                карту.
              </div>
            </div>
            <div className="flex flex-col items-start md:col-span-4">
              <div className="mb-6 rounded-xl shadow-lg bg-white p-4 w-full max-w-xs flex items-center justify-center h-[220px]">
                <img src={auth3} alt="Ставки" className="object-contain h-full w-full" />
              </div>
              <div className="font-bold mb-1">3. Ставки</div>
              <div className="text-left">
                Сделайте ставку на товар, который вы хотите приобрести, и дождитесь завершения
                аукциона.
              </div>
            </div>
            <div className="flex flex-col items-start md:col-span-4">
              <div className="mb-6 rounded-xl shadow-lg bg-white p-4 w-full max-w-xs flex items-center justify-center h-[220px]">
                <img src={auth4} alt="Оплата товара" className="object-contain h-full w-full" />
              </div>
              <div className="font-bold mb-1">4. Оплата товара</div>
              <div className="text-left">
                Оплатите товар в течение 24 часов после победы в аукционе.
              </div>
            </div>
            <div className="flex flex-col items-start md:col-span-4">
              <div className="mb-6 rounded-xl shadow-lg bg-white p-4 w-full max-w-xs flex items-center justify-center h-[220px]">
                <img src={auth5} alt="Оформление товара" className="object-contain h-full w-full" />
              </div>
              <div className="font-bold mb-1">5. Оформление товара</div>
              <div className="text-left">
                После оплаты вам будет предоставлена возможность оформить товар в багетную раму или
                акриловый кейс.
              </div>
            </div>
            <div className="flex flex-col items-start md:col-span-4">
              <div className="mb-6 rounded-xl shadow-lg bg-white p-4 w-full max-w-xs flex items-center justify-center h-[220px]">
                <img src={auth6} alt="Доставка" className="object-contain h-full w-full" />
              </div>
              <div className="font-bold mb-1">6. Доставка</div>
              <div className="text-left">
                Вы сможете отслеживать статус доставки на нашем сайте, введя номер заказа в
                специальном поле по ссылке:
                <Link to="/delivery" className="text-blue-500 hover:text-blue-600">
                  {" "}
                  https://fansdream.ru/delivery
                </Link>
                .
              </div>
            </div>
            <div className="md:col-span-6 flex flex-col md:flex-row gap-6 justify-left">
              <AppButton
                onClick={() => navigate("/")}
                variant="secondary"
                className="px-2 py-3 text-lg"
              >
                Перейти в каталог <span>→</span>
              </AppButton>
              {!user && (
                <AppButton
                  onClick={() => setIsLoginModalOpen(true)}
                  variant="secondary"
                  className="px-2 py-3 text-lg"
                >
                  Регистрация <span>→</span>
                </AppButton>
              )}
            </div>
          </div>
        </div>
      </div>

      <div id="creators" className="w-full bg-[#F8F8F8] pb-20 relative">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 items-center ">
          <div className="md:col-span-7">
            <h2 className="text-[30px] sm:text-[35px] md:text-[40px] mb-6 sm:mb-8 uppercase">
              Создатели
            </h2>
            <p className="text-[15px] sm:text-[15px] text-black leading-relaxed max-w-2xl pb-8">
              Спорт — это страсть и эмоции, которые являются неотъемлемой частью нашей жизни. Мы
              всегда мечтали иметь доступ к уникальной спортивной атрибутике, а также к товарам,
              использованным спортсменами в официальных соревнованиях. Столкнувшись с трудностями в
              поиске таких вещей, мы решили создать платформу, которая обеспечит болельщикам легкий
              доступ к оригинальным товарам любимых спортсменов и поможет укрепить связь с
              болельщиками.
            </p>

            <p className="text-[15px] sm:text-[15px] text-black leading-relaxed max-w-2xl pb-8">
              Создание проекта потребовало значительных усилий, и теперь мы с гордостью сообщаем о
              его запуске и наших первых партнерах: «Матч года 2025. Все звезды хоккея», Александра
              Трусова, Алена Косторная, Макар Игнатов, Георгий Куница, Егор Титов, Даниил Дубов и
              многие другие.
            </p>

            <p className="text-[16px] sm:text-[18px] text-black leading-relaxed max-w-2xl pb-8 italic font-light tracking-wide" style={{fontFamily: 'Georgia, serif'}}>
              Димитрий Забежинский и Дмитрий Хижняков
            </p>
          </div>
          <div className="relative sm:absolute sm:right-60 bottom-0 md:col-span-5 flex justify-center md:justify-end">
            <img
              src={creators}
              alt="Создатели"
              className="w-full sm:w-[540px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
