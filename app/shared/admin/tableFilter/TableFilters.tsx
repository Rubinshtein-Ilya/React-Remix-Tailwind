import React, { useRef, useState } from "react";
import { Input } from "~/shared/inputs";
import { AppButton } from "~/shared/buttons/AppButton";
import { SelectFilter, type SelectFilterDescription } from "~/shared/admin/tableFilter/SelectFilter";
import { InputFilter, type InputFilterDescription } from "~/shared/admin/tableFilter/InputFilter";
import type { NestedStringOrBooleanPaths } from "~/types/utility";

export function makeQueryString(filter: FilterType<unknown> | undefined) {
  if (!filter) return ""

  const str = Object.entries(filter)
    .filter(([key, value]) => value !== undefined && value.length)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");

  if (str.length) return `?${str}`;
  return "";
}

export type BaseFilterDescription<K extends string> = {
  name: K;
  label: string;
  def: string;
};

type FilterDescription<K extends string> = BaseFilterDescription<K> & (
  | SelectFilterDescription<K>
  | InputFilterDescription<K>
);

export type FilterType<K> = Partial<{
  [P in NestedStringOrBooleanPaths<K>]?: string;
}> & {
  search?: string;
};

type Props<T> = {
  filterDescriptions: Array<FilterDescription<NestedStringOrBooleanPaths<T>>>;
  withSearch?: {
    label: string;
    placeholder: string;
  };
  applyFilter: (filter: FilterType<T>) => void;
};

export function TableFilters<T>({
  filterDescriptions,
  applyFilter,
  withSearch,
}: Props<T>) {
  const [filter, setFilter] = useState<FilterType<T>>({
    search: ""
  });

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  return (
    <div className="flex gap-2 flex-wrap">
      {filterDescriptions.map((filterDescription) => {
        if (filterDescription.type === "select") {
          return (
            <SelectFilter
              key={`select-filter-${filterDescription.name}`}
              filterDescription={filterDescription}
              value={filter[filterDescription.name] || ""}
              setValue={(value) => {
                setFilter((prev) => ({
                  ...prev,
                  [filterDescription.name]: value,
                }));
              }}
            />
          );
        }

        // Optional: input-type filters
        if (filterDescription.type === "input") {
          return (
            <InputFilter
              key={`input-filter-${filterDescription.name}`}
              filterDescription={filterDescription}
              setValue={(value) => {
                setFilter((prev) => ({
                  ...prev,
                  [filterDescription.name]: value,
                }));
              }}
            />
          );
        }

        return null;
      })}

      {withSearch && (
        <div className="w-[200px]">
          <Input
            defaultValue=""
            onChange={(value) => {
              if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
              }

              searchDebounceRef.current = setTimeout(() => {
                setFilter((prev) => ({
                  ...prev,
                  search: value.target.value,
                }));
              }, 300);
            }}
            placeholder={withSearch.placeholder}
            label={withSearch.label}
          />
        </div>
      )}

      <div className="flex">
        <AppButton
          onClick={() => {
            const cleaned = Object.fromEntries(
              Object.entries(filter).filter(([_, v]) => v !== undefined && v.length)
            ) as FilterType<NestedStringOrBooleanPaths<T>>;

            applyFilter(cleaned);
          }}
          className="!h-[47px] px-6 mt-auto"
          fullWidth={false}
          type="button"
          size="sm"
        >
          Применить
        </AppButton>
      </div>
    </div>
  );
}