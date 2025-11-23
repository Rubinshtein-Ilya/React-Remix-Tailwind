import type { TFunction } from "i18next";

export const getTimeLeft = (
  expirationDate: Date | null | undefined,
  t: TFunction
): { time: string; color: string } | null => {
  let color: string = "text-gray-400";
  let time: string = t("productCard.expired");
  if (!expirationDate) return null;

  const diff = expirationDate.getTime() - Date.now();

  if (diff <= 0) return { time, color };

  const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

  time =
    daysLeft > 0
      ? `${daysLeft}${t("time.days_short")} : ${hoursLeft}${t(
          "time.hours_short"
        )} : ${minutesLeft}${t("time.minutes_short")}`
      : `${hoursLeft}${t("time.hours_short")} : ${minutesLeft}${t(
          "time.minutes_short"
        )} : ${secondsLeft}${t("time.seconds_short")}`;

  const getColor = () => {
    if (daysLeft >= 1) return "text-black";
    if (daysLeft < 1 && hoursLeft >= 3) return "text-[#F9B234]";
    return "text-[#7B1429]";
  };

  color = getColor();

  return { time, color };
};

/**
 * Форматирует дату в читаемый формат в зависимости от локали
 * @param date - дата для форматирования (строка или объект Date)
 * @param locale - код локали (ru, en)
 * @returns отформатированная дата
 */
export const formatDate = (date: string | Date, locale: string = "ru"): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  // Проверяем, валидна ли дата
  if (isNaN(dateObj.getTime())) {
    return "";
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  };
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};
