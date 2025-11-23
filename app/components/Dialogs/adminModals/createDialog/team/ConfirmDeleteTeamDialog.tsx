import React from "react";
import type { BaseDialogProps } from "~/components/Dialogs/adminModals/DialogBase";
import { ConfirmDialog } from "~/components/Dialogs/adminModals/ConfirmDialog";
import {useDeletePlayer, useDeleteTeam} from "~/queries/admin";
import { useNotifications } from "~/hooks/useNotifications";
import { useTranslation } from "react-i18next";

interface Props extends BaseDialogProps {
  teamId: string;
}

export const ConfirmDeleteTeamDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  teamId
}) => {
  const { t } = useTranslation();

  const { showSuccess, showError } = useNotifications()
  const deleteTeamMutation = useDeleteTeam();

  // Обработчик отправки формы
  const handleDelete = async (teamId: string) => {
    try {
      await deleteTeamMutation.mutateAsync({ teamId });
      onClose();
      showSuccess(t("admin.teams.delete_dialog.delete_success"));
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <ConfirmDialog
      titleTranslationKey="admin.teams.delete_dialog.title"
      supportTextTranslationKey="admin.teams.delete_dialog.text"
      yesButtonTranslationKey="common.delete"
      yesButtonPendingTranslationKey="common.deleting"
      isConfirming={deleteTeamMutation.isPending}
      onConfirm={() => handleDelete(teamId)}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}