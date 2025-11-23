import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import CarouselPaginationBtns from "~/shared/buttons/CarouselPaginationBtns";

interface ImageViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  images: { id: number; image: string }[];
  currentIndex: number;
  onImageChange: (index: number) => void;
}

const ImageViewerDialog: React.FC<ImageViewerDialogProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onImageChange,
}) => {
  const { t } = useTranslation();

  const handlePrevious = useCallback(() => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onImageChange(prevIndex);
  }, [currentIndex, images.length, onImageChange]);

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onImageChange(nextIndex);
  }, [currentIndex, images.length, onImageChange]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrevious, handleNext]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90">
      {/* Backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        aria-label={t("common.close")}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        aria-label={t("common.close")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-white"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Image container */}
      <div className="relative flex items-center justify-center">
        <img
          src={currentImage?.image}
          alt={`${t("common.image")} ${currentIndex + 1}`}
          className="max-w-[90vw] max-h-[95vh] object-contain"
        />
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <CarouselPaginationBtns
          scrollPrev={handlePrevious}
          scrollNext={handleNext}
          containerStyles="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-2.75"
          btnBg="bg-[#474747] hover:bg-[#474747]"
          iconColor="white"
        />
      )}
    </div>,
    document.body
  );
};

export default ImageViewerDialog; 
