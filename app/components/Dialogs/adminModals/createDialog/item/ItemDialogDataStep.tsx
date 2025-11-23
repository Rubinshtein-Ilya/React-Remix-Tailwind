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
  SelectLabel,
} from "~/shared/ui/Select";
import { z } from "zod";
import { useItemLabels, useItemTypes, useSports } from "~/queries/public";
import { useAdminEvents } from "~/queries/admin";
import { AppButton } from "~/shared/buttons/AppButton";

const SalesMethodArray = ["bidding", "fixed"] as const;

// Схема для валидации формы (с датами как строки)
const createItemFormSchema = z
  .object({
    sportId: z
      .string()
      .min(1, "admin.items.create_dialog.errors.sport_id_required"),
    type: z.string().min(1, "admin.items.create_dialog.errors.type_required"),
    title: z.string().min(1, "admin.items.create_dialog.errors.title_required"),
    description: z
      .string()
      .min(10, "admin.items.create_dialog.errors.description_required"),
    weight: z
      .number({ message: "admin.items.create_dialog.errors.weight_required" })
      .min(1),
    length: z
      .number({ message: "admin.items.create_dialog.errors.length_required" })
      .min(1),
    width: z
      .number({ message: "admin.items.create_dialog.errors.width_required" })
      .min(1),
    height: z
      .number({ message: "admin.items.create_dialog.errors.height_required" })
      .min(1),
    salesMethod: z.enum(SalesMethodArray),
    price: z
      .number({ message: "admin.items.create_dialog.errors.price_required" })
      .min(1),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    labels: z.array(z.string()),
    teamId: z.string().optional(),
    playerId: z.string().optional(),
    eventId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.salesMethod === "bidding") {
        return data.startDate && data.endDate;
      }
      return true;
    },
    {
      message: "admin.items.create_dialog.errors.dates_required_for_bidding",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      if (data.salesMethod === "bidding" && data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: "admin.items.create_dialog.errors.end_date_after_start_date",
      path: ["endDate"],
    }
  );

// Схема для результата (с датами как числа)
export const createItemSchema = createItemFormSchema.transform((data) => ({
  ...data,
  startDate: data.startDate ? new Date(data.startDate).getTime() : undefined,
  endDate: data.endDate ? new Date(data.endDate).getTime() : undefined,
}));

export type CreateItemFormType = z.infer<typeof createItemFormSchema>;

type Props = {
  defaultValues: CreateItemFormType;
  next: (fields: CreateItemFormType) => void;
  back: () => void;
};

