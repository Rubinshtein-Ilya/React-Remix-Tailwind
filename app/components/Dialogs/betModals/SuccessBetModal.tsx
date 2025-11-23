import ModalContainer from "~/shared/modal/ModalContainer";
import { AppButton } from "~/shared/buttons/AppButton";
import { useTranslation } from "react-i18next";
import type { IBetData } from "./BetModals";
import { createPortal } from "react-dom";

interface IProps {
  onClose: () => void;
  betData?: IBetData;
}

function SuccessBetModal({ onClose, betData }: IProps) {
  const { t, i18n } = useTranslation();
  
  return createPortal(
    <ModalContainer imageSrc={"/images/modal/successBetImg.png"} onClose={onClose}>
      <div className="font-medium leading-9 -tracking-[2%] flex flex-col ">
        <div className="text-3xl leading-9 uppercase pb-2.5">
          {t("bet_modals.success_title")}
        </div>
        <div className="text-4.25 leading-5 pb-11.5">
          {betData 
            ? t("bet_modals.success_message", { 
                amount: new Intl.NumberFormat(i18n.language).format(betData.betAmount),
                productName: betData.productName || "Название товара"
              })
            : "В размере 25 000 ₽ на Название товара"
          }
        </div>
        <div>
          <AppButton variant="secondary" onClick={onClose}>
            {t("bet_modals.continue_shopping")}
          </AppButton>
        </div>
      </div>
    </ModalContainer>,
    document.body
  );
}

export default SuccessBetModal;
