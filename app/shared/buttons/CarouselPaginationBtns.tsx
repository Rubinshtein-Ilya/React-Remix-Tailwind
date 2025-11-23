import { RiArrowLeftLongLine, RiArrowRightLongLine } from "@remixicon/react";

interface IProps {
  canScroll: boolean;
  scrollPrev?: () => void;
  scrollNext?: () => void;
  containerStyles?: string;
  btnBg?: string;
  iconColor?: string;
  size?: "sm" | "md";
}

function CarouselPaginationBtns({ ...props }: IProps) {
  const {
    canScroll,
    scrollPrev,
    scrollNext,
    containerStyles = "flex gap-4",
    btnBg = "bg-black",
    iconColor = "var(--text-secondary)",
    size = "md",
  } = props;

  const buttonSize = size === "sm" ? "w-8 h-8 p-1.5" : "w-10 h-10 p-2";
  const iconSize = size === "sm" ? 16 : 24;

  return (
    <div className={`${containerStyles} ${canScroll ? "opacity-100" : "opacity-0"} transition-opacity`}>
      <button
        className="embla__prev uppercase text-[var(--text-primary)]"
        onClick={scrollPrev}
        disabled={!scrollPrev}
      >
        <div
          className={`${buttonSize} rounded-full  flex items-center justify-center ${btnBg} shadow-md shadow-black/10`}
        >
          <RiArrowLeftLongLine size={iconSize} color={iconColor} />
        </div>
      </button>
      <button
        className="embla__next uppercase text-[var(--text-primary)]"
        onClick={scrollNext}
        disabled={!scrollNext}
      >
        <div
          className={`${buttonSize} rounded-full  flex items-center justify-center ${btnBg} shadow-md shadow-black/10`}
        >
          <RiArrowRightLongLine size={iconSize} color={iconColor} />
        </div>
      </button>
    </div>
  );
}

export default CarouselPaginationBtns;