export const ItemDialogDataStep: FC<Props> = ({
  defaultValues,
  next,
  back,
}) => {
  const { t } = useTranslation();

  const { data: sports } = useSports();
  const { data: allLabels } = useItemLabels();
  const {
    data: itemTypesMap,
    isLoading: isLoadingTypes,
    isFetching: isFetchingTypes,
  } = useItemTypes();
  const { data: eventsData } = useAdminEvents({});

  const form = useForm<CreateItemFormType>({
    resolver: zodResolver(createItemFormSchema),
    mode: "onChange",
    defaultValues,
  });

  const handleSubmit = (data: CreateItemFormType) => {
    console.log("Next with: ", data);
    next(data);
  };

  const labels = form.watch("labels");
  const sportId = form.watch("sportId");
  const type = form.watch("type");
  const salesMethod = form.watch("salesMethod");

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          value={sportId}
          onValueChange={(value: string) => {
            form.setValue("sportId", value, { shouldValidate: true });
            form.setValue("type", "");
          }}
        >
          <SelectLabel>
            {t("admin.items.create_dialog.fields.sport_id")}
          </SelectLabel>
          <SelectTrigger className="w-28">
            <SelectValue>
              <p className="text-[#121212] text-base">
                {sportId.length
                  ? sports?.find((s) => s._id === sportId)?.name
                  : t("admin.items.create_dialog.fields.sport_id_placeholder")}
              </p>
            </SelectValue>
          </SelectTrigger>
          {sports ? (
            <SelectContent>
              <SelectItem value="">
                {t("admin.items.create_dialog.fields.sport_id_placeholder")}
              </SelectItem>
              {sports
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(({ _id, name }) => (
                  <SelectItem key={_id} value={_id}>
                    {name}
                  </SelectItem>
                ))}
            </SelectContent>
          ) : null}
        </Select>

        <Select
          disabled={!sportId || sportId.length < 1}
          value={type}
          onValueChange={(value: string) => {
            form.setValue("type", value, { shouldValidate: true });
          }}
        >
          <SelectLabel>
            {t("admin.items.create_dialog.fields.type")}
          </SelectLabel>
          <SelectTrigger className="w-28">
            <SelectValue>
              <p className="text-[#121212] text-base">
                {(sportId.length &&
                  type &&
                  itemTypesMap &&
                  itemTypesMap[sportId]?.find((p) => p._id === type)?.name) ||
                  t("admin.items.create_dialog.fields.type_placeholder")}
              </p>
            </SelectValue>
          </SelectTrigger>
          {sportId.length &&
          itemTypesMap &&
          !isLoadingTypes &&
          !isFetchingTypes ? (
            <SelectContent>
              <SelectItem value="">
                {t("admin.items.create_dialog.fields.type_placeholder")}
              </SelectItem>
              {itemTypesMap[sportId]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(({ _id, name }) => (
                  <SelectItem key={_id} value={_id}>
                    {name}
                  </SelectItem>
                ))}
            </SelectContent>
          ) : null}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...form.register("title")}
          placeholder={t("admin.items.create_dialog.fields.title_placeholder")}
          label={t("admin.items.create_dialog.fields.title")}
          error={
            form.formState.errors.title
              ? t(form.formState.errors.title.message as string)
              : undefined
          }
        />

        <Input
          {...form.register("price", {
            valueAsNumber: true,
          })}
          placeholder="3999"
          label={t("admin.items.create_dialog.fields.price")}
          error={
            form.formState.errors.price
              ? t(form.formState.errors.price.message as string)
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          {...form.register("description")}
          placeholder={t(
            "admin.items.create_dialog.fields.description_placeholder"
          )}
          label={t("admin.items.create_dialog.fields.description")}
          error={
            form.formState.errors.description
              ? t(form.formState.errors.description.message as string)
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Controller
          name="salesMethod"
          control={form.control}
          render={({ field, fieldState }) => (
            <div>
              <label className="block text-sm text-[#787878] font-semibold mb-2">
                {t("admin.items.create_dialog.fields.sales_method")}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="male"
                    checked={field.value === "fixed"}
                    onChange={() => field.onChange("fixed")}
                    className="mr-2"
                  />
                  {t("admin.items.create_dialog.fields.sales_method_fixed")}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="male"
                    checked={field.value === "bidding"}
                    onChange={() => field.onChange("bidding")}
                    className="mr-2"
                  />
                  {t("admin.items.create_dialog.fields.sales_method_bidding")}
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...form.register("weight", {
            valueAsNumber: true,
          })}
          label={t("admin.items.create_dialog.fields.weight")}
          error={
            form.formState.errors.weight
              ? t(form.formState.errors.weight.message as string)
              : undefined
          }
        />
        <Input
          {...form.register("length", {
            valueAsNumber: true,
          })}
          label={t("admin.items.create_dialog.fields.length")}
          error={
            form.formState.errors.length
              ? t(form.formState.errors.length.message as string)
              : undefined
          }
        />
        <Input
          {...form.register("width", {
            valueAsNumber: true,
          })}
          label={t("admin.items.create_dialog.fields.width")}
          error={
            form.formState.errors.width
              ? t(form.formState.errors.width.message as string)
              : undefined
          }
        />
        <Input
          {...form.register("height", {
            valueAsNumber: true,
          })}
          label={t("admin.items.create_dialog.fields.height")}
          error={
            form.formState.errors.height
              ? t(form.formState.errors.height.message as string)
              : undefined
          }
        />
      </div>

      {salesMethod === "bidding" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="startDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                type="datetime-local"
                label={t("admin.items.create_dialog.fields.start_date")}
                error={
                  fieldState.error
                    ? t(fieldState.error.message as string)
                    : undefined
                }
              />
            )}
          />

          <Controller
            name="endDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                type="datetime-local"
                label={t("admin.items.create_dialog.fields.end_date")}
                error={
                  fieldState.error
                    ? t(fieldState.error.message as string)
                    : undefined
                }
              />
            )}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          {...form.register("teamId")}
          placeholder={t("admin.items.create_dialog.fields.team_id_placeholder")}
          label={t("admin.items.create_dialog.fields.team_id")}
        />

        <Input
          {...form.register("playerId")}
          placeholder={t("admin.items.create_dialog.fields.player_id_placeholder")}
          label={t("admin.items.create_dialog.fields.player_id")}
        />

        <Select
          value={form.watch("eventId") || ""}
          onValueChange={(value: string) => {
            form.setValue("eventId", value === "" ? undefined : value, { shouldValidate: true });
          }}
        >
          <SelectLabel>
            {t("admin.items.create_dialog.fields.event_id")}
          </SelectLabel>
          <SelectTrigger className="w-28">
            <SelectValue>
              <p className="text-[#121212] text-base">
                {form.watch("eventId") 
                  ? eventsData?.pages.flatMap(page => page.events).find(e => e._id === form.watch("eventId"))?.name ||
                    form.watch("eventId")
                  : t("admin.items.create_dialog.fields.event_id_placeholder")}
              </p>
            </SelectValue>
          </SelectTrigger>
          {eventsData ? (
            <SelectContent>
              <SelectItem value="">
                {t("admin.items.create_dialog.fields.event_id_placeholder")}
              </SelectItem>
              {eventsData.pages
                .flatMap(page => page.events)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((event) => (
                  <SelectItem key={event._id} value={event._id}>
                    {event.name}
                  </SelectItem>
                ))}
            </SelectContent>
          ) : null}
        </Select>
      </div>

      <div>
        <label className="block text-sm text-[#787878] font-semibold mb-2">
          {t("admin.items.create_dialog.fields.labels")}
        </label>
        {allLabels && (
          <div className="flex flex-wrap gap-2">
            {allLabels.map(({ _id, name }) => {
              const isSelected = labels.includes(_id);

              return (
                <AppButton
                  key={_id}
                  type="button"
                  fullWidth={false}
                  className="text-nowrap"
                  variant={isSelected ? "secondary" : "primary"}
                  onClick={() => {
                    if (isSelected) {
                      form.setValue(
                        "labels",
                        labels.filter((l) => l !== _id),
                        {
                          shouldValidate: false,
                        }
                      );
                    } else {
                      form.setValue("labels", [...labels, _id], {
                        shouldValidate: false,
                      });
                    }
                  }}
                  size="sm"
                >
                  {name.ru}
                </AppButton>
              );
            })}
          </div>
        )}
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
};
