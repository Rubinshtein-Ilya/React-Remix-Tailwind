import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";

export default function FramingAcrylic() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 mt-30 px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#121212] mb-6">
            {t("pages.framing_acrylic.title")}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t("pages.framing_acrylic.subtitle")}
          </p>
          <div className="w-24 h-1 bg-[#F9B234] mx-auto rounded"></div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {t("pages.framing_acrylic.description")}
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-xl font-semibold text-[#121212] mb-3">Кристальная чистота</h3>
              <p className="text-gray-700">Прозрачность выше стекла, безупречная видимость</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-[#121212] mb-3">Прочность</h3>
              <p className="text-gray-700">В 17 раз прочнее стекла, устойчив к ударам</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-[#121212] mb-3">Современность</h3>
              <p className="text-gray-700">Стильное решение для современных интерьеров</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-[#121212] mb-6 text-center">🔬 Типы акрилового обрамления</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-[#121212] mb-2">Классический акрил</h4>
                  <p className="text-gray-700 text-sm">Прозрачные панели без тонировки</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-[#121212] mb-2">Anti-Glare</h4>
                  <p className="text-gray-700 text-sm">Матовое покрытие против бликов</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-[#121212] mb-2">UV-защита</h4>
                  <p className="text-gray-700 text-sm">Фильтрация ультрафиолетовых лучей</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-[#121212] mb-2">Магнитное крепление</h4>
                  <p className="text-gray-700 text-sm">Легкая смена экспонатов</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-[#121212] mb-2">LED подсветка</h4>
                  <p className="text-gray-700 text-sm">Встроенная светодиодная подсветка</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-[#121212] mb-2">Музейное качество</h4>
                  <p className="text-gray-700 text-sm">Архивные материалы для ценных предметов</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-[#121212] mb-4 text-center">⚙️ Преимущества акрила</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Не разбивается на осколки</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Легче стекла в 2 раза</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Не желтеет со временем</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Легко чистится</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Антистатические свойства</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Температурная стойкость</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-[#121212] mb-4 text-center">📐 Процесс изготовления</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">1</span>
                </div>
                <p className="text-sm">Консультация</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">2</span>
                </div>
                <p className="text-sm">Лазерная резка</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">3</span>
                </div>
                <p className="text-sm">Сборка</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">4</span>
                </div>
                <p className="text-sm">Контроль качества</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-[#121212]">Срок изготовления: 5-10 дней</h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/framing">
                <AppButton variant="primary" size="lg">
                  Заказать акриловое обрамление
                </AppButton>
              </Link>
              <Link to="/framing-baguette">
                <AppButton variant="secondary" size="lg">
                  Обрамление в багет
                </AppButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 