import React, { type FC, useEffect } from "react";
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
import { usePlayerPositions, useSports } from "~/queries/public";
import { AppButton } from "~/shared/buttons/AppButton";
import { CountryCodes } from "~/utils/countryUtils";

export const createPlayerSchema = z.object({
  sportId: z.string().min(1, "admin.players.create_dialog.errors.sport_id_required"),
  position: z.string().min(1, "admin.players.create_dialog.errors.position_required"),
  name: z.string().min(1, "admin.players.create_dialog.errors.name_required"),
  lastName: z.string().min(1, "admin.players.create_dialog.errors.last_name_required"),
  middleName: z.string().optional(),
  birthDate: z
    .string().min(1, "admin.players.create_dialog.errors.birth_date_required"),
  birthPlaceCountry: z.string().optional(),
  birthPlaceCity: z.string().optional(),
  number: z.string().optional(),
  gender: z.enum(['male', 'female']),
  description: z.string().optional(),
});

export type CreatePlayerType = z.infer<typeof createPlayerSchema>;

type Props = {
  defaultValues: CreatePlayerType;
  next: (fields: CreatePlayerType) => void;
  back: () => void;
}

export const PlayerDialogDataStep: FC<Props> = ({ defaultValues, next, back }) => {
  const { t } = useTranslation();

  const { data: sports } = useSports();
  const { data: positions, refetch: refetchPositions, isLoading: isLoadingPositions } = usePlayerPositions();

  const form = useForm<CreatePlayerType>({
    resolver: zodResolver(createPlayerSchema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    refetchPositions();
  }, []);

  const handleSubmit = (data: CreatePlayerType) => {
    console.log("Next with: ", data);
    next(data);
  };

  const country = form.watch("birthPlaceCountry");
  const sportId = form.watch("sportId");
  const position = form.watch("position");

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          value={sportId}
          onValueChange={(value: string) => {
            form.setValue("sportId", value);
            form.setValue("position", "");
          }}
        >
          <SelectLabel>
            {t("admin.players.create_dialog.fields.sport_id")}
          </SelectLabel>
          <SelectTrigger className="w-28">
            <SelectValue>
              <p className="text-[#121212] text-base" >
                {sportId.length ? sports?.find(s => s._id === sportId)?.name : t("admin.players.create_dialog.fields.sport_id_placeholder")}
              </p>
            </SelectValue>
          </SelectTrigger>
          {sports ? (
            <SelectContent>
              <SelectItem value="">
                {t("admin.players.create_dialog.fields.sport_id_placeholder")}
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

        <Select
          disabled={!sportId || sportId.length < 1}
          value={position}
          onValueChange={(value: string) => {
            form.setValue("position", value);
          }}
        >
          <SelectLabel>
            {t("admin.players.create_dialog.fields.position")}
          </SelectLabel>
          <SelectTrigger className="w-28">
            <SelectValue>
              <p className="text-[#121212] text-base" >
                {sportId.length && positions && positions[sportId]?.find(p => p._id === position)?.name || t("admin.players.create_dialog.fields.position_placeholder")}
              </p>
            </SelectValue>
          </SelectTrigger>
          {sportId.length && positions && !isLoadingPositions ? (
            <SelectContent>
              <SelectItem value="">
                {t("admin.players.create_dialog.fields.position_placeholder")}
              </SelectItem>
              {positions[sportId]
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...form.register("name")}
          placeholder={t("admin.players.create_dialog.fields.name_placeholder")}
          label={t("admin.players.create_dialog.fields.name")}
          error={
            form.formState.errors.name
              ? t(form.formState.errors.name.message as string)
              : undefined
          }
        />

        <Input
          {...form.register("lastName")}
          placeholder={t("admin.players.create_dialog.fields.last_name_placeholder")}
          label={t("admin.players.create_dialog.fields.last_name")}
          error={
            form.formState.errors.lastName
              ? t(form.formState.errors.lastName.message as string)
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="birthDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="date"
              label={t("admin.players.create_dialog.fields.birth_date")}
              error={fieldState.error ? t(fieldState.error.message as string) : undefined}
            />
          )}
        />

        <Input
          {...form.register("middleName")}
          label={t("admin.players.create_dialog.fields.middle_name")}
          error={
            form.formState.errors.middleName
              ? t(form.formState.errors.middleName.message as string)
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          value={country || "ru"}
          onValueChange={(newCountry: string) => {
            form.setValue("birthPlaceCountry", newCountry);
          }}
        >
          <SelectLabel>
            {t("admin.players.create_dialog.fields.country")}
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
          {...form.register("birthPlaceCity")}
          label={t("admin.players.create_dialog.fields.city")}
          error={
            form.formState.errors.birthPlaceCity
              ? t(form.formState.errors.birthPlaceCity.message as string)
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="gender"
          control={form.control}
          render={({ field, fieldState }) => (
            <div>
              <label className="block text-sm text-[#787878] font-semibold mb-2">
                {t("admin.players.create_dialog.fields.gender", "Пол")}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="male"
                    checked={field.value === 'male'}
                    onChange={() => field.onChange('male')}
                    className="mr-2"
                  />
                  {t("admin.players.create_dialog.fields.gender_male", "Мужской")}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="female"
                    checked={field.value === 'female'}
                    onChange={() => field.onChange('female')}
                    className="mr-2"
                  />
                  {t("admin.players.create_dialog.fields.gender_female", "Женский")}
                </label>
              </div>
              {fieldState.error && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />

        <Input
          {...form.register("number")}
          label={t("admin.players.create_dialog.fields.number")}
          error={
            form.formState.errors.number
              ? t(form.formState.errors.number.message as string)
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          {...form.register("description")}
          label={t("admin.players.create_dialog.fields.description")}
          placeholder={t("admin.players.create_dialog.fields.description_placeholder")}
          error={
            form.formState.errors.birthPlaceCity
              ? t(form.formState.errors.birthPlaceCity.message as string)
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
