import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { type BaseDialogProps, DialogBase } from "~/components/Dialogs/adminModals/DialogBase";
import { Stepper } from "~/shared/ui/Stepper";
import { UploadImageStep } from "~/components/Dialogs/adminModals/steps/UploadImageStep";
import {
  ObjectResultStep
} from "~/components/Dialogs/adminModals/steps/ObjectResultStep";
import {
  type CreateTeamType,
  TeamDialogDataStep
} from "~/components/Dialogs/adminModals/createDialog/team/TeamDialogDataStep";
import { useCreateTeam } from "~/queries/admin";
import { useDialogSteps } from "~/components/Dialogs/adminModals/steps/useDialogSteps";

type ModalState = {
  step: number;
  data: CreateTeamType;
  thumbnail: File | undefined;
  images: File[];
  teamId: string | undefined;
}

const DEFAULT_STATE: ModalState = {
  step: 0,
  data: {
    sportId: "",
    name: "",
    establishedAt: "",
    country: "ru",
    city: "",
    stadium: "",
  },
  thumbnail: undefined,
  images: [],
  teamId: undefined,
};

interface CreateTeamDialogProps extends BaseDialogProps {
  // onSuccess: () => void;
}

export const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  const createTeamMutation = useCreateTeam();

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

      const res = await createTeamMutation.mutateAsync({
        fields: {
          ...data.data,
          establishedAt: data.data.establishedAt as any,
        },
        // thumbnail: state.thumbnail,
        images: data.images
      });

      return {
        _id: res.team._id,
        link: `/teams/${res.team.slug}`,
        type: "team"
      }
    },
    submitStepNumber: 3
  });

  const handleClose = useCallback(() => {
    if (createTeamMutation.isPending) return;

    onClose();
    reset();
  }, [onClose]);

  return (
    <DialogBase isOpen={isOpen} onClose={handleClose} isLoading={createTeamMutation.isPending}>
      <div className="p-6">
        <h2
          className="text-2xl font-bold text-center mb-6"
          style={{ color: "#121212" }}
        >
          {t("admin.teams.create_dialog.title")}
        </h2>

        {/*Шаг*/}
        <Stepper
          steps={[
            t("admin.teams.create_dialog.data_step_label"),
            t("admin.teams.create_dialog.photo_step_label"),
            t("admin.teams.create_dialog.done_step_label"),
          ]}
          activeStep={state.step}
        />

        {/* Форма */}
        {state.step === 0 ? (
          <TeamDialogDataStep
            defaultValues={state.data}
            next={(data) => {
              nextWithData({ data });
            }}
            back={handleClose}
          />
        ) : null}

        {/* Фото */}
        {state.step === 1 || state.step === 2 ? (
          <UploadImageStep
            defaultValues={{
              thumbnail: state.thumbnail,
              images: state.images,
            }}
            next={nextWithData}
            back={back}
          />
        ) : null}

        {/* Результат */}
        {result ? (
          <ObjectResultStep
            result={result}
            createdTranslationKey="admin.teams.create_dialog.created_player"
            handleClose={handleClose}
          />
        ) : null}
      </div>
    </DialogBase>
  );
};
