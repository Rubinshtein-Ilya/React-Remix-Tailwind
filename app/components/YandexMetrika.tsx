import { useEffect } from 'react';
import type { YandexMetrikaConfig } from '~/types/yandex-metrika';

interface YandexMetrikaProps {
  counterId: number;
  config?: Partial<YandexMetrikaConfig>;
}

export function YandexMetrika({ counterId, config }: YandexMetrikaProps) {
  useEffect(() => {
    // Проверяем, что код еще не загружен
    if (typeof window !== 'undefined' && typeof window.ym !== 'undefined') {
      return;
    }

    // Создаем функцию ym если ее еще нет
    if (typeof window !== 'undefined') {
      window.ym = window.ym || function (...args: any[]) {
        ((window.ym as any).a = (window.ym as any).a || []).push(args);
      };
      (window.ym as any).l = Date.now();

      // Создаем и вставляем скрипт
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://mc.yandex.ru/metrika/tag.js';
      
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      }

      // Инициализируем метрику с пользовательской или стандартной конфигурацией
      const initConfig = {
        counterId,
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
        ...config
      };

      window.ym(counterId, 'init', initConfig);
    }
  }, [counterId, config]);

  return (
    <>
      {/* Noscript версия для случаев, когда JS отключен */}
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${counterId}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
} 