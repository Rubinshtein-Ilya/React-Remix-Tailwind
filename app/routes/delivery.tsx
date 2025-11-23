import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";

import calendar from "../assets/images/about/calendar.svg";
import pack from "../assets/images/about/pack.svg";
import search from "../assets/images/about/search.svg";

export default function Delivery() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="container mt-10 sm:mt-20 lg:mt-30  pt-0">
      <div className="w-full bg-[#FFF] py-16">
        <div className="max-w-7xl mx-auto">
          <div className="w-full flex gap-8 justify-between items-center mb-4">
            <div>
              <h2 className="text-[30px] sm:text-[35px] md:text-[40px]  text-left uppercase">
                Доставка
              </h2>
            </div>
            <div>
              <svg width={70} viewBox="0 0 568.03 158.6" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <style>
                    {`.cls-1 {
                    fill: #109b47;
                    fill-rule: evenodd;
                    stroke-width: 0px;
                  }`}
                  </style>
                </defs>
                <g id="_Слой_1-2" data-name="Слой_1">
                  <g id="_1361337434960" data-name=" 1361337434960">
                    <path
                      className="cls-1"
                      d="M396.43,60.2h-86.2c-14.3,0-20.7,4-23.3,12.1l-8.1,26.2h86.2c14.3,0,20.7-4,23.3-12.1l8.1-26.2Z"
                    />
                    <path
                      className="cls-1"
                      d="M100.73,38.4h-16.3c-32.6,0-60.4,81.9-22,81.8h24.8c14.3,0,24.8,5.2,20.1,19.1l-6.4,19.2h-26.3l-21.3-.2c-27.3-.2-44.9-13.6-51.2-33.9-6.9-22,2.9-67.7,30.9-97.1C49.33,10.2,71.93,0,100.93,0h53.5l-8.4,24c-5.4,15.5-16.5,14.4-22.8,14.4h-22.5Z"
                    />
                    <path
                      className="cls-1"
                      d="M375.43,120.3h-86.2c-14.3,0-20.7,4-23.3,12.1l-8.1,26.2h86.2c14.3,0,20.7-4,23.3-12.1l8.1-26.2h0ZM416.43.1h-86.2c-14.3,0-20.7,4-23.3,12.1l-8.1,26.2h86.2c14.3,0,20.7-4,23.3-12.1L416.43.1h0Z"
                    />
                    <path
                      className="cls-1"
                      d="M199.63,38.3h21.5c18.3,0,14.1,22.8,4.8,45.1-8.2,19.6-22.6,37-39.8,37h-35.8c-14.3,0-20.9,4-23.6,12.1l-8.8,26.1h26.3l25.6-.2c22.8-.2,41.3-1.8,63.1-21.4,23-20.7,49.8-74.4,45.2-105.4C274.53,7.2,261.43.1,229.73.1h-57.7l-33.6,98.3h21.3c12.7,0,19.1.2,25.9-18l14-42.1h0Z"
                    />
                    <path
                      className="cls-1"
                      d="M382.03,158.6h40.7l17.4-49.9,18.2-15.3,14.4,45.1c4.4,14,9,20.1,19,20.1h31.2l-32.1-88.6L568.03,0h-49.9l-47,49.9c-5.5,5.8-11,11.5-16.5,18.4h-.5L477.43,0h-40.7l-54.7,158.6h0Z"
                    />
                  </g>
                </g>
              </svg>
            </div>
          </div>
          <p className="mb-5 text-[15px] sm:text-[15px] text-pretty">
            Мы сотрудничаем с СДЭК, чтобы обеспечить безопасную и оперативную доставку. Все заказы
            отправляются только до двери — это гарантирует, что товар получаете лично вы. Вариант
            доставки выбирается перед оплатой заказа.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-12">
            <div className="bg-[#F8F8F8] rounded-xl p-8 flex flex-col gap-2 sm:gap-4">
              <div className="flex flex-row items-center gap-4">
                <span className="flex shrink-0 w-12 sm:w-18 h-12 sm:h-18 bg-black rounded-full items-center justify-center">
                  <img
                    src={calendar}
                    alt="Геогрфия и сроки доставки"
                    className="w-6 h-6 object-contain"
                  />
                </span>
                <span className="font-bold text-base sm:text-lg">Варианты доставки</span>
              </div>
              <div className="text-black text-[15px] sm:text-[15px] mt-2">
                Вы можете выбрать подходящий вариант доставки — стандартный или экспресс — в
                зависимости от сроков и ваших предпочтений.
              </div>
            </div>
            <div className="bg-[#F8F8F8] rounded-xl p-8 flex flex-col gap-2 sm:gap-4">
              <div className="flex flex-row items-center gap-4">
                <span className="flex shrink-0 w-12 sm:w-18 h-12 sm:h-18 bg-black rounded-full items-center justify-center">
                  <img src={pack} alt="Упаковка" className="w-6 h-6 object-contain" />
                </span>
                <span className="font-bold text-base sm:text-lg">Упаковка</span>
              </div>
              <div className="text-black text-[15px] sm:text-[15px] mt-2 text-pretty">
                Каждый заказ надёжно защищается транспортной упаковкой, которая предотвращает
                повреждения и обеспечивает презентабельный внешний вид товара при получении.
              </div>
            </div>
            <div className="bg-[#F8F8F8] rounded-xl p-8 flex flex-col gap-2 sm:gap-4">
              <div className="flex flex-row items-center gap-4">
                <span className="flex shrink-0 w-12 sm:w-18 h-12 sm:h-18 bg-black rounded-full items-center justify-center">
                  <img src={search} alt="Отслеживание" className="w-6 h-6 object-contain" />
                </span>
                <span className="font-bold text-base sm:text-lg">Отслеживание</span>
              </div>
              <div className="text-black text-[15px] sm:text-[15px] mt-2 text-pretty">
                После оформления заказа вы получите трек-номер. Статус доставки можно отслеживать в
                личном кабинете, в поле ниже или на сайте cdek.ru.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 bg-[#F8F8F8] rounded-xl p-4 sm:p-8 mb-5 sm:mb-10">
            <div className="col-span-2">
              <h3 className="text-base sm:text-lg font-bold mb-2 uppercase">Отследить заказ</h3>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="mb-2 sm:mb-4 text-[15px] sm:text-[15px]">
                Введите код, чтобы отследить вашу доставку
              </p>
            </div>
            <div className=" lg:col-span-1 col-span-2">
              <form className="flex max-w-xl">
                <input
                  type="text"
                  placeholder="Введите код"
                  className="border border-black rounded-l-[8px] px-4 py-2 w-full focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-r-[8px] font-medium hover:bg-gray-800 transition-colors"
                >
                  →
                </button>
              </form>
            </div>
          </div>
          <div className="md:col-span-6 flex flex-col md:flex-row gap-6 justify-left lg:w-[30%]">
            <AppButton
              onClick={() => navigate("/")}
              variant="secondary"
              className="px-2 py-3 text-lg"
            >
              Перейти в каталог <span>→</span>
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
}
