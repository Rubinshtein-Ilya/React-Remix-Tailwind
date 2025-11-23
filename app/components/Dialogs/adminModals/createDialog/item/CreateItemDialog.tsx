import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  type BaseDialogProps,
  DialogBase,
} from "~/components/Dialogs/adminModals/DialogBase";
import { useCreateItem } from "~/queries/admin";
import { Stepper } from "~/shared/ui/Stepper";
import { UploadImageStep } from "~/components/Dialogs/adminModals/steps/UploadImageStep";
import { ObjectResultStep } from "~/components/Dialogs/adminModals/steps/ObjectResultStep";
import {
  type CreateItemFormType,
  ItemDialogDataStep,
} from "~/components/Dialogs/adminModals/createDialog/item/ItemDialogDataStep";
import { ItemDialogStockAndLabelsStep } from "~/components/Dialogs/adminModals/createDialog/item/ItemDialogStockAndLabelsStep";
import { useDialogSteps } from "~/components/Dialogs/adminModals/steps/useDialogSteps";

type ModalState = {
  step: number;

  data: CreateItemFormType;

  thumbnail: File | undefined;
  images: File[];

  stockBySize: Record<string, number>;

  beneficiaryId: string | undefined;
  eventId: string | undefined;
  teamId: string | undefined;
  playerId: string | undefined;
};

const DEFAULT_STATE: ModalState = {
  step: 0,

  data: {
    sportId: "",
    type: "",
    title: "",
    description: "",
    price: 1,
    weight: 1,
    length: 1,
    width: 1,
    height: 1,
    salesMethod: "bidding",
    startDate: new Date().toISOString(),
    endDate: new Date(
      new Date().getTime() + 1000 * 60 * 60 * 24 * 30
    ).toISOString(),
    labels: [],
    eventId: "",
  },

  thumbnail: undefined,
  images: [],

  stockBySize: {},

  beneficiaryId: undefined,
  eventId: undefined,
  teamId: undefined,
  playerId: undefined,
};

interface CreatePlayerDialogProps extends BaseDialogProps {
  // onSuccess: () => void;
}

export const CreateItemDialog: React.FC<CreatePlayerDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  const createItemMutation = useCreateItem();

  const {
    state,
    result,
    reset,
    back,
    nextWithData
  } = useDialogSteps({
    defaultState: DEFAULT_STATE,
    onSubmit: async (data) => {
      if (!data.thumbnail) throw new Error("No Thumbnail in steps state");

      const { beneficiaryId, eventId, teamId, playerId, stockBySize } = data;
      const finalEventId = data.data.eventId || eventId;

      const res = await createItemMutation.mutateAsync({
        fields: {
          ...data.data,
          startDate: data.data.startDate
            ? new Date(data.data.startDate)
            : new Date(),
          endDate: data.data.endDate
            ? new Date(data.data.endDate)
            : new Date(),

          stockBySize,

          beneficiaryId,
          eventId: finalEventId,
          teamId,
          playerId,
        },
        thumbnail: data.thumbnail,
        images: data.images,
      });

      return {
        _id: res.item._id,
        link: `/product/${res.item.slug}`,
        type: "item"
      }
    },
    submitStepNumber: 3
  });

  const handleClose = useCallback(() => {
    if (createItemMutation.isPending) return;
    onClose();
    reset();
  }, [onClose]);

  return (
    <DialogBase
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={createItemMutation.isPending}
    >
      <div className="p-6">
        <h2
          className="text-2xl font-bold text-center mb-6"
          style={{ color: "#121212" }}
        >
          {t("admin.items.create_dialog.title")}
        </h2>

        {/*Шаг*/}
        <Stepper
          steps={[
            t("admin.items.create_dialog.data_step_label"),
            t("admin.items.create_dialog.stock_step_label"),
            t("admin.items.create_dialog.photo_step_label"),
            t("admin.items.create_dialog.done_step_label"),
          ]}
          activeStep={state.step}
        />

        {/* Форма */}
        {state.step === 0 ? (
          <ItemDialogDataStep
            defaultValues={state.data}
            next={(data) => {
              nextWithData({ data });
            }}
            back={handleClose}
          />
        ) : null}

        {/* Форма Сток */}
        {state.step === 1 ? (
          <ItemDialogStockAndLabelsStep
            defaultValues={{
              stock: state.stockBySize,
            }}
            next={(data) => {
              nextWithData({ stockBySize: data.stock })
            }}
            back={back}
          />
        ) : null}

        {state.step === 2 || state.step === 3 ? (
          <UploadImageStep
            withThumbnail
            defaultValues={{
              thumbnail: state.thumbnail,
              images: state.images,
            }}
            next={nextWithData}
            back={back}
          />
        ) : null}

        {result ? (
          <ObjectResultStep
            result={result}
            createdTranslationKey="admin.items.create_dialog.created_item"
            handleClose={handleClose}
          />
        ) : null}
      </div>
    </DialogBase>
  );
};
