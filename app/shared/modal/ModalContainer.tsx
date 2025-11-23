import { RiCloseLargeLine } from "@remixicon/react";
import { useEffect, type ReactNode } from "react";
import clsx from "clsx";
interface IProps {
  modalStyles?: string;
  children: ReactNode;
  heading?: string;
  contentStyles?: string;
  imageSrc?: string;
  onClose: () => void;
}

function ModalContainer({ ...props }: IProps) {
  const { modalStyles, children, heading, contentStyles, imageSrc, onClose } = props;

  useEffect(() => {
    const overflowValue = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = overflowValue;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 " onClick={onClose}></div>
      <div className="absolute inset-0 overflow-y-auto py-10 w-full h-full flex items-start justify-center text-[var(--text-primary)] ">
        <div
          className={clsx("bg-[var(--bg-gray)] rounded-lg w-126 z-60 ", {
            modalStyles,
          })}
        >
          {/* heading */}
          {heading && (
            <div className="pt-9.25 px-10 flex items-center justify-between">
              <div className="text-xl sm:text-3xl font-medium leading-9 -tracking-[2%] uppercase">
                {heading}
              </div>

              <button className="text-2xl font-bold" aria-label="close" onClick={onClose}>
                <RiCloseLargeLine size={24} color="var(--text-primary)" />
              </button>
            </div>
          )}
          {imageSrc && (
            <div className="w-full h-fit relative">
              <img src={imageSrc} alt="modal-bg" className="w-full h-full object-cover" />
              <button
                className="text-2xl font-bold absolute top-11.25 right-10"
                aria-label="close"
                onClick={onClose}
              >
                <RiCloseLargeLine size={24} color="var(--text-primary)" />
              </button>
            </div>
          )}
          {/* content */}
          <div className={clsx("pt-6.25 pb-11 px-10 ", contentStyles)}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default ModalContainer;
