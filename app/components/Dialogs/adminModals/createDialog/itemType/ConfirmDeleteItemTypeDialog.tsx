import React from "react";
import type { BaseDialogProps } from "~/components/Dialogs/adminModals/DialogBase";
import { ConfirmDialog } from "~/components/Dialogs/adminModals/ConfirmDialog";
import { useDeleteItemType } from "~/queries/admin";
import { useNotifications } from "~/hooks/useNotifications";
import { useTranslation } from "react-i18next";

interface Props extends BaseDialogProps {
  itemTypeId: string;
}

export const ConfirmDeleteItemTypeDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  itemTypeId
}) => {
  const { t } = useTranslation();

  const { showSuccess, showError } = useNotifications()
  const deleteItemTypeMutation = useDeleteItemType();

  // Обработчик отправки формы
  const handleDelete = async (itemTypeId: string) => {
    try {
      await deleteItemTypeMutation.mutateAsync({ itemTypeId });
      onClose();
      showSuccess(t("admin.item_types.delete_dialog.delete_success"));
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <ConfirmDialog
      titleTranslationKey="admin.item_types.delete_dialog.title"
      supportTextTranslationKey="admin.item_types.delete_dialog.text"
      yesButtonTranslationKey="common.delete"
      yesButtonPendingTranslationKey="common.deleting"
      isConfirming={deleteItemTypeMutation.isPending}
      onConfirm={() => handleDelete(itemTypeId)}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}