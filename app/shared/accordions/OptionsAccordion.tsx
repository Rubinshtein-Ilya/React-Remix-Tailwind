import { useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";

interface IProps {
  options: Record<string, string>;
  title: string;
  btnMoreText: string;
  btnLessText?: string;
}

function OptionsAccordion({ ...props }: IProps) {
  const { options, title, btnMoreText, btnLessText = "Скрыть" } = props;
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  return (
    <div className="flex flex-col gap-2 ">
      <div className="mb-3 text-lg sm:text-2xl text-[var(--text-primary)] font-medium uppercase">
        {title}
      </div>
      {(showMoreDetails ? Object.entries(options) : Object.entries(options).slice(0, 3)).map(
        ([key, value]) => {
          return (
            <div
              className="flex justify-between items-center text-[var(--text-primary)] gap-8"
              key={key}
            >
              <div className="text-sm sm:text-base font-light uppercase">{key}</div>
              <div className="text-sm sm:text-base font-light text-end max-w-[50%]">{value}</div>
            </div>
          );
        }
      )}

      {Object.entries(options).length > 3 && (
        <button
          onClick={() => setShowMoreDetails(!showMoreDetails)}
          className="text-xs sm:text-lg xl:text-xl text-[var(--text-primary)] font-medium uppercase w-fit flex items-center gap-2 mt-1"
        >
          {showMoreDetails ? btnLessText : btnMoreText}
          {showMoreDetails ? <RiArrowUpSLine size={24} /> : <RiArrowDownSLine size={24} />}
        </button>
      )}
    </div>
  );
}

export default OptionsAccordion;
