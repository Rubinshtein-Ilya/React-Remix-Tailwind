import React, { type FC } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Input } from "~/shared/inputs/Input";
import { AppButton } from "~/shared/buttons/AppButton";
import {
  type AllowedSizes,
  SizeKeysAlphabet,
  SizeKeysArray,
  SizeKeysFixed,
  SizeKeysNumeric
} from "../../../../../../server/models/shared/StockBySizeSchema";

const sizeTypeMap = {
  numeric: SizeKeysNumeric,
  alphabet: SizeKeysAlphabet,
  fixed: SizeKeysFixed,
} as const;

type SizeType = keyof typeof sizeTypeMap;

type FormValues = {
  sizeTypes: SizeType[];
  stockBySize: Partial<Record<AllowedSizes, number>>;
};

type StockAndLabelsType = {
  stock: Record<string, number>;
}

type Props = {
  defaultValues: StockAndLabelsType;
  next: (fields: StockAndLabelsType) => void;
  back: () => void;
}

export const ItemDialogStockAndLabelsStep: FC<Props> = ({ defaultValues, next, back }) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    formState,
  } = useForm<FormValues>({
    defaultValues: {
      sizeTypes: ["alphabet"],
      stockBySize: {
        ...Object.fromEntries(SizeKeysArray.map(key => ([ key, 0 ]))),
        ...defaultValues.stock
      },
    },
  });

  const sizeTypes = watch("sizeTypes");

  const activeSizes = Array.from(
    new Set(
      sizeTypes.flatMap((type) => sizeTypeMap[type])
    )
  );

  const onSubmit = (data: FormValues) => {
    const res = {
      stock: Object.fromEntries(
        Object.entries(data.stockBySize)
          .filter(([_, v]) => v > 0)
      )
    }

    console.log("Next with: ", res);
    next(res);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Size Type Selector */}

      <div>
        <label className="block text-sm text-[#787878] font-semibold mb-2">
          {t("admin.items.create_dialog.fields.size_type")}
        </label>
        <div className="flex flex-wrap gap-4">
          {Object.keys(sizeTypeMap).map((type) => (
            <label key={type} className="flex items-center space-x-2">
              <label className="flex items-center">
                <input
                  className="mr-2"
                  type="checkbox"
                  value={type}
                  {...register("sizeTypes")}
                />
                {t(`admin.items.create_dialog.size_types.${type}`)}
              </label>
            </label>
          ))}
        </div>
      </div>

      {/* Stock Inputs */}
      {activeSizes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {activeSizes.map((size) => (
            <Input
              key={size}
              {...register(`stockBySize.${size}` as const, { valueAsNumber: true })}
              placeholder="Stock"
              label={`Размер ${size.toUpperCase()}`}
              error={
                formState.errors.stockBySize?.[size]
                  ? t(formState.errors.stockBySize?.[size]?.message as string)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {formState.errors.root && (
        <p className="text-red-500 text-sm mt-2">
          {formState.errors.root.message}
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
          {t("common.back")}
        </AppButton>

        <AppButton
          type="submit"
          variant="primary"
          className="flex-1"
        >
          {t("common.next")}
        </AppButton>
      </div>
    </form>
  );
}