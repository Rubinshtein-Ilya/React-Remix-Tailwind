import React from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import { type BaseDialogProps, DialogBase } from "~/components/Dialogs/adminModals/DialogBase";


interface ConfirmDialogProps extends BaseDialogProps {
  titleTranslationKey: string;
  supportTextTranslationKey?: string;
  yesButtonTranslationKey: string;
  yesButtonPendingTranslationKey: string;
  isConfirming: boolean;
  onConfirm: () => void;
  children?: React.ReactNode | React.ReactNode[];
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  titleTranslationKey,
  supportTextTranslationKey,
  yesButtonTranslationKey,
  yesButtonPendingTranslationKey,
  isConfirming,
  onConfirm,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <DialogBase isOpen={isOpen} onClose={onClose} isLoading={isConfirming}>
      <div className="p-6">
        <h2
          className="text-2xl font-bold text-center mb-6"
          style={{ color: "#121212" }}
        >
          {t(titleTranslationKey)}
        </h2>

        {supportTextTranslationKey && (
          <p className="text-gray-600 mt-2">{t(supportTextTranslationKey)}</p>
        )}

        {children}

        {/* Кнопки */}
        <div className="flex gap-3 pt-4">
          <AppButton
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isConfirming}
            className="flex-1"
          >
            {t("common.cancel")}
          </AppButton>
          <AppButton
            type="button"
            onClick={onConfirm}
            variant="primary"
            disabled={isConfirming}
            className="flex-1"
          >
            {isConfirming
              ? t(yesButtonPendingTranslationKey)
              : t(yesButtonTranslationKey)}
          </AppButton>
        </div>
      </div>
    </DialogBase>
  );
};
