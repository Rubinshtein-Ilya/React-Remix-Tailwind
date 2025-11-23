import { useState, useEffect } from "react";
import ConfirmABet from "./ConfirmABetModal";
import SuccessBetModal from "./SuccessBetModal";
import type { IItem } from "server/models/Item";

export interface IBetData {
  currentBet: number;
  betAmount: number;
  minNextBet: number;
  expiredAt: Date;
  productName?: string;
  productImage?: string;
  itemId: string;
  size?: string;
  item: IItem;
}

interface IProps {
  onClose: () => void;
  betData: IBetData;
}

export type TStep = "confirm_bet" | "bet_success";

function BetModals({ onClose, betData }: IProps) {
  const [step, setStep] = useState<TStep>("confirm_bet");

  // Обработка закрытия по Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const modals: Record<TStep, React.ReactNode> = {
    confirm_bet: <ConfirmABet onClose={onClose} setStep={setStep} betData={betData} />,
    bet_success: <SuccessBetModal onClose={onClose} betData={betData} />,
  };

  return modals[step];
}

export default BetModals;
