import React from "react";

interface StepperProps {
  steps: Array<string>;
  activeStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, activeStep }) => {
  return (
    <div className="w-full flex justify-between items-center pb-10">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isFirst = index === 0;

        return (
          <React.Fragment key={`${index}-step`}>
            <div className="flex items-center">
              {/* Circle */}
              <div
                className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition ${
                  index < activeStep
                    ? "bg-green-500 text-white"
                    : index === activeStep
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < activeStep ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <p className="text-sm font-medium text-gray-900 text-nowrap">
                    {index}
                  </p>
                )}

                <div className={`absolute top-10 ${isFirst ? "left-0" : ""} ${isLast ? "right-0" : ""}`}>
                  <p className="text-sm font-medium text-gray-900 text-nowrap">
                    {step}
                  </p>
                </div>
              </div>
            </div>

            {/* Connector */}
            {!isLast ? (
              <div className="flex-1 h-0.5 bg-gray-200 ml-4 mr-4">
                <div
                  className={`h-full transition-all ${
                    index < activeStep ? "bg-green-500" : ""
                  }`}
                />
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};