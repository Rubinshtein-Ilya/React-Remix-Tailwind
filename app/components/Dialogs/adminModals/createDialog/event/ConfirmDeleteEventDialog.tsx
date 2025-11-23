import React from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import { DialogBase } from "../../DialogBase";
import { useDeleteEvent } from "~/queries/admin";

interface ConfirmDeleteEventDialogProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ConfirmDeleteEventDialog: React.FC<ConfirmDeleteEventDialogProps> = ({
  eventId,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const deleteEventMutation = useDeleteEvent();

  const handleDelete = () => {
    if (!eventId) return;

    deleteEventMutation.mutate(eventId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <DialogBase
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("admin.events.delete_dialog.title")}
        </h2>
        
        <p className="text-gray-600">
          {t("admin.events.delete_dialog.text")}
        </p>

        <div className="flex justify-end gap-3">
          <AppButton variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handleDelete}
            disabled={deleteEventMutation.isPending}
            className="!bg-red-600 hover:!bg-red-700"
          >
            {deleteEventMutation.isPending
              ? t("common.deleting")
              : t("common.delete")}
          </AppButton>
        </div>
      </div>
    </DialogBase>
  );
}; 
