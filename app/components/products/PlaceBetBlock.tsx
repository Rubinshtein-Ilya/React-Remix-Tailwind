import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton } from "~/shared/buttons/AppButton";
import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTimeLeft } from "~/utils/dateUtils";
import BetModals from "../Dialogs/betModals/BetModals";
import { useItemDeliveryTariffs } from "~/queries/delivery";
import { useUser } from "~/queries/auth";
import type { IItem } from "server/models/Item";
import { cn } from "~/lib/utils";

interface IProps {
  expiredAt: Date;
  maxBet: number;
  productName?: string;
  productImage?: string;
  itemId: string;
  size: string;
  item: IItem;
  lastBetName?: string;
}

function PlaceBetBlock({
  expiredAt,
  maxBet,
  productName,
  productImage,
  itemId,
  size,
  item,
  lastBetName,
}: IProps) {
  const { t, i18n } = useTranslation();
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [showCostDetails, setShowCostDetails] = useState(false);
  const { time, color } = getTimeLeft(new Date(expiredAt), t) || {
    time: t("productCard.expired"),
    color: "text-red-200",
  };
  const [timeLeft, setTimeLeft] = useState(time);
  const [timeColor, setTimeColor] = useState(color);

  // Проверяем, является ли это первой ставкой
  const isFirstBet = !lastBetName;

  useEffect(() => {
    if (expiredAt) {
      const timer = setInterval(() => {
        const { time, color } = getTimeLeft(new Date(expiredAt), t) || {
          time: t("productCard.expired"),
          color: "text-red-200",
        };
        setTimeLeft(time);
        setTimeColor(color);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [expiredAt, t]);

  const stepAmount = useMemo(() => {
    if (maxBet < 5_000) return 250;
    if (maxBet < 10_000) return 500;
    if (maxBet < 20_000) return 1_000;
    if (maxBet < 30_000) return 2_000;
    if (maxBet < 50_000) return 3_000;
    if (maxBet < 100_000) return 5_000;
    if (maxBet >= 1_000_000) return 100_000;

    // Для сумм от 100_000: базовые 10_000 + по 10_000 за каждые полные 100_000
    const hundredThousandsCount = Math.floor(maxBet / 100_000);
    return 10_000 * hundredThousandsCount;
  }, [maxBet]);

  // Создаём схему валидации с переводами
  const betSchema = z.object({
    betAmount: z
      .number({
        required_error: t("bet_block.validation.amount_required"),
        invalid_type_error: t("bet_block.validation.amount_required"),
      })
      .positive({
        message: t("bet_block.validation.amount_positive"),
      })
      .min(isFirstBet ? maxBet : maxBet + stepAmount, {
        message: t("bet_block.validation.amount_min", {
          min: isFirstBet ? maxBet : maxBet,
        }),
      }),
  });

  type BetFormData = z.infer<typeof betSchema>;

  const {
    register,
    setValue,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm<BetFormData>({
    resolver: zodResolver(betSchema),
    mode: "onChange",
    defaultValues: {
      betAmount: isFirstBet ? maxBet : maxBet + stepAmount,
    },
  });

  const incrementBetAmount = () => {
    const currentAmount = getValues("betAmount") || 0;
    setValue("betAmount", currentAmount + stepAmount, { shouldValidate: true });
  };

  const decrementBetAmount = () => {
    const currentAmount = getValues("betAmount") || 0;
    const newAmount = currentAmount - stepAmount;
    const minBet = isFirstBet ? maxBet : maxBet + 1;
    if (newAmount < minBet) return;
    setValue("betAmount", newAmount, { shouldValidate: true });
  };

  // Расчет всех стоимостей
  const { user } = useUser();
  const { data: deliveryTariffs, isLoading: deliveryLoading } =
    useItemDeliveryTariffs(
      user?.addresses?.find((address) => address.isDefault)?._id,
      item._id
    );

  useEffect(() => {
    setValue("betAmount", isFirstBet ? maxBet : maxBet + stepAmount, {
      shouldValidate: true,
    });
  }, [isFirstBet, maxBet, stepAmount]);

  const deliveryCost = deliveryTariffs
    ? Math.min(...(deliveryTariffs?.map((tariff) => tariff.delivery_sum) || []))
    : 1000;
  const currentBetAmount =
    watch("betAmount") || (isFirstBet ? maxBet : maxBet + stepAmount);
  const serviceFee = Math.ceil(currentBetAmount * 0.1); // 10% комиссия
  const totalCost = currentBetAmount + deliveryCost + serviceFee;

  const isFinished =
    item.salesMethod === "bidding" &&
    new Date(item.endDate || Date.now() + 24 * 60 * 60 * 1000) < new Date();

  return (
    <div className="text-xs sm:text-[1.0625rem] flex flex-col gap-4">
      <div className=" flex flex-col gap-1 pb-2">
        <div className="text-black  font-medium leading-5.5 uppercase">
          {t(isFirstBet ? "bet_block.first_bet" : "bet_block.current_bet")}
        </div>
        <div className="font-medium text-2xl  text-[var(--text-primary)] leading-[100%]">
          {new Intl.NumberFormat(i18n.language).format(maxBet)} ₽
        </div>
        {isFirstBet && !isFinished && (
          <div className="text-xs text-[var(--text-muted)] font-normal leading-4">
            {t("bet_block.no_bets_yet")}
          </div>
        )}
        {!isFinished && (
          <div
            className={cn("font-extrabold leading-5.5 uppercase", timeColor)}
          >
            {timeLeft}
          </div>
        )}
        {isFinished && (
          <div className="pt-4 text-[20px] font-medium leading-5.5 uppercase text-[var(--text-primary)]">
            {t("bet_block.finished")}
            <div className="pt-2 text-[14px] font-normal leading-4 tracking-[-2%] text-[var(--text-muted)]">
              {t("bet_block.wonBy", { name: lastBetName })}
            </div>
          </div>
        )}
      </div>
      {!isFinished && (
        <div className="flex gap-1 items-center justify-start text-[var(--text-primary)]">
          <div className="relative">
            <input
              type="number"
              className={`w-34 h-10 border rounded-lg text-center font-extrabold
          focus:outline-none
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          ${
            errors.betAmount ? "border-red-500" : "border-[var(--text-primary)]"
          }`}
              placeholder={t("bet_block.bet_amount_placeholder", {
                amount: new Intl.NumberFormat(i18n.language).format(
                  isFirstBet ? maxBet : maxBet + stepAmount
                ),
              })}
              {...register("betAmount", { valueAsNumber: true })}
            />
            <div className="absolute right-3 top-0 h-full flex flex-col justify-center">
              <button type="button" onClick={incrementBetAmount}>
                <RiArrowUpSLine size={14} color="var(--text-primary)" />
              </button>
              <button type="button" onClick={decrementBetAmount}>
                <RiArrowDownSLine size={14} color="var(--text-primary)" />
              </button>
            </div>
          </div>

          <button
            className={`w-34 h-10 border  rounded-full  grid place-content-center font-extrabold border-[var(--text-primary)]`}
            onClick={() => {
              const currentAmount = getValues("betAmount") || 0;
              setValue("betAmount", currentAmount + stepAmount, {
                shouldValidate: true,
              });
            }}
          >
            +{new Intl.NumberFormat(i18n.language).format(stepAmount)}
          </button>
          <button
            className={`w-34 h-10 border  rounded-full  grid place-content-center font-extrabold border-[var(--text-primary)]`}
            onClick={() => {
              const currentAmount = getValues("betAmount") || 0;
              setValue("betAmount", currentAmount + stepAmount * 2, {
                shouldValidate: true,
              });
            }}
          >
            +{new Intl.NumberFormat(i18n.language).format(stepAmount * 2)}
          </button>
        </div>
      )}

      {errors.betAmount && !isFinished && (
        <div className="text-red-500 text-sm">{errors.betAmount.message}</div>
      )}

      {!isFinished && (
        <div>
          <AppButton
            variant="secondary"
            onClick={() => setIsBetModalOpen(true)}
            disabled={!isValid}
          >
            {t("bet_block.place_bet")}
          </AppButton>
        </div>
      )}

      {/* Блок с общей суммой и деталями */}
      {!isFinished && (
        <div className="flex flex-col gap-2 w-full">
          {/* Общая сумма с раскрывающимися деталями */}
          <div
            className="flex items-center text-lg font-medium leading-6 cursor-pointer w-full"
            onClick={() => setShowCostDetails(!showCostDetails)}
          >
            {t("bet_modals.total_to_pay", {
              amount: new Intl.NumberFormat(i18n.language).format(totalCost),
            })}
            {showCostDetails ? (
              <RiArrowUpSLine size={24} className="ml-auto" />
            ) : (
              <RiArrowDownSLine size={24} className="ml-auto" />
            )}
          </div>

          {/* Выпадающие детали */}
          {showCostDetails && (
            <div className="w-full flex flex-col gap-1 border border-[var(--border-gray)] rounded-lg p-4 text-[15px] font-normal leading-4 tracking-[-2%]">
              {/* <div className="flex justify-between">
              <span>{productName || "Название товара"}</span>
              <span>{new Intl.NumberFormat(i18n.language).format(currentBetAmount)} ₽</span>
            </div> */}
              <div className="flex justify-between">
                <span>{t("bet_modals.service_fee")}</span>
                <span>
                  {new Intl.NumberFormat(i18n.language).format(serviceFee)} ₽
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("bet_modals.delivery_cost")}</span>
                <span>
                  {new Intl.NumberFormat(i18n.language).format(deliveryCost)} ₽
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-[var(--border-gray)] font-bold">
                <span>{t("bet_modals.total")}</span>
                <span>
                  {new Intl.NumberFormat(i18n.language).format(totalCost)} ₽
                </span>
              </div>
            </div>
          )}

          {/* info */}
          <div className="text-[12px] font-normal leading-5 text-[var(--text-muted)]">
            {t("bet_modals.cost_includes")}
          </div>
        </div>
      )}

      {isBetModalOpen && (
        <BetModals
          onClose={() => setIsBetModalOpen(false)}
          betData={{
            currentBet: maxBet,
            betAmount: currentBetAmount,
            minNextBet: isFirstBet ? maxBet : maxBet + stepAmount,
            expiredAt,
            productName,
            productImage,
            itemId,
            size,
            item,
          }}
        />
      )}
    </div>
  );
}

export default PlaceBetBlock;
