import ModalContainer from "~/shared/modal/ModalContainer";
import type { TStep, IBetData } from "./BetModals";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton } from "~/shared/buttons/AppButton";
import { useTranslation } from "react-i18next";
import { getTimeLeft } from "~/utils/dateUtils";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "~/queries/auth";
import { LoginModal } from "~/components/Dialogs/LoginModal";
import { useNavigate } from "react-router";
import { usePlaceBid } from "~/queries/user";
import { useNotifications } from "~/hooks/useNotifications";
import { useQueryClient } from "@tanstack/react-query";
import { useItemDeliveryTariffs } from "../../../queries/delivery";
import { createPortal } from "react-dom";

interface IProps {
  onClose: () => void;
  setStep: (step: TStep) => void;
  betData: IBetData;
}

function ConfirmABet({ onClose, setStep, betData }: IProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const placeBidMutation = usePlaceBid();
  const notifications = useNotifications();
  const queryClient = useQueryClient();
  const { time, color } = getTimeLeft(new Date(betData.expiredAt), t) || {
    time: t("productCard.expired"),
    color: "text-red-200",
  };
  const [timeLeft, setTimeLeft] = useState(time);
  const [timeColor, setTimeColor] = useState(color);

  useEffect(() => {
    if (betData.expiredAt) {
      const timer = setInterval(() => {
        const { time, color } = getTimeLeft(new Date(betData.expiredAt), t) || {
          time: t("productCard.expired"),
          color: "text-red-200",
        };
        setTimeLeft(time);
        setTimeColor(color);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [betData.expiredAt, t]);
  // Валидация формы с Zod
  const betFormSchema = z.object({
    agreement: z.boolean().optional(),
  });

  type BetFormData = z.infer<typeof betFormSchema>;
  const {
    register,
    handleSubmit,
    formState: { isValid },
    watch,
  } = useForm<BetFormData>({
    resolver: zodResolver(betFormSchema),
    defaultValues: {
      agreement: false,
    },
    mode: "onChange",
  });

  // Проверяем авторизацию и верификацию пользователя
  const isUserLoggedIn = !!user;
  const isUserFullyVerified = user?.verification
    ? user.verification.step1Completed &&
      user.verification.step2Completed &&
      user.verification.step3Completed &&
      user.verification.step4Completed
    : false;

  const canPlaceBet = isUserLoggedIn && isUserFullyVerified;

  // Обработка отправки формы
  const onSubmit = async (data: BetFormData) => {
    if (!canPlaceBet) return;

    try {
      const result = await placeBidMutation.mutateAsync({
        itemId: betData.itemId,
        size: betData.size || "M", // получаем из betData или используем дефолтный размер
        price: betData.betAmount,
        message: t("bet_modals.default_bid_message", "Ставка через аукцион"),
        agreeToMarketing: data.agreement || false, // передаем согласие на маркетинг
      });

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["item", betData.itemId] });
        queryClient.invalidateQueries({
          queryKey: ["item-bids", betData.itemId],
        });
        setStep("bet_success");
        notifications.showSuccess(
          t("bet_modals.bid_placed_success", "Ставка успешно размещена")
        );
      } else {
        notifications.showError(
          result.message ||
            t("bet_modals.bid_placement_error", "Ошибка размещения ставки")
        );
      }
    } catch (error: any) {
      console.error("Bid placement error:", error);
      notifications.showError(
        error.message ||
          t("bet_modals.bid_placement_error", "Ошибка размещения ставки")
      );
    }
  };

  // Расчет всех стоимостей
  const { data: deliveryTariffs } = useItemDeliveryTariffs(
    user?.addresses?.find((address) => address.isDefault)?._id,
    betData.item._id
  );

  const deliveryCost = deliveryTariffs
    ? Math.min(
        ...(deliveryTariffs?.map((tariff: any) => tariff.delivery_sum) || [])
      )
    : 1000;
  const serviceFee = Math.ceil(betData.betAmount * 0.1); // 10% комиссия
  const totalCost = betData.betAmount + deliveryCost + serviceFee;

  const pricesInfo = {
    [betData.productName || "Название товара"]: `${new Intl.NumberFormat(
      i18n.language
    ).format(betData.betAmount)} ₽`,
    [t("bet_modals.delivery_cost")]: `${new Intl.NumberFormat(
      i18n.language
    ).format(deliveryCost)} ₽`,
    [t("bet_modals.service_fee")]: `${new Intl.NumberFormat(
      i18n.language
    ).format(serviceFee)} ₽`,
    [t("bet_modals.total")]: `${new Intl.NumberFormat(i18n.language).format(
      totalCost
    )} ₽`,
  };

  // Дата завершения аукциона
  const auctionEndDate = new Intl.DateTimeFormat(i18n.language, {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(betData.expiredAt);

  // Компонент для отображения сообщения о необходимости авторизации/верификации
  const renderAuthRequiredMessage = () => {
    if (!isUserLoggedIn) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-red-800 font-semibold text-[14px]">
              {t("bet_modals.auth_required_title", "Требуется авторизация")}
            </h3>
          </div>
          <p className="text-red-700 mb-3 text-[12px]">
            {t(
              "bet_modals.auth_required_message",
              "Для участия в аукционе необходимо войти в систему или зарегистрироваться."
            )}
          </p>
          <div className="flex gap-2">
            <AppButton
              variant="secondary"
              size="sm"
              onClick={() => setIsLoginModalOpen(true)}
            >
              {t("bet_modals.login_button", "Войти")}
            </AppButton>
          </div>
        </div>
      );
    }

    if (!isUserFullyVerified) {
      const completedSteps = [
        user?.verification?.step1Completed,
        user?.verification?.step2Completed,
        user?.verification?.step3Completed,
        user?.verification?.step4Completed,
      ].filter(Boolean).length;

      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <svg
              className="w-5 h-5 text-amber-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-amber-800 font-semibold text-[14px]">
              {t(
                "bet_modals.verification_required_title",
                "Требуется верификация"
              )}
            </h3>
          </div>
          <p className="text-amber-700 mb-3 text-[12px]">
            {t(
              "bet_modals.verification_required_message",
              "Для участия в аукционе необходимо пройти все 4 шага верификации. Завершено: {{completed}} из 4 шагов.",
              {
                completed: completedSteps,
              }
            )}
          </p>
          <AppButton
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose();
              navigate("/profile");
            }}
          >
            {t("bet_modals.go_to_verification", "Пройти верификацию")}
          </AppButton>
        </div>
      );
    }

    return null;
  };

  return createPortal(
    <ModalContainer
      heading={t("bet_modals.confirm_bet_title")}
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full text-3.75 font-medium leading-4 tracking-[-2%]"
      >
        {/* Информация о товаре */}
        <div className="flex items-center gap-5.75 pb-3.5 border-b border-[var(--border-gray)] mb-7">
          <div className="bg-white rounded-lg w-32.5 h-40.75 overflow-hidden">
            <img
              src={betData.productImage || "/images/products/cafu-tshirt.png"}
              alt="product image"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-3 font-normal text-[14px]">
            <div className="flex flex-col">
              <span>{betData.productName || "Название товара"}</span>
              <span>
                {new Intl.NumberFormat(i18n.language).format(
                  betData.currentBet
                )}{" "}
                ₽ ({t("bet_modals.current_bet_label")})
              </span>
              <span>
                {t("bet_modals.next_min_bet", {
                  amount: new Intl.NumberFormat(i18n.language).format(
                    betData.minNextBet
                  ),
                })}
              </span>
            </div>
            <div className="flex flex-col">
              <span>{t("bet_modals.time_left")}</span>
              <span className={timeColor}>{timeLeft}</span>
            </div>
            <div className="flex flex-col">
              <span>{t("bet_modals.auction_end")}</span>
              <span>{auctionEndDate}</span>
            </div>
          </div>
        </div>

        {/* Сообщение о необходимости авторизации/верификации */}
        {renderAuthRequiredMessage()}

        {/* prices */}
        <div className="w-full flex flex-col gap-1 border-b border-[var(--border-gray)] pb-4 mb-6">
          {Object.entries(pricesInfo).map(([key, value], index) => (
            <div
              key={key}
              className={clsx("flex justify-between text-[14px]", {
                "pt-4": index === Object.keys(pricesInfo).length - 1,
              })}
            >
              <span>{key}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>

        {/* info */}
        <div className="pb-4.75">
          <p className="text-[14px] leading-4.5 font-normal">
            {t("bet_modals.bet_confirmation_text", {
              amount: new Intl.NumberFormat(i18n.language).format(
                betData.betAmount
              ),
            })}
            {t("bet_modals.all_bets_final")}
            {t("bet_modals.last_5_minutes_note")}
            <br />
            <br />

            <span
              dangerouslySetInnerHTML={{
                __html: t("bet_modals.auction_rules_note")
                  .replace(
                    "<offer>",
                    '<a href="/legal/offer" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">'
                  )
                  .replace("</offer>", "</a>")
                  .replace(
                    "<rules>",
                    '<a href="/legal/auction-rules" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">'
                  )
                  .replace("</rules>", "</a>"),
              }}
            />
            <br />
            <br />
            <strong>{t("bet_modals.note_about_win")}</strong>
            <br />
            <br />
            <span
              dangerouslySetInnerHTML={{
                __html: t("bet_modals.additional_info_in_faq")
                  .replace(
                    "<link>",
                    '<a href="/faq" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">'
                  )
                  .replace("</link>", "</a>"),
              }}
            />
          </p>
        </div>

        {/* agreement */}
        <div className="mb-4 flex items-start gap-3">
          <input
            type="checkbox"
            id="agreement"
            {...register("agreement")}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label
            htmlFor="agreement"
            className="text-[12px] text-[var(--text-primary)] font-normal leading-4 tracking-[-2%]"
            dangerouslySetInnerHTML={{
              __html: t("bet_modals.validation.agree_to_marketing"),
            }}
          />
        </div>

        {/* Индикатор загрузки */}
        {placeBidMutation.isPending && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-600 text-sm font-medium">
              {t("bet_modals.placing_bid", "Размещение ставки...")}
            </p>
          </div>
        )}

        {/* btn */}
        <div className="pt-6.5">
          <AppButton
            type="submit"
            variant="secondary"
            className=" h-10.25"
            disabled={!isValid || placeBidMutation.isPending || !canPlaceBet}
          >
            <span className="text-xs sm:text-base">
              {placeBidMutation.isPending
                ? t("bet_modals.placing_bid", "Размещение ставки...")
                : !canPlaceBet
                ? !isUserLoggedIn
                  ? t("bet_modals.login_required", "Необходимо войти в систему")
                  : t(
                      "bet_modals.verification_required",
                      "Необходимо пройти верификацию"
                    )
                : t("bet_modals.agree_to_bet")}
            </span>
          </AppButton>
        </div>
      </form>

      {/* Модальное окно входа */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        shouldRedirectToProfile={false}
      />
    </ModalContainer>,
    document.body
  );
}

export default ConfirmABet;
