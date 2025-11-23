import { cn } from "~/lib/utils";
import TextAccordion from "./TextAccordion";

interface IProps {
  title: string;
  descr: string[];
  info?: string;
  btnMoreText?: string;
  isImage?: boolean;
  image?: string;
  titleStyles?: string;
  imgStyles?: string;
}

function InfoBlock({ ...props }: IProps) {
  const { title, descr, info, btnMoreText, isImage = true, image, titleStyles, imgStyles } = props;
  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "text-lg sm:text-2xl text-[var(--text-primary)] font-medium uppercase mb-3",
          titleStyles
        )}
      >
        {title}
      </div>
      <div className="flex items-center gap-5.5 mb-1">
        {isImage && (
          <div className="w-20 h-21.5 sm:max-w-32.5 sm:max-h-36 rounded-lg overflow-hidden shrink-0 grid content-center bg-white">
            <img
              src={image || "/images/products/1.png"}
              alt="info block image"
              className={imgStyles}
            />
          </div>
        )}
        <div className="flex flex-col gap-1 sm:gap-2 text-sm sm:text-base text-[var(--text-primary)] font-light">
          {descr.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </div>
      {info && btnMoreText && (
        <TextAccordion text={info} btnMoreText={btnMoreText} btnLessText="Скрыть" />
      )}
    </div>
  );
}

export default InfoBlock;
