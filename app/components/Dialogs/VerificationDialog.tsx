import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import type { User } from "~/types/user";
import { AppButton } from "~/shared/buttons/AppButton";
import { Step2PhoneVerification } from "~/components/Dialogs/VerificationDialog/Step2PhoneVerification";
import { Step3AddressInput } from "~/components/Dialogs/VerificationDialog/Step3AddressInput";
import { Step4PaymentMethod } from "~/components/Dialogs/VerificationDialog/Step4PaymentMethod";
import tickCircleSVG from "../../assets/images/modal/verification/tick-circle.svg";
import tickCircleCheckedSVG from "../../assets/images/modal/verification/tick-circle-checked.svg";

// Импорты иконок для верификации
import smsSVG from "../../assets/images/modal/verification/sms.svg";
import mobileSVG from "../../assets/images/modal/verification/mobile.svg";
import homeSVG from "../../assets/images/modal/verification/home.svg";
import emptyWalletSVG from "../../assets/images/modal/verification/empty-wallet.svg";
import { useUser } from "~/queries/auth";

interface VerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onStepCompleted?: (stepNumber: number) => void;
}

interface VerificationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export function VerificationDialog({
  isOpen,
  onClose,
  user,
  onStepCompleted,
}: VerificationDialogProps) {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<"overview" | "stepper">(
    "overview"
  );
  const [currentStep, setCurrentStep] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const { refetch } = useUser();

  // Функции для работы с верификацией
  const getStepStatus = (stepNumber: number): boolean => {
    if (!user?.verification) return false;

    switch (stepNumber) {
      case 1:
        return user.verification.step1Completed || false;
      case 2:
        return user.verification.step2Completed || false;
      case 3:
        return user.verification.step3Completed || false;
      case 4:
        return user.verification.step4Completed || false;
      default:
        return false;
    }
  };

  const getCurrentActiveStep = (): number => {
    if (!getStepStatus(1)) return 1;
    if (!getStepStatus(2)) return 2;
    if (!getStepStatus(3)) return 3;
    if (!getStepStatus(4)) return 4;
    return 5; // Все шаги завершены
  };

  const [steps, setSteps] = useState<VerificationStep[]>([]);

  // Функция для сброса состояния диалога
  const resetDialogState = () => {
    setCurrentView("overview");
    setCurrentStep(getCurrentActiveStep()); // Устанавливаем текущий активный шаг
    setIsLoading(false);
  };

  // Обработчик закрытия с сбросом состояния
  const handleClose = () => {
    resetDialogState();
    onClose();
  };

  // Инициализируем шаги с переводами
  useEffect(() => {
    setSteps([
      {
        id: 1,
        title: t("verification_dialog.steps.1.title"),
        description: t("verification_dialog.steps.1.description"),
        completed: getStepStatus(1),
      },
      {
        id: 2,
        title: t("verification_dialog.steps.2.title"),
        description: t("verification_dialog.steps.2.description"),
        completed: getStepStatus(2),
      },
      {
        id: 3,
        title: t("verification_dialog.steps.3.title"),
        description: t("verification_dialog.steps.3.description"),
        completed: getStepStatus(3),
      },
      {
        id: 4,
        title: t("verification_dialog.steps.4.title"),
        description: t("verification_dialog.steps.4.description"),
        completed: getStepStatus(4),
      },
    ]);
  }, [t, user]);

  // Закрытие по Escape и блокировка скролла
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (currentStep === 4 && getStepStatus(4)) {
      setCurrentStep(5);
    }
  }, [currentStep, getStepStatus, user]);

  if (!isOpen) return null;

  // Функция для получения иконки шага
  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 1:
        return smsSVG;
      case 2:
        return mobileSVG;
      case 3:
        return homeSVG;
      case 4:
        return emptyWalletSVG;
      default:
        return smsSVG;
    }
  };

  const handleContinue = () => {
    if (currentView === "overview") {
      setCurrentView("stepper");
      const activeStep = getCurrentActiveStep();
      setCurrentStep(activeStep <= 4 ? activeStep : 4); // Если все шаги завершены, показываем последний
    }
  };

  const handleStepNext = async (stepData: any) => {
    setIsLoading(true);

    try {
      // Сохраняем данные на сервере
      await saveStepData(currentStep, stepData);

      refetch();

      // Вызываем callback для обновления UI в профиле
      if (onStepCompleted) {
        onStepCompleted(currentStep);
      }

      // Обновляем состояние шага как завершенного
      setSteps((prev) =>
        prev.map((step) =>
          step.id === currentStep ? { ...step, completed: true } : step
        )
      );

      // Переходим к следующему шагу или закрываем диалог
      if (currentStep < 5) {
        // Найти шаг не завершенный
        const nextStep = steps.find((step) => !step.completed);
        setCurrentStep(nextStep?.id || currentStep + 1);
      } else {
        handleClose();
      }
    } catch (error) {
      console.error("Ошибка сохранения данных:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStepData = async (step: number, data: any) => {
    const response = await fetch("/api/verification/update-step", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        step,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save step data");
    }
  };

  const renderOverview = () => {
    const activeStep = getCurrentActiveStep();
    const allStepsCompleted = activeStep === 5;

    return (
      <div>
        <p className="text-center mb-8 text-[#121212] text-[16px]">
          {allStepsCompleted
            ? t("profile.verification.completed_description")
            : t("verification_dialog.description")}
        </p>

        <div className="space-y-0 mb-8">
          {/* Полоска над первым элементом */}
          <div className="h-px w-full" style={{ backgroundColor: "#DCDCDC" }} />
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center flex-1">
                  {/* Иконка шага */}
                  <div className="w-12 h-12 mr-4 flex items-center justify-center">
                    <img
                      src={getStepIcon(step.id)}
                      alt={`Step ${step.id}`}
                      className="w-8 h-8"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#121212] text-[16px]">
                      {step.id}. {step.title}
                    </h3>
                    <p className="text-gray-600 text-[14px] mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
                <div className="ml-4">
                  <img
                    src={step.completed ? tickCircleCheckedSVG : tickCircleSVG}
                    alt={step.completed ? "Completed" : "Not completed"}
                    className="w-6 h-6"
                  />
                </div>
              </div>
              {/* Полоска между шагами */}
              <div
                className="h-px w-full"
                style={{ backgroundColor: "#DCDCDC" }}
              />
            </React.Fragment>
          ))}
        </div>

        {!allStepsCompleted && (
          <AppButton
            onClick={handleContinue}
            disabled={isLoading || allStepsCompleted}
            variant={allStepsCompleted ? "primary" : "secondary"}
            isLoading={isLoading}
            style={{
              background: allStepsCompleted ? "#10B981" : undefined,
              opacity: allStepsCompleted ? 0.7 : undefined,
            }}
          >
            {allStepsCompleted
              ? t("profile.verification.verification_complete")
              : t("verification_dialog.buttons.continue")}
          </AppButton>
        )}
      </div>
    );
  };

  const renderStepper = () => (
    <div>
      {/* Stepper */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center space-x-4 relative">
          {/* Линия между шагами */}
          <div
            className="absolute top-6 h-px"
            style={{
              backgroundColor: "#DCDCDC",
              zIndex: 0,
              left: "-20px",
              width: "calc(100% + 40px)",
            }}
          />
          {[1, 2, 3, 4].map((step, idx) => (
            <div
              key={step}
              className={`w-12 h-12 flex items-center justify-center rounded-full border-2 relative z-10 font-bold ${
                step <= currentStep && steps[step - 1]?.completed
                  ? "bg-[#F9B234] border-[#F9B234] text-[#121212]"
                  : step <= currentStep
                  ? "bg-[#F9B234] border-[#F9B234] text-[#121212]"
                  : "bg-[#DCDCDC] border-[#DCDCDC] text-[#B8B8B8]"
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Контент текущего шага */}
      <div className="mb-8">{renderStepContent()}</div>
    </div>
  );

  const renderStepContent = () => {
    // Если шаг уже завершен, показываем сообщение
    if (getStepStatus(currentStep)) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <img
              src={tickCircleCheckedSVG}
              alt="Completed"
              className="w-8 h-8"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-[#121212]">
            {t("verification_dialog.step_completed_title")}
          </h3>
          <p className="text-[#121212]">
            {t("verification_dialog.step_completed_description")}
          </p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        // Шаг 1 обычно завершается автоматически при регистрации
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <img
                src={tickCircleCheckedSVG}
                alt="Completed"
                className="w-8 h-8"
              />
            </div>
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              {t("verification_dialog.steps.1.title")}
            </h3>
            <p className="text-gray-600">
              {t("verification_dialog.email_already_verified")}
            </p>
          </div>
        );

      case 2:
        return (
          <Step2PhoneVerification
            onNext={handleStepNext}
            isLoading={isLoading}
          />
        );

      case 3:
        return (
          <Step3AddressInput onNext={handleStepNext} isLoading={isLoading} />
        );

      case 4:
        return (
          <Step4PaymentMethod onNext={handleStepNext} isLoading={isLoading} />
        );

      default:
        return null;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Фон */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,.5)] backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
          aria-label="Закрыть"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Содержимое */}
        <div className="p-6">
          <h2
            className="text-2xl font-bold text-center mb-6"
            style={{ color: "#121212" }}
          >
            {t("verification_dialog.title")}
          </h2>

          {currentView === "overview" ? renderOverview() : renderStepper()}
        </div>
      </div>
    </div>,
    document.body
  );
}
