import { useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";

interface IProps {
  text: string;
  btnMoreText: string;
  btnLessText?: string;
}

function TextAccordion({ ...props }: IProps) {
  const { text, btnMoreText, btnLessText = "Скрыть" } = props;
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <p
        className={`${
          isOpen ? "max-h-[2000px]" : "max-h-[0]"
        } overflow-hidden text-[var(--text-primary)] transition-all duration-500 text-pretty text-xs sm:text-lg font-light`}
      >
        {text}
      </p>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs sm:text-lg xl:text-xl text-[var(--text-primary)] font-medium uppercase w-fit flex items-center gap-2 mt-1"
      >
        {isOpen ? btnLessText : btnMoreText}
        {isOpen ? <RiArrowUpSLine size={24} /> : <RiArrowDownSLine size={24} />}
      </button>
    </>
  );
}

export default TextAccordion;
