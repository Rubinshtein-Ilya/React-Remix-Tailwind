import React, { type FC } from "react";
import { Link } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";
import { useTranslation } from "react-i18next";

export type CreateObjectResult = {
  link: string;
  _id: string;
}

type Props = {
  result: CreateObjectResult;
  createdTranslationKey: string;
  handleClose: () => void;
}

export const ObjectResultStep: FC<Props> = ({ result, handleClose, createdTranslationKey }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full flex flex-col items-center mt-4">
      <div className="text-gray-400" mb-4>
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {t(createdTranslationKey)}
      </h3>
      <Link to={result.link}>
        <p className="text-gray-500 mb-2 underline">
          {`link: ${result.link}`}
        </p>
      </Link>
      <p className="text-gray-500 mb-4">
        {`id: ${result._id}`}
      </p>
      <AppButton
        type="button"
        onClick={handleClose}
      >
        {t("common.done")}
      </AppButton>
    </div>
  )
}