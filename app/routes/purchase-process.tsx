import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";

export default function PurchaseProcess() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 mt-30 px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#121212] mb-6">
            {t("pages.purchase_process.title")}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t("pages.purchase_process.subtitle")}
          </p>
          <div className="w-24 h-1 bg-[#F9B234] mx-auto rounded"></div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {t("pages.purchase_process.description")}
          </p>

          <div className="space-y-8">
            {/* Шаг 1 */}
            <div className="flex items-start gap-6 p-6 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">1</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-[#121212] mb-3">Выберите товар</h3>
                <p className="text-gray-700">Просмотрите наш каталог и найдите желаемый предмет. Изучите описание, фотографии и сертификаты подлинности.</p>
              </div>
            </div>

            {/* Шаг 2 */}
            <div className="flex items-start gap-6 p-6 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">2</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-[#121212] mb-3">Сделайте ставку</h3>
                <p className="text-gray-700">Участвуйте в аукционе, делая ставки. Следите за временем окончания аукциона и текущей ценой.</p>
              </div>
            </div>

            {/* Шаг 3 */}
            <div className="flex items-start gap-6 p-6 bg-yellow-50 rounded-lg">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">3</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-[#121212] mb-3">Оплатите покупку</h3>
                <p className="text-gray-700">После выигрыша аукциона оплатите товар удобным способом. Мы принимаем карты и электронные платежи.</p>
              </div>
            </div>

            {/* Шаг 4 */}
            <div className="flex items-start gap-6 p-6 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">4</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-[#121212] mb-3">Получите товар</h3>
                <p className="text-gray-700">Товар будет упакован и отправлен в течение 3-5 рабочих дней. Отслеживайте доставку по трек-номеру.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-[#121212] mb-4">💡 Полезные советы</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Изучите историю предмета и его происхождение</li>
              <li>• Обратите внимание на состояние товара</li>
              <li>• Учитывайте дополнительные расходы на доставку</li>
              <li>• Регистрируйтесь заранее для участия в аукционах</li>
            </ul>
          </div>

          <div className="text-center mt-8">
            <Link to="/">
              <AppButton variant="primary" size="lg">
                Начать покупки
              </AppButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 