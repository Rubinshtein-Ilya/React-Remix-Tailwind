import React from "react";
import type { BaseDialogProps } from "~/components/Dialogs/adminModals/DialogBase";
import { ConfirmDialog } from "~/components/Dialogs/adminModals/ConfirmDialog";
import { useDeleteItem } from "~/queries/admin";
import { useNotifications } from "~/hooks/useNotifications";
import { useTranslation } from "react-i18next";

interface Props extends BaseDialogProps {
  itemId: string;
}

export const ConfirmDeleteItemDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  itemId
}) => {
  const { t } = useTranslation();

  const { showSuccess, showError } = useNotifications()
  const deleteItemMutation = useDeleteItem();

  // Обработчик отправки формы
  const handleDelete = async (itemId: string) => {
    try {
      await deleteItemMutation.mutateAsync({ itemId });
      onClose();
      showSuccess(t("admin.items.delete_dialog.delete_success"));
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <ConfirmDialog
      titleTranslationKey="admin.items.delete_dialog.title"
      supportTextTranslationKey="admin.items.delete_dialog.text"
      yesButtonTranslationKey="common.delete"
      yesButtonPendingTranslationKey="common.deleting"
      isConfirming={deleteItemMutation.isPending}
      onConfirm={() => handleDelete(itemId)}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}