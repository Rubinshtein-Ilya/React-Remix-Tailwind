import React from "react";
import type { BaseDialogProps } from "~/components/Dialogs/adminModals/DialogBase";
import { ConfirmDialog } from "~/components/Dialogs/adminModals/ConfirmDialog";
import { useDeletePlayer } from "~/queries/admin";
import { useNotifications } from "~/hooks/useNotifications";
import { useTranslation } from "react-i18next";

interface Props extends BaseDialogProps {
  playerId: string;
}

export const ConfirmDeletePlayerDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  playerId
}) => {
  const { t } = useTranslation();

  const { showSuccess, showError } = useNotifications()
  const deletePlayerMutation = useDeletePlayer();

  // Обработчик отправки формы
  const handleDelete = async (playerId: string) => {
    try {
      await deletePlayerMutation.mutateAsync({ playerId });
      onClose();
      showSuccess(t("admin.players.delete_dialog.delete_success"));
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <ConfirmDialog
      titleTranslationKey="admin.players.delete_dialog.title"
      supportTextTranslationKey="admin.players.delete_dialog.text"
      yesButtonTranslationKey="common.delete"
      yesButtonPendingTranslationKey="common.deleting"
      isConfirming={deletePlayerMutation.isPending}
      onConfirm={() => handleDelete(playerId)}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}