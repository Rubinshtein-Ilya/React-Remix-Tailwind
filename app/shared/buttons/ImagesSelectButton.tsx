import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "svg"] as const;
type AllowedExtension = typeof ALLOWED_EXTENSIONS[number];

interface ImagesSelectButtonProps {
  disabled?: boolean;
  setImages: (images: File[]) => void;
  allowedExtensions: AllowedExtension[];
  maxAmount: number;
  loaded: number;
}

export const ImagesSelectButton: React.FC<ImagesSelectButtonProps> = ({
  disabled,
  setImages,
  allowedExtensions,
  maxAmount,
  loaded,
}) => {
  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click(); // trigger file input
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);
    console.log('Files selected:', filesArray.map(f => f.name));

    const filtered = filesArray.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      return ext && ALLOWED_EXTENSIONS.includes(ext as any);
    });

    console.log('Filtered files:', filtered.map(f => f.name));

    if (filtered.length < 1) {
      console.log('No valid files found');
      return;
    }

    if (filtered.length > maxAmount - loaded) {
      console.log('Too many files selected');
      return;
    }

    console.log('Setting images:', filtered.map(f => f.name));
    setImages(filtered);
  };

  return (
    <React.Fragment>
      <AppButton
        disabled={disabled || false}
        type="button"
        onClick={handleClick}
        variant="secondary"
      >
        {t("images.add_images", "Добавить фотографии")}{` ${loaded}/${maxAmount}`}
      </AppButton>
      <input
        ref={inputRef}
        type="file"
        accept={allowedExtensions.map(ext => `.${ext}`).join(",")}
        multiple={maxAmount !== 1}
        hidden
        onChange={handleFileChange}
      />
    </React.Fragment>
  );
};