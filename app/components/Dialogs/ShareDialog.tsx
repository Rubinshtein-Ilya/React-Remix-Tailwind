import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  WhatsappShareButton,
  TelegramShareButton,
  VKShareButton,
  OKShareButton,
  ViberShareButton,
  WhatsappIcon,
  TelegramIcon,
  VKIcon,
  OKIcon,
  ViberIcon,
} from "react-share";
import { AppButton } from "~/shared/buttons/AppButton";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function ShareDialog({ isOpen, onClose, url, title }: ShareDialogProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  if (!isOpen && !isClosing) return null;

  return createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      {/* Фон */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,.5)] backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Модальное окно */}
      <div className={`relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-all duration-200 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#999999] hover:text-[#121212] transition-colors z-10"
          aria-label={t("share_dialog.close")}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Содержимое */}
        <div className="p-6">
          <h2
            className="text-2xl font-bold text-center mb-6"
            style={{ color: "#121212" }}
          >
            {t("share_dialog.title")}
          </h2>

          {/* Ссылка для копирования */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#121212] mb-2">
              {t("share_dialog.link")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-3 py-2 border border-[#DCDCDC] rounded-md bg-[#F9F9F9] text-sm text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#F9B234]"
              />
              <button
                onClick={handleCopyLink}
                className="w-10 h-10 flex items-center justify-center border border-[#DCDCDC] rounded-md hover:bg-[#F9F9F9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F9B234]"
                title={copied ? t("share_dialog.copied") : t("share_dialog.copy")}
              >
                {copied ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-[#121212]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Кнопки социальных сетей */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#121212] mb-4">
              {t("share_dialog.share_on_social")}
            </h3>
            
            <div className="flex justify-center gap-4 flex-wrap">
              {/* WhatsApp */}
              <WhatsappShareButton
                url={url}
                title={title}
                separator=" - "
              >
                <div className="p-2 hover:scale-110 transition-transform duration-200">
                  <WhatsappIcon size={40} round />
                </div>
              </WhatsappShareButton>

              {/* Telegram */}
              <TelegramShareButton
                url={url}
                title={title}
              >
                <div className="p-2 hover:scale-110 transition-transform duration-200">
                  <TelegramIcon size={40} round />
                </div>
              </TelegramShareButton>

              {/* VK */}
              <VKShareButton
                url={url}
                title={title}
              >
                <div className="p-2 hover:scale-110 transition-transform duration-200">
                  <VKIcon size={40} round />
                </div>
              </VKShareButton>

              {/* Odnoklassniki */}
              <OKShareButton
                url={url}
                title={title}
              >
                <div className="p-2 hover:scale-110 transition-transform duration-200">
                  <OKIcon size={40} round />
                </div>
              </OKShareButton>

              {/* Viber */}
              <ViberShareButton
                url={url}
                title={title}
                separator=" - "
              >
                <div className="p-2 hover:scale-110 transition-transform duration-200">
                  <ViberIcon size={40} round />
                </div>
              </ViberShareButton>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
} 