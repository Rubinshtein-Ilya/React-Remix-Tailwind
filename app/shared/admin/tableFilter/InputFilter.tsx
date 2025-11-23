import React, { useRef } from "react";
import type { BaseFilterDescription } from "~/shared/admin/tableFilter/TableFilters";
import { Input } from "~/shared/inputs";

export interface InputFilterDescription<K extends string> extends BaseFilterDescription<K> {
  type: "input";
  placeholder?: string;
}

type Props<K extends string> = {
  filterDescription: InputFilterDescription<K>;
  setValue: ((v: string) => void)
}

export function InputFilter<K extends string>({ filterDescription, setValue }: Props<K>) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  return (
    <div className="w-[200px]">
      <Input
        defaultValue=""
        onChange={(value) => {
          if (debounceRef.current) {
            clearTimeout(debounceRef.current);
          }

          debounceRef.current = setTimeout(() => {
            setValue(value.target.value);
          }, 300);
        }}
        placeholder={filterDescription.placeholder}
        label={filterDescription.label}
      />
    </div>
  )
}