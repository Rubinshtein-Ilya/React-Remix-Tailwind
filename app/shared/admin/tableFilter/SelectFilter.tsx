import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/shared/ui/Select";
import React from "react";
import type { BaseFilterDescription } from "~/shared/admin/tableFilter/TableFilters";

export interface SelectFilterDescription<K extends string> extends BaseFilterDescription<K> {
  type: "select";
  allLabel: string;
  sortOptions?: "asc" | "desc" | false;
  options: Array<{
    _id: string,
    name: string;
  }>
}

type Props<K extends string> = {
  filterDescription: SelectFilterDescription<K>;
  value: string;
  setValue: ((v: string) => void)
}

export function SelectFilter<K extends string>({ filterDescription, value, setValue }: Props<K>) {
  let options = filterDescription.options;

  if (filterDescription.sortOptions !== false) {
    options = options.sort((a, b) =>
      a.name.localeCompare(b.name) * (filterDescription.sortOptions === "desc" ? -1 : 1),
    )
  }

  return (
    <Select
      className="w-[200px]"
      value={value || ""}
      onValueChange={(value: string) => {
        setValue(value);
      }}
    >
      <SelectLabel>{filterDescription.label}</SelectLabel>
      <SelectTrigger className="w-28 overflow-hidden">
        <SelectValue>
          <p className="text-[#121212] text-base text-nowrap">
            {
              filterDescription.options.find(
                (s) => s._id === value
              )?.name || filterDescription.allLabel
            }
          </p>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">{filterDescription.allLabel}</SelectItem>
        {options.map(({ _id, name }) => (
          <SelectItem key={_id} value={_id}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}