import { useCallback, useEffect, useState } from "react";
import type { CreateObjectResult } from "~/components/Dialogs/adminModals/steps/ObjectResultStep";
import { useNotifications } from "~/hooks/useNotifications";

type Result = {
  link: string;
  _id: string;
  type: "player" | "item" | "team";
}

export interface Props<T> {
  defaultState: T;
  onSubmit: (data: T) => Promise<Result>;
  submitStepNumber: number;
}

export type WithStep<T> = {
  step: number;
} & T;

export function useDialogSteps<T>({ defaultState, onSubmit, submitStepNumber }: Props<T>){
  const { showSuccess, showError } = useNotifications();

  const [state, setState] = useState<WithStep<T>>({
    ...defaultState,
    step: 0
  });

  const [result, setResult] = useState<CreateObjectResult | undefined>(
    undefined
  );

  const reset = useCallback(() => {
    setState({
      ...defaultState,
      step: 0
    });
    setResult(undefined);
  }, [defaultState]);

  const next = useCallback(() => {
    setState(prev => ({ ...prev, step: prev.step + 1 }));
  }, []);

  const back = useCallback(() => {
    setState(prev => ({ ...prev, step: prev.step - 1 }));
  }, []);

  const nextWithData = useCallback((data: Partial<T>) => {
    setState(prev => ({
      ...prev,
      ...data,
      step: prev.step + 1
    }));
  }, []);

  useEffect(() => {
    if (state.step === submitStepNumber) {
      const { step, ...data } = state;

      onSubmit(data as T)
        .then((res) => {
          next();
          setResult(res);
        })
        .catch((error) => {
          back();
          showError(error.message);
        });
    }
  }, [state.step]);

  return {
    state,
    result,
    reset,
    back,
    next,
    nextWithData
  };
}