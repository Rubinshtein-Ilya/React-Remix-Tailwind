import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Input } from "~/shared/inputs/Input";
import { AppButton } from "~/shared/buttons/AppButton";
import { useUpdateItemLabel } from "~/queries/admin";
import {
  type BaseDialogProps,
  DialogBase,
} from "~/components/Dialogs/adminModals/DialogBase";
import type { ItemLabel } from "~/types/itemLabel";

const editItemLabelSchema = z.object({
  name: z.object({
    ru: z.string().min(2, "Название (ru) должно содержать хотя бы 2 буквы"),
    en: z.string().min(2, "Название (en) должно содержать хотя бы 2 буквы"),
  }),
  description: z.object({
    ru: z.string().min(1, "Описание (ru) обязательно"),
    en: z.string().min(1, "Описание (en) обязательно"),
  }),
});

type EditItemLabelFormData = z.infer<typeof editItemLabelSchema>;

interface EditItemLabelDialogProps extends BaseDialogProps {
  itemLabel: ItemLabel | null;
  onSuccess: () => void;
}

export const EditItemLabelDialog: React.FC<EditItemLabelDialogProps> = ({
  isOpen,
  onClose,
  itemLabel,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const updateItemLabelMutation = useUpdateItemLabel();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<EditItemLabelFormData>({
    resolver: zodResolver(editItemLabelSchema),
    mode: "onChange",
    defaultValues: {
      name: { ru: "", en: "" },
      description: { ru: "", en: "" },
    },
  });

  // Заполняем форму данными при открытии диалога
  useEffect(() => {
    if (itemLabel && isOpen) {
      setValue("name.ru", itemLabel.name.ru);
      setValue("name.en", itemLabel.name.en);
      setValue("description.ru", itemLabel.description.ru);
      setValue("description.en", itemLabel.description.en);
    }
  }, [itemLabel, isOpen, setValue]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = async (data: EditItemLabelFormData) => {
    if (!itemLabel) return;
    
    try {
      await updateItemLabelMutation.mutateAsync({
        labelId: itemLabel._id,
        fields: data,
      });
      onSuccess();
      reset();
    } catch (error) {}
  };

  if (!itemLabel) return null;

  return (
    <DialogBase
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={updateItemLabelMutation.isPending}
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6" style={{ color: "#121212" }}>
          {t("admin.itemLabels.edit_dialog.title")}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register("name.ru")}
            label={`${t("admin.itemLabels.edit_dialog.name_ru")} *`}
            placeholder={t("admin.itemLabels.edit_dialog.name_ru_placeholder")}
            error={errors.name?.ru?.message}
            maxLength={20}
          />
          <Input
            {...register("name.en")}
            label={`${t("admin.itemLabels.edit_dialog.name_en")} *`}
            placeholder={t("admin.itemLabels.edit_dialog.name_en_placeholder")}
            error={errors.name?.en?.message}
            maxLength={20}
          />
          <Input
            {...register("description.ru")}
            label={`${t("admin.itemLabels.edit_dialog.description_ru")} *`}
            placeholder={t("admin.itemLabels.edit_dialog.description_ru_placeholder")}
            error={errors.description?.ru?.message}
            maxLength={200}
          />
          <Input
            {...register("description.en")}
            label={`${t("admin.itemLabels.edit_dialog.description_en")} *`}
            placeholder={t("admin.itemLabels.edit_dialog.description_en_placeholder")}
            error={errors.description?.en?.message}
            maxLength={200}
          />
          <div className="flex gap-3 pt-4">
            <AppButton
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={updateItemLabelMutation.isPending}
              className="flex-1"
            >
              {t("common.cancel")}
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              disabled={!isValid || updateItemLabelMutation.isPending}
              className="flex-1"
            >
              {updateItemLabelMutation.isPending
                ? t("common.updating")
                : t("common.update")}
            </AppButton>
          </div>
        </form>
      </div>
    </DialogBase>
  );
}; 