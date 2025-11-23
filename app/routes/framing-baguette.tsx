import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";

export default function FramingBaguette() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 mt-30 px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#121212] mb-6">
            {t("pages.framing_baguette.title")}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t("pages.framing_baguette.subtitle")}
          </p>
          <div className="w-24 h-1 bg-[#F9B234] mx-auto rounded"></div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {t("pages.framing_baguette.description")}
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-amber-50 p-6 rounded-lg text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-[#121212] mb-3">Классический стиль</h3>
              <p className="text-gray-700">Элегантный внешний вид для любого интерьера</p>
            </div>

            <div className="bg-brown-50 p-6 rounded-lg text-center">
              <div className="text-5xl mb-4">🌳</div>
              <h3 className="text-xl font-semibold text-[#121212] mb-3">Натуральные материалы</h3>
              <p className="text-gray-700">Качественная древесина и экологичные покрытия</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-[#121212] mb-3">Надежная защита</h3>
              <p className="text-gray-700">Долговечность и защита от внешних воздействий</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-[#121212] mb-6 text-center">🎭 Виды багетов</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-[#121212] mb-2">Классический багет</h4>
                  <p className="text-gray-700 text-sm">Традиционные профили с резными элементами</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-[#121212] mb-2">Минималистичный</h4>
                  <p className="text-gray-700 text-sm">Простые линии для современного интерьера</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-[#121212] mb-2">Антикварный</h4>
                  <p className="text-gray-700 text-sm">Состаренные рамы с патиной</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-[#121212] mb-2">Спортивный</h4>
                  <p className="text-gray-700 text-sm">Специально для спортивной атрибутики</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-[#121212] mb-2">Премиум</h4>
                  <p className="text-gray-700 text-sm">Эксклюзивные материалы и отделка</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-[#121212] mb-2">Индивидуальный</h4>
                  <p className="text-gray-700 text-sm">Изготовление под ваши требования</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-[#121212] mb-4 text-center">📋 Процесс изготовления</h3>
            <div className="grid md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">1</span>
                </div>
                <p className="text-sm">Выбор багета</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">2</span>
                </div>
                <p className="text-sm">Замеры</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">3</span>
                </div>
                <p className="text-sm">Изготовление</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">4</span>
                </div>
                <p className="text-sm">Монтаж</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">5</span>
                </div>
                <p className="text-sm">Доставка</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-[#121212]">Срок изготовления: 7-14 дней</h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/framing">
                <AppButton variant="primary" size="lg">
                  Заказать обрамление
                </AppButton>
              </Link>
              <Link to="/framing-acrylic">
                <AppButton variant="secondary" size="lg">
                  Акриловое обрамление
                </AppButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 