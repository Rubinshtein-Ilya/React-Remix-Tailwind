import React, {useCallback, useMemo} from "react";
import { useTranslation } from "react-i18next";
import {
  type BaseDialogProps,
  DialogBase,
} from "~/components/Dialogs/adminModals/DialogBase";
import { useUpdateItem } from "~/queries/admin";
import { Stepper } from "~/shared/ui/Stepper";
import { useNotifications } from "~/hooks/useNotifications";
import {
  type CreateObjectResult,
  ObjectResultStep,
} from "~/components/Dialogs/adminModals/steps/ObjectResultStep";
import {
  type CreateItemFormType,
  ItemDialogDataStep,
} from "~/components/Dialogs/adminModals/createDialog/item/ItemDialogDataStep";
import { ItemDialogStockAndLabelsStep } from "~/components/Dialogs/adminModals/createDialog/item/ItemDialogStockAndLabelsStep";
import { useDialogSteps } from "~/components/Dialogs/adminModals/steps/useDialogSteps";
import type { IItem } from "server/models/Item";
import { EditImageStep } from "~/components/Dialogs/adminModals/steps/EditImageStep";
import { AppButton } from "~/shared/buttons/AppButton";

type ModalState = {
  data: CreateItemFormType;
  thumbnail: File | string | undefined;
  images: (File | string)[];
  stockBySize: Record<string, number>;
  beneficiaryId: string | undefined;
  eventId: string | undefined;
};

interface EditItemDialogProps extends BaseDialogProps {
  item: IItem;
  onSuccess?: () => void;
}

export const EditItemDialog: React.FC<EditItemDialogProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const updateItemMutation = useUpdateItem();

  // Преобразуем данные товара в формат для формы
  const defaultState: ModalState = useMemo(() => {
    const itemOrig = isOpen ? item : undefined;

    return {
      data: {
        sportId: itemOrig?.sportId || "",
        type: itemOrig?.type || "",
        title: itemOrig?.title || "",
        description: itemOrig?.description || "",
        price: itemOrig?.price || 1,
        weight: itemOrig?.weight || 1,
        length: itemOrig?.length || 1,
        width: itemOrig?.width || 1,
        height: itemOrig?.height || 1,
        salesMethod: itemOrig?.salesMethod || "bidding",
        startDate: itemOrig?.startDate ? new Date(itemOrig.startDate).toISOString() : new Date().toISOString(),
        endDate: itemOrig?.endDate ? new Date(itemOrig.endDate).toISOString() : new Date(
          new Date().getTime() + 1000 * 60 * 60 * 24 * 30
        ).toISOString(),
        labels: itemOrig?.labels || [],
        teamId: itemOrig?.team?._id,
        playerId: itemOrig?.player?._id,
        eventId: itemOrig?.event?._id,
      },
      thumbnail: undefined,
      images: [],
      beneficiaryId: itemOrig?.beneficiary?._id,
      eventId: itemOrig?.event?._id,
      stockBySize: itemOrig?.stockBySize || {},
    }
  }, [item, isOpen]);

  const {
    state,
    result,
    reset,
    back,
    nextWithData
  } = useDialogSteps({
    defaultState,
    onSubmit: async (data) => {
      // --- DIFF LOGIC ---
      const getDiff = () => {
        const diff: Record<string, any> = {};
        const orig = defaultState;
        const curr = data;
        
        // Сравниваем поля формы
        (Object.keys(orig.data) as (keyof CreateItemFormType)[]).forEach((key) => {
          const currValue = curr.data[key];
          const origValue = orig.data[key];
          
          // Специальная обработка для массивов (labels)
          if (key === 'labels') {
            if (JSON.stringify(currValue) !== JSON.stringify(origValue)) {
              diff[key] = currValue;
            }
          } else {
            // Обычное сравнение для остальных полей
            if (currValue !== origValue && currValue !== undefined && currValue !== null) {
              diff[key] = currValue;
            }
          }
        });

        if (!orig.data.teamId && !curr.data.teamId) delete diff.teamId;
        if (!orig.data.playerId && !curr.data.playerId) delete diff.playerId;
        if (!orig.data.eventId && !curr.data.eventId) delete diff.eventId;

        // Сравниваем остальные поля
        if (JSON.stringify(curr.stockBySize) !== JSON.stringify(orig.stockBySize)) {
          diff.stockBySize = curr.stockBySize;
        }
        if (curr.beneficiaryId !== orig.beneficiaryId) {
          diff.beneficiaryId = curr.beneficiaryId;
        }
        
        return diff;
      };

      const diff = getDiff();

      // holds ingo about updates of images: replaces, deletes, new images
      const imagesArr = data.images.map(i => typeof i === "string" ? i : "new");

      // basically used to determinate when loaded before image is set as thumbnail
      const thumbnailInfo = (typeof data.thumbnail === "string" && data.thumbnail !== defaultState.thumbnail) ? data.thumbnail : undefined;

      const noImagesChanged = JSON.stringify(defaultState.images) === JSON.stringify(imagesArr);

      if (Object.keys(diff).length === 0 && noImagesChanged) {
        throw new Error(t("admin.items.edit_dialog.nothing_changed"));
      }

      const res = await updateItemMutation.mutateAsync({
        itemId: item._id,
        fields: {
          ...diff,
          imagesInfo: imagesArr,
          thumbnailInfo
        },
        thumbnail: data.thumbnail instanceof File ? data.thumbnail : undefined,
        images: data.images.filter(i => typeof i !== "string"),
      });

      showSuccess(t("admin.items.edit_dialog.updated_item"));
      onSuccess?.();

      return {
        _id: res.item._id,
        link: `/product/${res.item.slug}`,
        type: "item"
      };
    },
    submitStepNumber: 3
  });

  const handleClose = useCallback(() => {
    if (updateItemMutation.isPending) return;
    onClose();
    reset();
  }, [onClose, updateItemMutation.isPending]);

  return (
    <DialogBase
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={updateItemMutation.isPending}
    >
      <div className="p-6">
        <h2
          className="text-2xl font-bold text-center mb-6"
          style={{ color: "#121212" }}
        >
          {t("admin.items.edit_dialog.title")}
        </h2>
        <Stepper
          steps={[
            t("admin.items.edit_dialog.data_step_label"),
            t("admin.items.edit_dialog.stock_step_label"),
            t("admin.items.edit_dialog.images_step_label"),
            t("admin.items.edit_dialog.done_step_label"),
          ]}
          activeStep={state.step}
        />
        {state.step === 0 && (
          <ItemDialogDataStep
            defaultValues={state.data}
            next={(data) => {
              nextWithData({ data });
            }}
            back={handleClose}
          />
        )}
        {state.step === 1 && (
          <ItemDialogStockAndLabelsStep
            defaultValues={{ stock: state.stockBySize }}
            next={(data) => {
              nextWithData({ stockBySize: data.stock });
            }}
            back={back}
          />
        )}
        {state.step === 2 && (
          <EditImageStep
            initialImages={item.images}
            initialThumbnail={item.thumbnail}
            onChange={({ images, thumbnail }) => {
              nextWithData({ images, thumbnail });
            }}
            onBack={back}
          />
        )}
        {result && (
          <ObjectResultStep
            result={result}
            createdTranslationKey="admin.items.edit_dialog.updated_item"
            handleClose={handleClose}
          />
        )}
      </div>
    </DialogBase>
  );
}; 
