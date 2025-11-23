import clsx from "clsx";
import { type UseFormRegisterReturn } from "react-hook-form";

interface IProps {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  selectedValues: string[];
  labelStyles?: string;
}

function CustomCheckbox({ ...props }: IProps) {
  const { id, label, register, selectedValues, labelStyles } = props;

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        value={id}
        className="hidden"
        {...register}
      />
      <label
        htmlFor={id}
        className={clsx(
          "text-[15px] text-[var(--text-secondary)] font-normal cursor-pointer flex items-center",
          labelStyles
        )}
      >
        <span
          className={clsx(
            "w-5 h-5 p-0.5 rounded-sm border border-[var(--border-neutral)] shrink-0 inline-flex items-center justify-center mr-2.5 transition-colors duration-200"
          )}
        >
          {selectedValues.includes(id) && (
            <div className="w-full h-full rounded-xs bg-[var(--border-neutral)]" />
          )}
        </span>
        {label}
      </label>
    </div>
  );
}

export default CustomCheckbox;
