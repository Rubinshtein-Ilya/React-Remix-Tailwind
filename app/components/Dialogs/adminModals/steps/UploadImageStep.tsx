import React, { type FC, useMemo, useState } from "react";
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

export interface ImageDataProps {
  thumbnail: File | undefined;
  images: Array<File>;
}

type Props = {
  defaultValues: ImageDataProps;
  next: (fields: ImageDataProps) => void;
  back: () => void;
  withThumbnail?: boolean;
}

export const UploadImageStep: FC<Props> = ({ defaultValues, next, back, withThumbnail }) => {
  const { t } = useTranslation();

  const [thumbnail, setThumbnail] = useState<File | undefined>(defaultValues.thumbnail);
  const [images, setImages] = useState<File[]>(defaultValues.images);

  const error = useMemo(() => {
    const error = images.length < 1
      ? "admin.images_selector.errors.atLeast1ImageRequired"
      : withThumbnail && thumbnail === undefined
        ? "admin.images_selector.errors.thumbnailRequired"
        : undefined;

    return error;
  }, [images, thumbnail]);

  return (
    <React.Fragment>
      <div className={images.length ? "pb-4" : ""}>
        <ImagesSelectButton
          setImages={(imgs: File[]) => {
            setImages(prev => [...prev, ...imgs]);
          }}
          loaded={images.length}
          allowedExtensions={["jpg", "jpeg", "png", "svg"]}
          disabled={images.length >= MAX_IMAGES}
          maxAmount={MAX_IMAGES}
        />
      </div>

      {withThumbnail && thumbnail ? (
        <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors mb-4" >
          <img
            src={URL.createObjectURL(thumbnail)}
            className="w-13 h-13 object-cover player-image"
            loading="lazy"
          />
          <div>
            <div className="font-medium">
              {t("admin.images_selector.thumbnail_example_text")}
            </div>
          </div>
        </div>
      ): null}

      <div className="w-full h-full max-h-[50vh] overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col items-center justify-center gap-4">
          {images.length > 0 &&
            images.map((image, i) => (
              <div key={`add-img-${i}`} className="flex justify-center w-full">
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
                    src={URL.createObjectURL(image)}
                    alt={`add-img-${i}`}
                    className="w-full h-full object-contain"
                  />

                  {/* Кнопки действий поверх изображения */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {withThumbnail && (
                      <button
                        className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
                        onClick={() => setThumbnail(images[i])}
                        title={t("admin.images_selector.select_as_thumbnail")}
                        disabled={thumbnail === images[i]}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}

                    <button
                      className="w-8 h-8 rounded-full bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center transition-colors shadow-lg opacity-50 cursor-not-allowed"
                      title={t("admin.images_selector.edit_image")}
                      disabled
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
                      onClick={() => {
                        setImages(prev => prev.filter((image, index) => index !== i));
                      }}
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

      {error && <p className="text-red-500 text-sm mt-2">{t(error)}</p>}

      {/* Кнопки */}
      <div className="flex gap-3 mt-6">
        <AppButton
          type="button"
          onClick={back}
          variant="ghost"
          className="flex-1"
        >
          {t("common.back")}
        </AppButton>

        <AppButton
          type="button"
          onClick={() => {
            next({
              thumbnail,
              images,
            });
          }}
          disabled={error !== undefined}
          variant="primary"
          className="flex-1"
        >
          {t("common.next")}
        </AppButton>
      </div>
    </React.Fragment>
  );
}
