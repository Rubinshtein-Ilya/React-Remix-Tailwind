import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";

export default function Packaging() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 mt-30 px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#121212] mb-6">
            {t("pages.packaging.title")}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t("pages.packaging.subtitle")}
          </p>
          <div className="w-24 h-1 bg-[#F9B234] mx-auto rounded"></div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {t("pages.packaging.description")}
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-[#121212] mb-4">📦 Защитная упаковка</h3>
              <ul className="space-y-3 text-gray-700">
                <li>• Воздушно-пузырчатая пленка</li>
                <li>• Пенопластовые вставки</li>
                <li>• Влагозащитные материалы</li>
                <li>• Жесткие картонные коробки</li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-[#121212] mb-4">✨ Премиум упаковка</h3>
              <ul className="space-y-3 text-gray-700">
                <li>• Фирменные коробки Fan's Dream</li>
                <li>• Атласная подкладка</li>
                <li>• Голографические пломбы</li>
                <li>• Сертификат подлинности</li>
              </ul>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-[#121212] mb-6 text-center">Процесс упаковки</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-[#F9B234] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <p className="text-gray-700">Осмотр товара на предмет целостности</p>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-[#F9B234] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <p className="text-gray-700">Обертывание в архивную бумагу</p>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-[#F9B234] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <p className="text-gray-700">Размещение в защитном боксе</p>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-[#F9B234] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <p className="text-gray-700">Финальная упаковка и опечатывание</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-[#121212] mb-4">🛡️ Гарантии</h3>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <strong>Страхование:</strong> Полное покрытие стоимости
              </div>
              <div>
                <strong>Отслеживание:</strong> 24/7 мониторинг доставки
              </div>
              <div>
                <strong>Возврат:</strong> Гарантия возврата при повреждении
              </div>
              <div>
                <strong>Поддержка:</strong> Помощь на всех этапах доставки
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/">
              <AppButton variant="primary" size="lg">
                Посмотреть товары
              </AppButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 