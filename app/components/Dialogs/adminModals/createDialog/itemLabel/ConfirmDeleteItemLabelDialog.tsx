import React from "react";
import type { BaseDialogProps } from "~/components/Dialogs/adminModals/DialogBase";
import { ConfirmDialog } from "~/components/Dialogs/adminModals/ConfirmDialog";
import { useDeleteItemLabel } from "~/queries/admin";
import { useNotifications } from "~/hooks/useNotifications";
import { useTranslation } from "react-i18next";

interface Props extends BaseDialogProps {
  labelId: string;
}

export const ConfirmDeleteItemLabelDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  labelId
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const deleteItemLabelMutation = useDeleteItemLabel();

  const handleDelete = async (labelId: string) => {
    try {
      await deleteItemLabelMutation.mutateAsync({ labelId });
      onClose();
      showSuccess(t("admin.itemLabels.delete_dialog.delete_success"));
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <ConfirmDialog
      titleTranslationKey="admin.itemLabels.delete_dialog.title"
      supportTextTranslationKey="admin.itemLabels.delete_dialog.text"
      yesButtonTranslationKey="common.delete"
      yesButtonPendingTranslationKey="common.deleting"
      isConfirming={deleteItemLabelMutation.isPending}
      onConfirm={() => handleDelete(labelId)}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
} 