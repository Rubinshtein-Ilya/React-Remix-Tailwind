import React, { type FC } from "react";
import { useSports } from "~/queries/public";
import {AppButton} from "~/shared/buttons/AppButton";
import {useTranslation} from "react-i18next";

type Props = {
  sportId: string | undefined;
  setSportId: (selectedSportId: string | undefined) => void;
};

export const SportIdChipSelector: FC<Props> = ({ sportId, setSportId }) => {
  const { t } = useTranslation();
  const { data: sports } = useSports();

  if (!sports) return null;

  return (
    <div className="flex w-full gap-4 flex-wrap">
      <AppButton
        variant={sportId === undefined ? "secondary" : "primary"}
        size="sm"
        fullWidth={false}
        onClick={() => setSportId(undefined)}
      >
        {t("common.all")}
      </AppButton>
      {sports.map(({ _id, name }) => (
        <AppButton
          key={_id}
          variant={sportId === _id ? "secondary" : "primary"}
          size="sm"
          fullWidth={false}
          onClick={() => setSportId(_id)}
        >
          {name}
        </AppButton>
      ))}
    </div>
  )
}