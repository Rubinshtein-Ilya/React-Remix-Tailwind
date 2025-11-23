import { useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine, RiImage2Fill } from "@remixicon/react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import type { IItemBid } from "server/models/ItemBid";
import { useUser } from "~/queries/auth";

interface IProps {
  options: IItemBid[];
  title: string;
  btnMoreText: string;
  btnLessText?: string;
}

function BetsAccordion({ ...props }: IProps) {
  const { options, title, btnMoreText, btnLessText = "Скрыть" } = props;
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const { i18n } = useTranslation();
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-2 ">
      <div className=" section-heading mb-3 ">{title}</div>
      {(showMoreDetails ? options : options.slice(0, 3)).map((option) => {
        const isCurrentUser = user?._id === option.userId;
        let name = option.name;
        if (!isCurrentUser) {
          name = `${name.slice(0, 5)}...${name.slice(-5)}`;
        }
        return (
          <div
            className="flex sm:flex-row flex-col text-[var(--text-primary)] justify-start  sm:justify-between items-center"
            key={option.id}
          >
            <div className="flex  items-center justify-start w-full gap-3">
              <div className="w-7 h-7 sm:w-7 sm:h-7 rounded-full overflow-hidden grid place-content-center">
                {/* TODO: add image */}
                {/* {option.user?.image ? (
                  <img
                    src={option.user?.image}
                    alt={option.name}
                    className="w-full h-full object-cover"
                  /> 
                ) : ( */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  viewBox="0 0 33 32"
                  fill="none"
                >
                  <path
                    d="M16.9937 16.9814C16.9007 16.9682 16.7811 16.9682 16.6748 16.9814C14.3366 16.9017 12.4766 14.9886 12.4766 12.637C12.4766 10.2323 14.4163 8.2793 16.8343 8.2793C19.239 8.2793 21.192 10.2323 21.192 12.637C21.1787 14.9886 19.332 16.9017 16.9937 16.9814Z"
                    stroke="#121212"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M25.788 25.751C23.4232 27.9166 20.2878 29.2318 16.8335 29.2318C13.3792 29.2318 10.2438 27.9166 7.87891 25.751C8.01176 24.5021 8.80891 23.2798 10.2305 22.3233C13.8708 19.9053 19.8228 19.9053 23.4365 22.3233C24.858 23.2798 25.6552 24.5021 25.788 25.751Z"
                    stroke="#121212"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.8326 29.2296C24.1701 29.2296 30.1183 23.2814 30.1183 15.9439C30.1183 8.60642 24.1701 2.6582 16.8326 2.6582C9.49509 2.6582 3.54688 8.60642 3.54688 15.9439C3.54688 23.2814 9.49509 29.2296 16.8326 29.2296Z"
                    stroke="#121212"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* )} */}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between w-full ">
                <div className="text-sm sm:text-base text-[var(--text-primary)] font-light">
                  {`${name} // ${format(option.createdAt, "dd MMMM yyyy, HH:mm:ss", {
                    locale: ru,
                  })}`}
                </div>
                <div className="justify-start w-full sm:w-fit text-sm sm:text-base text-[var(--text-primary)] font-medium text-nowrap">
                  {new Intl.NumberFormat(i18n.language).format(option.price)} ₽
                </div>
              </div>
            </div>
            {/* <div className="justify-start w-full sm:w-fit pl-10.5 sm:pl-0 text-xs sm:text-lg  xl:text-xl text-[var(--text-primary)] font-medium text-nowrap">
              {new Intl.NumberFormat(i18n.language).format(option.amount)} ₽
            </div> */}
          </div>
        );
      })}

      {options.length > 3 && (
        <button
          onClick={() => setShowMoreDetails(!showMoreDetails)}
          className="text-xs sm:text-lg  xl:text-xl text-[var(--text-primary)] font-medium uppercase w-fit flex items-center gap-2 mt-1"
        >
          {showMoreDetails ? btnLessText : btnMoreText}
          {showMoreDetails ? <RiArrowUpSLine size={24} /> : <RiArrowDownSLine size={24} />}
        </button>
      )}
    </div>
  );
}

export default BetsAccordion;
