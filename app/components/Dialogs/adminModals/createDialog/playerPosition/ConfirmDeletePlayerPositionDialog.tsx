import React from "react";
import type { BaseDialogProps } from "~/components/Dialogs/adminModals/DialogBase";
import { ConfirmDialog } from "~/components/Dialogs/adminModals/ConfirmDialog";
import {useDeleteItemType, useDeletePlayerPosition} from "~/queries/admin";
import { useNotifications } from "~/hooks/useNotifications";
import { useTranslation } from "react-i18next";

interface Props extends BaseDialogProps {
  playerPositionId: string;
}

export const ConfirmDeletePlayerPositionDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  playerPositionId
}) => {
  const { t } = useTranslation();

  const { showSuccess, showError } = useNotifications()
  const deletePlayerPositionMutation = useDeletePlayerPosition();

  // Обработчик отправки формы
  const handleDelete = async (playerPositionId: string) => {
    try {
      await deletePlayerPositionMutation.mutateAsync({ playerPositionId });
      onClose();
      showSuccess(t("admin.player_positions.delete_dialog.delete_success"));
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <ConfirmDialog
      titleTranslationKey="admin.player_positions.delete_dialog.title"
      supportTextTranslationKey="admin.player_positions.delete_dialog.text"
      yesButtonTranslationKey="common.delete"
      yesButtonPendingTranslationKey="common.deleting"
      isConfirming={deletePlayerPositionMutation.isPending}
      onConfirm={() => handleDelete(playerPositionId)}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}