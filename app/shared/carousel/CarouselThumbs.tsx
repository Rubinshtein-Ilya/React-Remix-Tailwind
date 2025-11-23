import React from "react";

type PropType = {
  selected: boolean;
  id: number;
  image: string;
  onClick: () => void;
};

export const Thumb: React.FC<PropType> = (props) => {
  const { selected, id, image, onClick } = props;

  return (
    <div
      className={"embla-thumbs__slide box-border text-[var(--text-black)]  h-1/4 cursor-pointer rounded-lg bg-[var(--bg-primary)]".concat(
        selected
          ? " embla-thumbs__slide--selected border-b-4 border-b-[#F9B234]"
          : ""
      )}
      onClick={onClick}
    >
      <button
        type="button"
        className="embla-thumbs__slide__number w-full h-full flex items-center justify-center"
      >
        <img
          src={image}
          alt="product image"
          className="max-w-[80%] max-h-[80%] object-contain"
        />
      </button>
    </div>
  );
};
