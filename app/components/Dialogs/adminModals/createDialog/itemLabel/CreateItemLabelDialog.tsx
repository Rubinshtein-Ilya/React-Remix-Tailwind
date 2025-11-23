import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Input } from "~/shared/inputs/Input";
import { AppButton } from "~/shared/buttons/AppButton";
import { useAddItemLabel } from "~/queries/admin";
import {
  type BaseDialogProps,
  DialogBase,
} from "~/components/Dialogs/adminModals/DialogBase";

const createItemLabelSchema = z.object({
  _id: z.string().min(1, "Необходимо задать id"),
  name: z.object({
    ru: z.string().min(2, "Название (ru) должно содержать хотя бы 2 буквы"),
    en: z.string().min(2, "Название (en) должно содержать хотя бы 2 буквы"),
  }),
  description: z.object({
    ru: z.string().min(1, "Описание (ru) обязательно"),
    en: z.string().min(1, "Описание (en) обязательно"),
  }),
});

type CreateItemLabelFormData = z.infer<typeof createItemLabelSchema>;

interface CreateItemLabelDialogProps extends BaseDialogProps {
  onSuccess: () => void;
}

export const CreateItemLabelDialog: React.FC<CreateItemLabelDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const addItemLabelMutation = useAddItemLabel();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateItemLabelFormData>({
    resolver: zodResolver(createItemLabelSchema),
    mode: "onChange",
    defaultValues: {
      _id: "",
      name: { ru: "", en: "" },
      description: { ru: "", en: "" },
    },
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = async (data: CreateItemLabelFormData) => {
    try {
      await addItemLabelMutation.mutateAsync(data);
      onSuccess();
      reset();
    } catch (error) {}
  };

  return (
    <DialogBase
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={addItemLabelMutation.isPending}
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6" style={{ color: "#121212" }}>
          {t("admin.itemLabels.create_dialog.title")}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register("_id")}
            label={`${t("admin.itemLabels.create_dialog.id")} *`}
            placeholder="label_id"
            error={errors._id?.message}
            maxLength={20}
          />
          <Input
            {...register("name.ru")}
            label={`${t("admin.itemLabels.create_dialog.name_ru")} *`}
            placeholder={t("admin.itemLabels.create_dialog.name_ru_placeholder")}
            error={errors.name?.ru?.message}
            maxLength={20}
          />
          <Input
            {...register("name.en")}
            label={`${t("admin.itemLabels.create_dialog.name_en")} *`}
            placeholder={t("admin.itemLabels.create_dialog.name_en_placeholder")}
            error={errors.name?.en?.message}
            maxLength={20}
          />
          <Input
            {...register("description.ru")}
            label={`${t("admin.itemLabels.create_dialog.description_ru")} *`}
            placeholder={t("admin.itemLabels.create_dialog.description_ru_placeholder")}
            error={errors.description?.ru?.message}
            maxLength={200}
          />
          <Input
            {...register("description.en")}
            label={`${t("admin.itemLabels.create_dialog.description_en")} *`}
            placeholder={t("admin.itemLabels.create_dialog.description_en_placeholder")}
            error={errors.description?.en?.message}
            maxLength={200}
          />
          <div className="flex gap-3 pt-4">
            <AppButton
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={addItemLabelMutation.isPending}
              className="flex-1"
            >
              {t("common.cancel")}
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              disabled={!isValid || addItemLabelMutation.isPending}
              className="flex-1"
            >
              {addItemLabelMutation.isPending
                ? t("common.creating")
                : t("common.create")}
            </AppButton>
          </div>
        </form>
      </div>
    </DialogBase>
  );
}; 