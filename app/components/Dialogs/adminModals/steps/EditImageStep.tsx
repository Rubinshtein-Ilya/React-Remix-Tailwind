import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import { ImagesSelectButton } from "~/shared/buttons/ImagesSelectButton";

const MAX_IMAGES = 5;

function swapArrayElements<T>(arr: T[], index1: number, index2: number): T[] {
  if (
    index1 < 0 || index1 >= arr.length ||
    index2 < 0 || index2 >= arr.length
  ) {
    throw new Error("Index out of bounds");
  }

  const newArr = [...arr];
  [newArr[index1], newArr[index2]] = [newArr[index2], newArr[index1]];
  return newArr;
}

export interface EditImageStepProps {
  initialImages: string[]; // ссылки на уже загруженные изображения
  initialThumbnail?: string;
  onChange: (data: { images: (string | File)[]; thumbnail: string | File }) => void;
  onBack: () => void;
}

export const EditImageStep: React.FC<EditImageStepProps> = ({ 
  initialImages, 
  initialThumbnail, 
  onChange, 
  onBack 
}) => {
  const { t } = useTranslation();
  
  // Инициализируем состояние с текущими изображениями
  const [images, setImages] = useState<(string | File)[]>(initialImages);
  const [thumbnail, setThumbnail] = useState<string | File | undefined>(
    initialThumbnail
  );

  // Добавление новых файлов
  const handleAddImages = (files: File[]) => {
    console.log('Adding new images:', files.map(f => f.name));
    setImages(prev => {
      const newImages = [...prev, ...files];
      console.log('Updated images array:', newImages.length, 'total images');
      return newImages;
    });
  };

  // Удаление изображения
  const handleDelete = (idx: number) => {
    const deletedImage = images[idx];
    setImages(prev => prev.filter((_, i) => i !== idx));
    
    // Если удаляем thumbnail, выбираем первый доступный
    if (thumbnail === deletedImage) {
      const remainingImages = images.filter((_, i) => i !== idx);
      setThumbnail(remainingImages[0] || undefined);
    }
  };

  // Сохранить изменения
  const handleSave = () => {
    if (!thumbnail || images.length === 0) return;
    
    console.log('Saving image changes:', {
      totalImages: images.length,
      newFiles: images.filter(img => img instanceof File).length,
      existingFiles: images.filter(img => typeof img === 'string').length,
      thumbnail: thumbnail instanceof File ? thumbnail.name : thumbnail
    });
    
    onChange({ images, thumbnail });
  };

  // Проверяем ошибки
  const error = useMemo(() => {
    if (images.length < 1) {
      return "admin.images_selector.errors.atLeast1ImageRequired";
    }
    if (!thumbnail) {
      return "admin.images_selector.errors.thumbnailRequired";
    }
    return undefined;
  }, [images.length, thumbnail]);

  return (
    <div className="space-y-6">
      {/* Кнопка добавления */}
      <div className={images.length ? "pb-4" : ""}>
        <ImagesSelectButton
          setImages={handleAddImages}
          loaded={images.length}
          allowedExtensions={["jpg", "jpeg", "png", "svg"]}
          disabled={images.length >= MAX_IMAGES}
          maxAmount={MAX_IMAGES}
        />
      </div>

      {/* Показываем thumbnail если выбран */}
      {thumbnail && (
        <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors mb-4">
          <img
            src={typeof thumbnail === 'string' ? thumbnail : URL.createObjectURL(thumbnail)}
            className="w-13 h-13 object-cover rounded"
            loading="lazy"
          />
          <div>
            <div className="font-medium">
              {t("admin.images_selector.thumbnail_example_text")}
            </div>
          </div>
        </div>
      )}

      {/* Список изображений */}
      <div className="w-full h-full max-h-[50vh] overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col items-center justify-center gap-4">
          {images.length > 0 &&
            images.map((image, i) => (
              <div key={`edit-img-${i}`} className="flex justify-center w-full">
                {/* Номер изображения */}
                <div className="flex flex-col items-center mr-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t('admin.images_selector.image_number', { number: i + 1 })}
                  </div>
                </div>
                
                <div
                  className="w-[252px] h-[252px] rounded-lg bg-[var(--bg-gray)] overflow-hidden shrink-0 border-2 border-gray-300 relative group"
                >
                  <img
                    src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                    alt={`edit-img-${i}`}
                    className="w-full h-full object-contain"
                  />

                  {/* Кнопки действий поверх изображения */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
                      onClick={() => setThumbnail(image)}
                      title={t("admin.images_selector.select_as_thumbnail")}
                      disabled={thumbnail === image}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>

                    <button
                      className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
                      disabled={i === 0}
                      onClick={() => {
                        setImages(prev => swapArrayElements(prev, i, i - 1));
                      }}
                      title={i === 0 ? t("admin.images_selector.cannot_move_up") : t("admin.images_selector.move_up")}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>

                    <button
                      className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
                      disabled={i === images.length - 1}
                      onClick={() => {
                        setImages(prev => swapArrayElements(prev, i, i + 1));
                      }}
                      title={i === images.length - 1 ? t("admin.images_selector.cannot_move_down") : t("admin.images_selector.move_down")}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <button
                      className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-lg"
                      onClick={() => handleDelete(i)}
                      title={t("admin.images_selector.delete_image")}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Показываем ошибку если есть */}
      {error && <p className="text-red-500 text-sm mt-2">{t(error)}</p>}

      {/* Пустое состояние */}
      {images.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl text-gray-400">📷</span>
          </div>
          <p className="text-gray-500 mb-4">{t("admin.images_selector.no_images")}</p>
          <p className="text-sm text-gray-400">{t("admin.images_selector.add_images_hint")}</p>
        </div>
      )}

      {/* Кнопки навигации */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <AppButton 
          type="button" 
          onClick={onBack} 
          variant="ghost" 
          className="flex-1"
        >
          {t("common.back")}
        </AppButton>
        <AppButton 
          type="button" 
          onClick={handleSave} 
          variant="primary" 
          className="flex-1" 
          disabled={error !== undefined}
        >
          {t("common.next")}
        </AppButton>
      </div>
    </div>
  );
}; 