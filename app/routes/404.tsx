import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";

const RENDER_FIELD_GRAPHIC = false;

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 mt-30 px-4 py-16 flex flex-col items-center justify-center">
      {/* Большой номер 404 */}
      <div className="text-center mb-8">
        <h1 className="text-[120px] md:text-[180px] font-bold text-[#F9B234] leading-none">
          404
        </h1>

        {/* Красная карточка как символ нарушения */}
        <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-md transform -rotate-12 shadow-lg mb-4">
          <span className="font-bold text-lg">{t("404.card_text")}</span>
        </div>
      </div>

      {/* Основной заголовок */}
      <div className="text-center mb-8 max-w-2xl">
        <p className="text-xl text-gray-600 mb-6">{t("404.subtitle")}</p>

        <p className="text-base text-gray-500 leading-relaxed">
          {t("404.description")}
        </p>
      </div>

      {/* Футбольное поле как декорация */}
      {RENDER_FIELD_GRAPHIC && (
        <div className="mb-8">
          <div className="relative w-64 h-40 bg-green-500 rounded-lg shadow-lg overflow-hidden">
            {/* Линии поля */}
            <div className="absolute inset-0">
              {/* Центральная линия */}
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white transform -translate-x-0.5"></div>
              {/* Центральный круг */}
              <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              {/* Штрафные площади */}
              <div className="absolute top-4 left-0 w-8 h-24 border-2 border-white border-l-0"></div>
              <div className="absolute top-4 right-0 w-8 h-24 border-2 border-white border-r-0"></div>
            </div>

            {/* Мячик */}
            <div className="absolute top-12 left-20 w-4 h-4 bg-white rounded-full shadow"></div>

            {/* Игрок в оффсайде */}
            <div className="absolute top-16 right-12 w-3 h-6 bg-red-500 rounded-full shadow">
              <div className="absolute -top-1 left-1/2 w-1 h-1 bg-red-700 rounded-full transform -translate-x-1/2"></div>
            </div>

            {/* Другие игроки */}
            <div className="absolute top-20 left-32 w-3 h-6 bg-blue-500 rounded-full shadow">
              <div className="absolute -top-1 left-1/2 w-1 h-1 bg-blue-700 rounded-full transform -translate-x-1/2"></div>
            </div>
          </div>

          {/* Подпись к полю */}
          <p className="text-sm text-gray-400 text-center mt-2">
            {t("404.field_legend")}
          </p>
        </div>
      )}

      {/* Кнопка возврата */}
      <div className="w-full max-w-xs">
        <Link to="/">
          <AppButton variant="primary" size="lg">
            {t("404.back_to_home")}
          </AppButton>
        </Link>
      </div>
    </div>
  );
}
