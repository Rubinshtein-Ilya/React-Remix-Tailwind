import { useState } from "react";
import clsx from "clsx";

const options = [
  { label: "По позиции", value: "position" },
  { label: "По популярности", value: "popularity" },
  { label: "По алфавиту", value: "alphabetical" },
  { label: "По новинкам", value: "newest" },
  { label: "По возрастанию цены", value: "price_asc" },
  { label: "По убыванию цены", value: "price_desc" },
];

interface IProps {
  onSelect: (value: string) => void;
}

function Select({ onSelect }: IProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div
        className="text-xs sm:text-base lg:text-xl text-[var(--text-secondary)] bg-[var(--bg-dark)] font-medium leading-6 uppercase py-1 sm:py-2 px-6 rounded-full cursor-pointer text-nowrap"
        onClick={() => setIsOpen(!isOpen)}
      >
        СОРТИРОВКА ПО
      </div>
      <div
        className={clsx(
          "absolute text-[var(--text-secondary)] bg-[var(--bg-dark)] top-11 left-0 w-full p-1 rounded-[1.25rem] z-40 transition-all duration-500 overflow-hidden",
          {
            "max-h-0 opacity-0": !isOpen,
            "max-h-[2000px] opacity-100": isOpen,
          }
        )}
      >
        <div className="overflow-hidden rounded-[1rem]">
          {options.map((option) => (
            <div
              key={option.value}
              className="text-sm font-medium leading-6 py-1 px-3.5 hover:bg-[#1967D2] cursor-pointer"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Select;
