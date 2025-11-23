import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Input } from "~/shared/inputs/Input";
import { AppButton } from "~/shared/buttons/AppButton";
import { useAddSport } from "~/queries/admin";
import {
  type BaseDialogProps,
  DialogBase,
} from "~/components/Dialogs/adminModals/DialogBase";

// Схема валидации для создания промокода
const createSportSchema = z.object({
  _id: z.string().min(1, "Необходимо задать id"),
  name: z.string().min(2, "Название должно содержать хотя бы 2 буквы"),
  description: z.string().optional(),
});

type CreateSportFormData = z.infer<typeof createSportSchema>;

interface CreateSportDialogProps extends BaseDialogProps {
  onSuccess: () => void;
}

export const CreateSportDialog: React.FC<CreateSportDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const addSportMutation = useAddSport();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateSportFormData>({
    resolver: zodResolver(createSportSchema),
    mode: "onChange",
    defaultValues: {
      _id: "",
      name: "",
      description: "",
    },
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Обработчик отправки формы
  const onSubmit = async (data: CreateSportFormData) => {
    try {
      await addSportMutation.mutateAsync(data);
      onSuccess();
    } catch (error) {
      // Ошибка обрабатывается в хуке
    }
  };

  return (
    <DialogBase
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={addSportMutation.isPending}
    >
      <div className="p-6">
        <h2
          className="text-2xl font-bold text-center mb-6"
          style={{ color: "#121212" }}
        >
          {t("admin.sports.create_dialog.title")}
        </h2>

        {/* Форма */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register("_id")}
            label={`${t("admin.sports.create_dialog.id")} *`}
            placeholder="football"
            error={errors._id?.message}
            maxLength={20}
          />

          <Input
            {...register("name")}
            label={`${t("admin.sports.create_dialog.name")} *`}
            placeholder={t("admin.sports.create_dialog.name_placeholder")}
            error={errors.name?.message}
            maxLength={20}
          />

          <Input
            {...register("description")}
            label={`${t("admin.sports.create_dialog.description")}`}
            placeholder={t(
              "admin.sports.create_dialog.description_placeholder"
            )}
            error={errors.description?.message}
            maxLength={200}
          />

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <AppButton
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={addSportMutation.isPending}
              className="flex-1"
            >
              {t("common.cancel")}
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              disabled={!isValid || addSportMutation.isPending}
              className="flex-1"
            >
              {addSportMutation.isPending
                ? t("common.creating")
                : t("common.create")}
            </AppButton>
          </div>
        </form>
      </div>
    </DialogBase>
  );
};
