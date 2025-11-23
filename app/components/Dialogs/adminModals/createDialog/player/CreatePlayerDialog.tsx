import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { type BaseDialogProps, DialogBase } from "~/components/Dialogs/adminModals/DialogBase";
import { useCreatePlayer } from "~/queries/admin";
import {
  PlayerDialogDataStep,
  type CreatePlayerType
} from "~/components/Dialogs/adminModals/createDialog/player/PlayerDialogDataStep";
import { Stepper } from "~/shared/ui/Stepper";
import { UploadImageStep } from "~/components/Dialogs/adminModals/steps/UploadImageStep";
import {
  ObjectResultStep
} from "~/components/Dialogs/adminModals/steps/ObjectResultStep";
import { useDialogSteps } from "~/components/Dialogs/adminModals/steps/useDialogSteps";

type ModalState = {
  step: number;
  data: CreatePlayerType;
  thumbnail: File | undefined;
  images: File[];
  teamId: string | undefined;
}

const DEFAULT_STATE: ModalState = {
  step: 0,
  data: {
    sportId: "",
    position: "",
    name: "",
    lastName: "",
    middleName: "",
    birthDate: "",
    birthPlaceCountry: "ru",
    number: "",
    gender: "male",
    description: ""
  },
  thumbnail: undefined,
  images: [],
  teamId: undefined,
};

interface CreatePlayerDialogProps extends BaseDialogProps {
  // onSuccess: () => void;
}

export const CreatePlayerDialog: React.FC<CreatePlayerDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  const createPlayerMutation = useCreatePlayer();

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

      const res = await createPlayerMutation.mutateAsync({
        fields: {
          ...data.data,
          birthDate: data.data.birthDate as any,
          birthPlaceCity: data.data.birthPlaceCity || "",
          number: data.data.number || "",
          description: data.data.description || "",
          birthPlaceCountry: data.data.birthPlaceCountry || "ru",
        },
        thumbnail: data.thumbnail,
        images: data.images
      });

      return {
        _id: res.player._id,
        link: `/players/${res.player.slug}`,
        type: "player"
      }
    },
    submitStepNumber: 2
  });


  const handleClose = useCallback(() => {
    if (createPlayerMutation.isPending) return;

    onClose();
    reset();
  }, [onClose]);

  return (
    <DialogBase isOpen={isOpen} onClose={handleClose} isLoading={createPlayerMutation.isPending}>
      <div className="p-6">
        <h2
          className="text-2xl font-bold text-center mb-6"
          style={{ color: "#121212" }}
        >
          {t("admin.players.create_dialog.title")}
        </h2>

        {/*Шаг*/}
        <Stepper
          steps={[
            t("admin.players.create_dialog.data_step_label"),
            t("admin.players.create_dialog.photo_step_label"),
            t("admin.players.create_dialog.done_step_label"),
          ]}
          activeStep={state.step}
        />

        {/* Форма */}
        {state.step === 0 ? (
          <PlayerDialogDataStep
            defaultValues={state.data}
            next={(data) => {
              nextWithData({ data });
            }}
            back={handleClose}
          />
        ) : null}

        {state.step === 1 || state.step === 2 ? (
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
            createdTranslationKey="admin.players.create_dialog.created_player"
            handleClose={handleClose}
          />
        ) : null}
      </div>
    </DialogBase>
  );
};
