import clsx from "clsx";

interface IProps {
  text: string;
  style?: string;
  onClick?: () => void;
  disabled?: boolean;
}

function ModalBtn({ ...props }: IProps) {
  const { text, style, onClick, disabled = false } = props;

  return (
    <button
      className={clsx(
        "flex w-fit text-nowrap  items-center  uppercase text-4.25 font-medium  px-10.75 py-2 rounded-full bg-[var(--bg-attention)]",
        style,
        { grayscale: disabled }
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

export default ModalBtn;
