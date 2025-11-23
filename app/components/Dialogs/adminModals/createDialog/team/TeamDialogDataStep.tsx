import React, { type FC } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Input } from "~/shared/inputs/Input";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select,
  SelectLabel
} from "~/shared/ui/Select";
import { z } from "zod";
import { useSports } from "~/queries/public";
import {AppButton} from "~/shared/buttons/AppButton";
import { CountryCodes } from "~/utils/countryUtils";

export const createTeamSchema = z.object({
  sportId: z.string().min(1, "admin.teams.create_dialog.errors.sport_id_required"),
  name: z.string().min(1, "admin.teams.create_dialog.errors.name_required"),
  establishedAt: z
    .string().min(1, "admin.teams.create_dialog.errors.establish_date_required"),
  country: z.string().nonempty("admin.teams.create_dialog.errors.country_required"),
  city: z.string().nonempty("admin.teams.create_dialog.errors.city_required"),
  stadium: z.string().nonempty("admin.teams.create_dialog.errors.stadium_required"),
});

export type CreateTeamType = z.infer<typeof createTeamSchema>;

type Props = {
  defaultValues: CreateTeamType;
  next: (fields: CreateTeamType) => void;
  back: () => void;
}

export const TeamDialogDataStep: FC<Props> = ({ defaultValues, next, back }) => {
  const { t } = useTranslation();

  const { data: sports } = useSports();

  const form = useForm<CreateTeamType>({
    resolver: zodResolver(createTeamSchema),
    mode: "onChange",
    defaultValues,
  });

  const handleSubmit = (data: CreateTeamType) => {
    console.log("Next with: ", data);
    next(data);
  };

  const country = form.watch("country");
  const sportId = form.watch("sportId");

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          value={sportId}
          onValueChange={(value: string) => {
            form.setValue("sportId", value);
          }}
        >
          <SelectLabel>
            {t("admin.teams.create_dialog.fields.sport_id")}
          </SelectLabel>
          <SelectTrigger className="w-28">
            <SelectValue>
              <p className="text-[#121212] text-base" >
                {sportId.length ? sports?.find(s => s._id === sportId)?.name : t("admin.teams.create_dialog.fields.sport_id_placeholder")}
              </p>
            </SelectValue>
          </SelectTrigger>
          {sports ? (
            <SelectContent>
              <SelectItem value="">
                {t("admin.teams.create_dialog.fields.sport_id_placeholder")}
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
        </Select>

        <Input
          {...form.register("name")}
          placeholder={t("admin.teams.create_dialog.fields.name_placeholder")}
          label={t("admin.teams.create_dialog.fields.name")}
          error={
            form.formState.errors.name
              ? t(form.formState.errors.name.message as string)
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="establishedAt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="date"
              label={t("admin.teams.create_dialog.fields.established_at")}
              error={fieldState.error ? t(fieldState.error.message as string) : undefined}
            />
          )}
        />

        <Input
          {...form.register("stadium")}
          label={t("admin.teams.create_dialog.fields.stadium")}
          error={
            form.formState.errors.stadium
              ? t(form.formState.errors.stadium.message as string)
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          value={country}
          onValueChange={(newCountry: string) => {
            form.setValue("country", newCountry);
          }}
        >
          <SelectLabel>
            {t("admin.teams.create_dialog.fields.country")}
          </SelectLabel>
          <SelectTrigger className="w-28">
            <SelectValue>
              <p className="text-[#121212] text-base" >
                {t(`country.${country}`)}
              </p>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CountryCodes
              .map(countryCode => ({
                countryCode,
                countryName: t(`country.${countryCode}`)
              }))
              .sort((a, b) =>
                a.countryName.localeCompare(b.countryName)
              )
              .map(({ countryCode, countryName }) => (
                <SelectItem key={countryCode} value={countryCode}>
                  {countryName}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>

        <Input
          {...form.register("city")}
          label={t("admin.teams.create_dialog.fields.city")}
          error={
            form.formState.errors.city
              ? t(form.formState.errors.city.message as string)
              : undefined
          }
        />
      </div>

      {form.formState.errors.root && (
        <p className="text-red-500 text-sm mt-2">
          {form.formState.errors.root.message}
        </p>
      )}

      {/* Кнопки */}
      <div className="flex gap-3 mt-6">
        <AppButton
          type="button"
          onClick={back}
          variant="ghost"
          className="flex-1"
        >
          {t("common.cancel")}
        </AppButton>

        <AppButton
          type="submit"
          disabled={!form.formState.isValid}
          variant="primary"
          className="flex-1"
        >
          {t("common.next")}
        </AppButton>
      </div>
    </form>
  );
}