import React from "react";
import type { BaseDialogProps } from "~/components/Dialogs/adminModals/DialogBase";
import { ConfirmDialog } from "~/components/Dialogs/adminModals/ConfirmDialog";
import {useDeleteItemType, useDeleteSport} from "~/queries/admin";
import { useNotifications } from "~/hooks/useNotifications";
import { useTranslation } from "react-i18next";

interface Props extends BaseDialogProps {
  sportId: string;
}

export const ConfirmDeleteSportDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  sportId
}) => {
  const { t } = useTranslation();

  const { showSuccess, showError } = useNotifications()
  const deleteSportMutation = useDeleteSport();

  // Обработчик отправки формы
  const handleDelete = async (sportId: string) => {
    try {
      await deleteSportMutation.mutateAsync({ sportId });
      onClose();
      showSuccess(t("admin.sports.delete_dialog.delete_success"));
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <ConfirmDialog
      titleTranslationKey="admin.sports.delete_dialog.title"
      supportTextTranslationKey="admin.sports.delete_dialog.text"
      yesButtonTranslationKey="common.delete"
      yesButtonPendingTranslationKey="common.deleting"
      isConfirming={deleteSportMutation.isPending}
      onConfirm={() => handleDelete(sportId)}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}