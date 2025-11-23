import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Input } from "~/shared/inputs/Input";
import { AppButton } from "~/shared/buttons/AppButton";
import { useAddItemType } from "~/queries/admin";
import { type BaseDialogProps, DialogBase } from "~/components/Dialogs/adminModals/DialogBase";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select,
  SelectLabel
} from "~/shared/ui/Select";
import {useSports} from "~/queries/public";

// Схема валидации для создания промокода
const createItemTypeSchema = z.object({
  sportId: z.string().min(1, "Укажите sportId"),
  name: z
    .string()
    .min(2, "Название должно содержать хотя бы 2 буквы"),
  description: z
    .string()
    .min(5, "Описание должно содержать минимум 5 символов")
    .max(200, "Описание не должно превышать 200 символов"),
});

type CreateItemTypeFormData = z.infer<typeof createItemTypeSchema>;

interface CreateItemTypeDialogProps extends BaseDialogProps {
  onSuccess: () => void;
}

export const CreateItemTypeDialog: React.FC<CreateItemTypeDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const { data: sports } = useSports();
  const addItemTypeMutation = useAddItemType();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<CreateItemTypeFormData>({
    resolver: zodResolver(createItemTypeSchema),
    mode: "onChange",
    defaultValues: {
      sportId: "",
      name: "",
      description: ""
    },
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);


  // Обработчик отправки формы
  const onSubmit = async (data: CreateItemTypeFormData) => {
    try {
      await addItemTypeMutation.mutateAsync(data);
      onSuccess();
    } catch (error) {
      // Ошибка обрабатывается в хуке
    }
  };

  const sportId = watch("sportId");

  return (
    <DialogBase isOpen={isOpen} onClose={handleClose} isLoading={addItemTypeMutation.isPending}>
      <div className="p-6">
        <h2
          className="text-2xl font-bold text-center mb-6"
          style={{ color: "#121212" }}
        >
          {t("admin.item_types.create_dialog.title")}
        </h2>

        {/* Форма */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            value={sportId}
            onValueChange={(value: string) => {
              setValue("sportId", value, { shouldValidate: true });
            }}
          >
            <SelectLabel>
              {`${t("admin.item_types.create_dialog.sport_id")} *`}
            </SelectLabel>
            <SelectTrigger className="w-28">
              <SelectValue>
                <p className="text-[#121212] text-base" >
                  {sportId.length ? sports?.find(s => s._id === sportId)?.name : t("admin.item_types.create_dialog.sport_id_placeholder")}
                </p>
              </SelectValue>
            </SelectTrigger>
            {sports ? (
              <SelectContent>
                <SelectItem value="">
                  {t("admin.item_types.create_dialog.sport_id_placeholder")}
                </SelectItem>
                {sports
                  .sort((a, b) =>
                    a.name.localeCompare(b.name)
                  )
                  .map(({ _id, name }) => (
                    <SelectItem key={_id} value={_id}>
                      {name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            ) : null}
            {errors.sportId && <p className="text-red-500 text-sm mt-1">{errors.sportId.message}</p>}
          </Select>

          <Input
            {...register("name")}
            label={`${t("admin.item_types.create_dialog.name")} *`}
            placeholder={t(
              "admin.item_types.create_dialog.name_placeholder"
            )}
            error={errors.name?.message}
            maxLength={20}
          />

          {/* Описание */}
          <Input
            {...register("description")}
            label={`${t("admin.item_types.create_dialog.description")} *`}
            placeholder={t(
              "admin.item_types.create_dialog.description_placeholder"
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
              disabled={addItemTypeMutation.isPending}
              className="flex-1"
            >
              {t("common.cancel")}
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              disabled={!isValid || addItemTypeMutation.isPending}
              className="flex-1"
            >
              {addItemTypeMutation.isPending
                ? t("common.creating")
                : t("common.create")}
            </AppButton>
          </div>
        </form>
      </div>
    </DialogBase>
  );
};
