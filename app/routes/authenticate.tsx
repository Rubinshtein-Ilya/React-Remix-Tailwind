import React from "react";
import { useSearchParams } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVerifyAuthenticity } from "~/queries/authentication";
import { AppButton } from "~/shared/buttons/AppButton";
import { Input } from "~/shared/inputs/Input";
import nfcPNG from "~/assets/images/nfc.png";
import { Spinner } from "~/shared/Spinner";

// Схема валидации для формы
const verifySchema = z.object({
  serialNumber: z
    .string()
    .min(6, "serial_number_length")
    .max(6, "serial_number_length")
    .regex(/^[A-Z0-9]{6}$/, "serial_number_format"),
});

type VerifyFormData = z.infer<typeof verifySchema>;

const AuthenticatePage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const serial = searchParams.get("serial");
  const tagId = searchParams.get("t");
  const hash = searchParams.get("h");

  // Определяем есть ли параметры для проверки
  const hasVerificationParams = Boolean(serial || (tagId && hash));

  const params = {
    serial: serial || undefined,
    t: tagId || undefined,
    h: hash || undefined,
  };

  const {
    data: result,
    isLoading,
    error,
  } = useVerifyAuthenticity(params, hasVerificationParams);

  // Форма для ввода данных
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    mode: "onChange",
  });

  // Функция для форматирования Serial Number
  const formatSerialNumber = (value: string): string => {
    return value
      .replace(/[^A-Za-z0-9]/g, "") // Убираем все кроме букв и цифр
      .toUpperCase() // Делаем заглавными
      .slice(0, 6); // Ограничиваем длину
  };

  const onSubmit = (data: VerifyFormData) => {
    // Обновляем URL параметры
    const newParams = new URLSearchParams();
    newParams.set("serial", data.serialNumber);
    setSearchParams(newParams);
  };

  // Если есть результат проверки, показываем его
  if (hasVerificationParams && result) {
    return (
      <div className="min-h-screen bg-[var(--bg-gray)] py-16 px-4 mt-16">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок с результатом */}
          <div className="text-center mb-12">
            <h1 className="text-2xl sm:text-[50px] font-medium text-[var(--text-primary)] leading-16 mb-6">
              {result.isAuthentic
                ? t("authenticate.authentic")
                : t("authenticate.not_authentic")}
            </h1>
            <p className="text-sm sm:text-[17px] font-light text-[var(--text-primary)] leading-6">
              {result.message}
            </p>
          </div>

          {/* Информация о предмете */}
          <div className="bg-[var(--bg-primary)] p-8 rounded-lg border border-[var(--border-muted)] mb-6">
            <h3 className="text-2xl sm:text-[30px] font-medium text-[var(--text-primary)] leading-9 mb-8">
              {t("authenticate.item_info")}
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Изображения */}

              {/* @ts-ignore */}
              {(result.itemInfo.thumbnail ||
                (result.itemInfo.images &&
                  result.itemInfo.images.length > 0)) && (
                <img
                  // @ts-ignore
                  src={result.itemInfo.thumbnail || result.itemInfo.images[0]}
                  alt={`${result.itemInfo.title}`}
                  className="w-full h-full object-contain rounded-lg border border-[var(--border-muted)]"
                />
              )}

              {/* Детали */}
              <div className="space-y-6">
                <div>
                  <p className="text-base sm:text-[20px] font-medium text-[var(--text-primary)] leading-7">
                    {result.itemInfo.title}
                  </p>
                </div>

                <div>
                  <h4 className="text-base sm:text-[20px] font-medium text-[var(--text-primary)] mb-2">
                    {t("authenticate.description")}
                  </h4>
                  <p className="text-sm sm:text-[17px] font-light text-[var(--text-primary)] leading-5">
                    {result.itemInfo.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-base sm:text-[20px] font-medium text-[var(--text-primary)] mb-2">
                    {t("authenticate.serial_number")}
                  </h4>
                  <p className="font-mono text-sm sm:text-[17px] bg-[var(--bg-secondary)] px-4 py-2 rounded border border-[var(--border-muted)] text-[var(--text-primary)]">
                    {result.itemInfo.serialNumber}
                  </p>
                </div>

                {/* <div>
                  <h4 className="text-[20px] font-medium text-[var(--text-primary)] mb-2">
                    {t("authenticate.status", "Статус")}
                  </h4>
                  <p className="text-green-600 font-medium text-[17px]">
                    {result.itemInfo.status}
                  </p>
                </div> */}

                <div>
                  <h4 className="text-base sm:text-[20px] font-medium text-[var(--text-primary)] mb-2">
                    ID
                  </h4>
                  <p className="font-mono text-[17px] bg-[var(--bg-secondary)] px-4 py-2 rounded border border-[var(--border-muted)] text-[var(--text-primary)]">
                    {result.itemInfo.itemId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Детали верификации */}
          <div className="bg-[var(--bg-primary)] p-8 rounded-lg border border-[var(--border-muted)]">
            <h3 className="text-2xl sm:text-[30px] font-medium text-[var(--text-primary)] leading-9 mb-8">
              {t("authenticate.verification_details")}
            </h3>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <h4 className="text-base sm:text-[20px] font-medium text-[var(--text-primary)] mb-2">
                    {t("authenticate.verification_time")}
                  </h4>
                  <p className="text-sm sm:text-[17px] font-light text-[var(--text-primary)] leading-5">
                    {new Date(
                      result.verificationDetails.verifiedAt
                    ).toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-base sm:text-[20px] font-medium text-[var(--text-primary)] mb-2">
                    {t("authenticate.verification_type")}
                  </h4>
                  <p className="text-sm sm:text-[17px] font-light text-[var(--text-primary)] leading-5">
                    {t(
                      `authenticate.verification_types.${result.verificationDetails.verificationType}`,
                      result.verificationDetails.verificationType
                    )}
                  </p>
                </div>

                <div>
                  <h4 className="text-base sm:text-[20px] font-medium text-[var(--text-primary)] mb-2">
                    {t("authenticate.security_level")}
                  </h4>
                  <p className="text-[17px] font-light text-[var(--text-primary)] leading-5">
                    {t(
                      `authenticate.security_levels.${result.verificationDetails.securityLevel}`,
                      result.verificationDetails.securityLevel
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {result.verificationDetails.serialValidated && (
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xl">✅</span>
                    <span className="text-sm sm:text-[17px] font-light text-[var(--text-primary)]">
                      {t("authenticate.serial_validated")}
                    </span>
                  </div>
                )}

                {result.verificationDetails.nfcValidated && (
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xl">✅</span>
                    <span className="text-sm sm:text-[17px] font-light text-[var(--text-primary)]">
                      {t("authenticate.nfc_validated")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Кнопка "Проверить другой товар" */}
          <div className="text-center mt-12">
            <AppButton
              onClick={() => {
                setSearchParams(new URLSearchParams());
              }}
              variant="secondary"
              className="px-8 py-3 text-lg"
            >
              {t("authenticate.check_another_product")}
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  // Если идет загрузка
  if (hasVerificationParams && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-gray)] py-16 px-4">
        <Spinner />
      </div>
    );
  }

  // Если есть ошибка
  if (hasVerificationParams && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-gray)] px-4 py-16">
        <div className="max-w-md w-full bg-[var(--bg-primary)] rounded-lg border border-[var(--border-muted)] p-8 text-center">
          <h1 className="text-2xl sm:text-[30px] font-medium text-orange-600 leading-9 mb-6">
            {t("authenticate.verification_failed")}
          </h1>

          <div className="text-[var(--text-primary)] mb-8 space-y-4">
            <p className="text-sm sm:text-[17px] font-light leading-5">
              {t("authenticate.error_explanation")}
            </p>
            <ul className="text-sm sm:text-[17px] font-light text-left space-y-2 leading-5">
              <li>• {t("authenticate.error_invalid_link")}</li>
              <li>• {t("authenticate.error_item_not_found")}</li>
              <li>• {t("authenticate.error_codes_mismatch")}</li>
            </ul>
            <div className="mt-6 p-4 bg-[var(--bg-accent)] rounded-lg border border-[var(--border-muted)]">
              <p className="text-sm sm:text-[17px] text-[var(--text-primary)] font-light leading-5">
                {t("authenticate.support_message")}
              </p>
              <a
                href="mailto:support@fansdream.ru"
                className="text-[var(--button-primary)] font-medium hover:underline text-lg"
              >
                support@fansdream.ru
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <AppButton
              onClick={() => {
                setSearchParams(new URLSearchParams());
              }}
              variant="secondary"
              className="w-full px-6 py-3 text-lg"
            >
              {t("authenticate.check_another_product")}
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  // Основная страница с инструкциями и способами проверки
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-16 px-4 mt-10 sm:mt-20 lg:mt-30 pt-8 sm:pt-12 lg:pt-16">
      <div className="container">
        {/* Заголовок */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl uppercase text-[var(--text-primary)] mb-2 sm:mb-6 text-left">
            {t("authenticate.title")}
          </h1>
          <p className=" text-sm sm:text-base text-[var(--text-primary)] mb-6 text-left">
            <Trans
              i18nKey="authenticate.intro_text"
              components={{
                strong: <strong />,
              }}
            />
          </p>

          <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-2 text-left">
            {t("authenticate.nfc_chips_title")}
          </h2>
          <p className=" text-sm sm:text-base text-[var(--text-primary)] text-left ">
            <Trans
              i18nKey="authenticate.nfc_chips_description"
              components={{
                b: <b />,
              }}
            />
          </p>
          <p className=" text-sm sm:text-base text-[var(--text-primary)] text-left mb-1">
            {t("authenticate.scanning_benefits_title")}
          </p>
          <ul className="text-sm sm:text-base list-disc list-inside mb-6 space-y-1 text-[var(--text-primary)]">
            <li>{t("authenticate.scanning_benefit1")}</li>
            <li>{t("authenticate.scanning_benefit2")}</li>
            <li>
              <Trans
                i18nKey="authenticate.scanning_benefit3"
                components={{
                  b: <b />,
                }}
              />
            </li>
          </ul>
        </div>

        {/* Основной контент: способы проверки слева, изображение справа */}
        <h3 className="text-base sm:text-lg  font-semibold text-[var(--text-primary)]  text-left uppercase mb-5">
          {t("authenticate.instruction_title")}
        </h3>
        <div className="items-start flex flex-row gap-12">
          {/* Левая колонка - способы проверки */}

          <div className="flex-[1]">
            {/* Способ 1: NFC чип */}
            <div className="mb-6">
              <h4 className=" text-sm sm:text-base font-semibold text-[var(--text-primary)] mb-2">
                {t("authenticate.method1_title")}
              </h4>
              <div className="text-[var(--text-primary)] mb-2 text-[15px] sm:text-[15px]">
                <ol className="text-sm sm:text-base list-decimal list-inside  space-y-1 ">
                  <li>
                    <span className="ml-2">
                      {t("authenticate.method1_step1")}
                    </span>
                  </li>
                  <li>
                    <span className="ml-2">
                      {t("authenticate.method1_step2")}
                    </span>
                  </li>
                  <li>
                    <span className="ml-2">
                      <Trans
                        i18nKey="authenticate.method1_step3"
                        components={{
                          b: <b />,
                        }}
                      />
                    </span>
                  </li>
                </ol>
              </div>
              <p className="text-sm sm:text-base text-[var(--text-primary)] text-left ">
                <Trans
                  i18nKey="authenticate.method1_warning"
                  components={{
                    br: <br />,
                  }}
                />
              </p>
            </div>

            {/* Способ 2: Уникальный код */}
            <div className="mb-6">
              <h4 className="text-[15px] sm:text-[15px] font-semibold text-[var(--text-primary)] mb-2">
                {t("authenticate.method2_title")}
              </h4>
              <div className="text-[var(--text-primary)] mb-6 text-[15px] sm:text-[15px]">
                <ol className="text-sm sm:text-base list-decimal list-inside  space-y-1 ">
                  <li>
                    <span className="ml-2">
                      {t("authenticate.method2_step1")}
                    </span>
                  </li>
                  <li>
                    <span className="ml-2">
                      {t("authenticate.method2_step2")}
                    </span>
                  </li>
                  <li>
                    <span className="ml-2">
                      {t("authenticate.method2_step3")}
                    </span>
                  </li>
                  <li>
                    <span className="ml-2">
                      <Trans
                        i18nKey="authenticate.method2_step4"
                        components={{
                          b: <b />,
                        }}
                      />
                    </span>
                  </li>
                </ol>
              </div>
              {/* Способ 3: QR-код */}
              <h4 className="text-[15px] sm:text-[15px] font-semibold text-[var(--text-primary)] mb-6">
                {t("authenticate.method3_title")}
              </h4>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-[var(--text-primary)] mb-2">
                    {t("authenticate.method3_label")}
                  </label>
                  <Input
                    {...register("serialNumber")}
                    placeholder={t("authenticate.method2_input_placeholder")}
                    onChange={(e) => {
                      const formatted = formatSerialNumber(e.target.value);
                      e.target.value = formatted;
                      const { onChange } = register("serialNumber");
                      onChange(e);
                    }}
                    error={
                      errors.serialNumber?.message
                        ? t(errors.serialNumber.message)
                        : undefined
                    }
                    submitButton={{
                      onSubmit: handleSubmit(onSubmit),
                      disabled: !isValid,
                    }}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Правая колонка - место для изображения */}
          <div className="self-center hidden md:block">
            <div className="text-center flex items-end justify-center">
              <img
                src={nfcPNG}
                alt="NFC"
                className="max-w-[275px] max-h-[275px] object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticatePage;
