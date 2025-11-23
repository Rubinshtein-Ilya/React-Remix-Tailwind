import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppButton } from "~/shared/buttons/AppButton";
import { Input } from "~/shared/inputs/Input";
import {
  useGenerateAuthCodes,
  useGetExistingAuthCodes,
} from "~/queries/authentication";
import { useNotifications } from "~/hooks/useNotifications";
import type { AuthResult } from "~/api/authentication";
import readJPG from "~/assets/images/admin/nfc/read.jpg";
import addRecordJPG from "~/assets/images/admin/nfc/add_record.jpg";
import linkTextJPG from "~/assets/images/admin/nfc/link_text.jpg";
import lockTagJPG from "~/assets/images/admin/nfc/lock_tag.jpg";
import uriRecordJPG from "~/assets/images/admin/nfc/uri_record.jpg";
import writeToChipJPG from "~/assets/images/admin/nfc/write_to_chip.jpg";

// Схема валидации
const authenticationSchema = z.object({
  itemId: z.string().min(1, "item_id_required"),
  serialNumber: z
    .string()
    .min(6, "serial_number_length")
    .max(6, "serial_number_length")
    .regex(/^[A-Z0-9]{6}$/, "serial_number_format"),
  tagId: z
    .string()
    .min(14, "tag_id_length")
    .max(14, "tag_id_length")
    .regex(/^[A-F0-9]{14}$/, "tag_id_format"),
});

type AuthenticationFormData = z.infer<typeof authenticationSchema>;

const AuthenticationAdmin: React.FC = () => {
  const { t } = useTranslation();
  const notifications = useNotifications();
  const [result, setResult] = useState<AuthResult | null>(null);
  const [shouldCheckExisting, setShouldCheckExisting] =
    useState<boolean>(false);
  const [currentItemId, setCurrentItemId] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<AuthenticationFormData>({
    resolver: zodResolver(authenticationSchema),
    mode: "onChange",
  });

  const watchedItemId = watch("itemId");

  // Проверяем существующие коды только когда нужно
  const { data: existingCodes, isLoading: isLoadingExisting } =
    useGetExistingAuthCodes(
      watchedItemId,
      shouldCheckExisting && !!watchedItemId && watchedItemId.length > 0
    );

  const generateCodesMutation = useGenerateAuthCodes();

  // Функция для форматирования Tag ID
  const formatTagId = (value: string): string => {
    return value
      .replace(/[^A-Fa-f0-9]/g, '') // Убираем все кроме hex символов
      .toUpperCase() // Делаем заглавными
      .slice(0, 14); // Ограничиваем длину
  };

  // Функция для форматирования Serial Number
  const formatSerialNumber = (value: string): string => {
    return value
      .replace(/[^A-Za-z0-9]/g, '') // Убираем все кроме букв и цифр
      .toUpperCase() // Делаем заглавными
      .slice(0, 6); // Ограничиваем длину
  };

  // Функция для замены Tag ID на placeholder в URL
  const replaceTagIdWithPlaceholder = (url: string): string => {
    return url.replace(/t=([A-F0-9]{14})&/, 't={TAG-ID}&');
  };

  // Отображаем существующие коды если они найдены
  useEffect(() => {
    if (existingCodes) {
      setResult(existingCodes);
      notifications.showInfo(
        t(
          "admin.authentication.codes_already_exist_notification",
          "Коды для этого товара уже созданы"
        )
      );
      setShouldCheckExisting(false); // Сбрасываем флаг после получения данных
    }
  }, [existingCodes, notifications, t]);

  const handleCheckExisting = () => {
    if (!watchedItemId || watchedItemId.length === 0) {
      notifications.showError(
        t("admin.authentication.item_id_required", "Введите ID товара")
      );
      return;
    }
    setResult(null);
    setShouldCheckExisting(true);
  };

  // Сбрасываем результат при смене itemId
  useEffect(() => {
    if (currentItemId !== watchedItemId) {
      setResult(null);
      setCurrentItemId(watchedItemId || "");
      setShouldCheckExisting(false);
    }
  }, [watchedItemId, currentItemId]);

  const onSubmit = async (data: AuthenticationFormData) => {
    generateCodesMutation.mutate(data, {
      onSuccess: (result) => {
        setResult(result);
        setShouldCheckExisting(false); // Сбрасываем флаг после создания
      },
    });
  };

  const downloadQRCode = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        notifications.showSuccess(t("common.copy") + "!");
      })
      .catch(() => {
        notifications.showError("Не удалось скопировать");
      });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">
          {t("admin.authentication.title")}
        </h2>
        <p className="text-gray-600">{t("admin.authentication.description")}</p>
      </div>

      {/* Форма создания */}
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.authentication.item_id")} *
            </label>
            <Input
              {...register("itemId")}
              placeholder={t("admin.authentication.item_id_placeholder")}
              className="w-full"
              error={
                errors.itemId?.message ? t(errors.itemId.message) : undefined
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.authentication.serial_number")} *
            </label>
            <Input
              {...register("serialNumber")}
              placeholder={t("admin.authentication.serial_number_placeholder")}
              className="w-full"
              onChange={(e) => {
                const formatted = formatSerialNumber(e.target.value);
                e.target.value = formatted;
                // Вызываем оригинальный onChange из react-hook-form
                const { onChange } = register("serialNumber");
                onChange(e);
              }}
              error={
                errors.serialNumber?.message ? t(errors.serialNumber.message) : undefined
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("admin.authentication.serial_number_help")}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.authentication.tag_id")} *
            </label>
            <Input
              {...register("tagId")}
              placeholder={t("admin.authentication.tag_id_placeholder")}
              className="w-full"
              onChange={(e) => {
                const formatted = formatTagId(e.target.value);
                e.target.value = formatted;
                // Вызываем оригинальный onChange из react-hook-form
                const { onChange } = register("tagId");
                onChange(e);
              }}
              error={
                errors.tagId?.message ? t(errors.tagId.message) : undefined
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("admin.authentication.tag_id_help")}
            </p>
          </div>

          {/* Инструкция для админов */}
          <details className="bg-blue-50 border border-blue-200 rounded-lg">
            <summary className="p-4 cursor-pointer text-blue-800 font-medium hover:bg-blue-100 rounded-lg">
              📱{" "}
              {t(
                "admin.authentication.instruction_title",
                "Инструкция по работе с NFC чипами"
              )}
            </summary>
            <div className="px-4 pb-4 space-y-4">
              <div className="text-sm text-blue-900 space-y-3">
                <p>
                  <strong>
                    {t(
                      "admin.authentication.step1_title",
                      "Шаг 1: Скачайте приложение"
                    )}
                  </strong>
                </p>
                <p>
                  {t(
                    "admin.authentication.step1_description",
                    "Чтобы записывать коды на чип скачайте"
                  )}{" "}
                  <a
                    href="https://play.google.com/store/apps/details?id=com.wakdev.wdnfc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    NFC Tools
                  </a>{" "}
                  {t(
                    "admin.authentication.step1_android",
                    "на свой телефон Android"
                  )}
                </p>

                <p>
                  <strong>
                    {t(
                      "admin.authentication.step2_title",
                      "Шаг 2: Найдите Tag ID"
                    )}
                  </strong>
                </p>
                <p>
                  {t(
                    "admin.authentication.step2_description",
                    'Чтобы найти Tag ID - откройте приложение на вкладке "Read" и найдите Serial Number - это и есть tag id.'
                  )}
                </p>

                <div className="bg-white p-3 rounded border">
                  <img
                    src={readJPG}
                    alt="NFC Tools Read Screen"
                    className="w-full max-w-sm mx-auto rounded border shadow-sm"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-yellow-800">
                    <strong>
                      ⚠️ {t("admin.authentication.important", "Важно")}:
                    </strong>{" "}
                    {t(
                      "admin.authentication.tag_id_format_note",
                      'tag ID в систему необходимо вводить без ":" и пробелов большими буквами.'
                    )}
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    {t("admin.authentication.example", "Пример")}:
                    04:2C:A1:23:6F:61:80 → 042CA1236F6180
                  </p>
                </div>
              </div>
            </div>
          </details>

          <div className="flex gap-3">
            <AppButton
              type="button"
              onClick={handleCheckExisting}
              disabled={isLoadingExisting || !watchedItemId}
              variant="secondary"
              className="flex-1"
            >
              {isLoadingExisting
                ? t("admin.authentication.checking", "Проверка...")
                : t(
                    "admin.authentication.check_existing",
                    "Проверить существующие"
                  )}
            </AppButton>
            <AppButton
              type="submit"
              disabled={generateCodesMutation.isPending || !isValid}
              variant="primary"
              className="flex-1"
            >
              {generateCodesMutation.isPending
                ? t("admin.authentication.generating")
                : t("admin.authentication.generate")}
            </AppButton>
          </div>
        </form>
      </div>

      {/* Результаты */}
      {result && (
        <div className="space-y-6">
          {/* Информация о создании */}
          {result.createdAt && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">ℹ️</span>
                <p className="text-blue-800 text-sm">
                  {t("admin.authentication.codes_created_at", "Коды созданы")}:{" "}
                  {new Date(result.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Серийный номер */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              {t("admin.authentication.serial_number")}
            </h3>
            <div className="flex items-center gap-4">
              <code className="bg-gray-100 px-4 py-2 rounded text-lg font-mono">
                {result.serialNumber}
              </code>
              <AppButton
                onClick={() => copyToClipboard(result.serialNumber)}
                variant="secondary"
                size="sm"
              >
                {t("common.copy")}
              </AppButton>
            </div>
          </div>

          {/* QR код для проверки по серийному номеру */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              {t("admin.authentication.qr_code_serial")}
            </h3>
            <div className="flex items-start gap-6">
              <div className="text-center">
                <img
                  src={result.serialQRCode}
                  alt="Serial QR Code"
                  className="w-48 h-48 border"
                />
                <AppButton
                  onClick={() =>
                    downloadQRCode(result.serialQRCode, `qr-serial-${result.serialNumber}.png`)
                  }
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                >
                  {t("admin.authentication.download_qr")}
                </AppButton>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  {t("admin.authentication.serial_link")}:
                </p>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
                  {result.serialUrl}
                </div>
                <AppButton
                  onClick={() => copyToClipboard(result.serialUrl)}
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                >
                  {t("common.copy_link")}
                </AppButton>
              </div>
            </div>
          </div>

          {/* NFC ссылка */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              {t("admin.authentication.nfc_link")}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {t("admin.authentication.nfc_description")}:
                </p>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
                  {replaceTagIdWithPlaceholder(result.nfcUrl)}
                </div>
                <div className="flex gap-2 mt-2">
                  <AppButton
                    onClick={() =>
                      copyToClipboard(
                        replaceTagIdWithPlaceholder(result.nfcUrl)
                      )
                    }
                    variant="secondary"
                    size="sm"
                  >
                    {t("common.copy_link")}
                  </AppButton>
                  <AppButton
                    onClick={() => window.open(result.nfcUrl, "_blank")}
                    variant="secondary"
                    size="sm"
                  >
                    {t("common.open_link")}
                  </AppButton>
                </div>
              </div>

              {/* Инструкция по записи NFC */}
              <details className="bg-green-50 border border-green-200 rounded-lg mt-4">
                <summary className="p-4 cursor-pointer text-green-800 font-medium hover:bg-green-100 rounded-lg">
                  📝{" "}
                  {t(
                    "admin.authentication.write_instruction_title",
                    "Инструкция по записи NFC ссылки"
                  )}
                </summary>
                <div className="px-4 pb-4 space-y-4">
                  <div className="text-sm text-green-900 space-y-4">
                    {/* Шаг 1 */}
                    <div>
                      <p className="font-semibold">
                        {t(
                          "admin.authentication.write_step1",
                          "1. Скачайте и установите NFC Tools"
                        )}
                      </p>
                      <p>
                        <a
                          href="https://play.google.com/store/apps/details?id=com.wakdev.wdnfc"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 underline hover:text-green-800"
                        >
                          NFC Tools
                        </a>
                      </p>
                    </div>

                    {/* Шаг 2 */}
                    <div>
                      <p className="font-semibold">
                        {t(
                          "admin.authentication.write_step2",
                          '2. В секции "Write" выберите "Add a record"'
                        )}
                      </p>
                      <div className="bg-white p-3 rounded border mt-2">
                        <img
                          src={addRecordJPG}
                          alt="NFC Tools Write Step 2"
                          className="w-full max-w-sm mx-auto rounded border shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Шаг 3 */}
                    <div>
                      <p className="font-semibold">
                        {t(
                          "admin.authentication.write_step3",
                          '3. Выберите тип "URL/URI"'
                        )}
                      </p>
                      <div className="bg-white p-3 rounded border mt-2">
                        <img
                          src={uriRecordJPG}
                          alt="NFC Tools Write Step 3"
                          className="w-full max-w-sm mx-auto rounded border shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Шаг 4 */}
                    <div>
                      <p className="font-semibold">
                        {t(
                          "admin.authentication.write_step4",
                          "4. Введите ссылку"
                        )}
                      </p>
                      <p className="text-sm">
                        {t(
                          "admin.authentication.write_step4_desc",
                          'Введите ссылку формата "fansdream.ru/a?t={TAG_ID}&h=..." где h указан сверху.'
                        )}
                      </p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                        <p className="text-yellow-800 text-sm">
                          <strong>
                            ⚠️ {t("admin.authentication.attention", "Внимание")}
                            !
                          </strong>{" "}
                          {t(
                            "admin.authentication.write_step4_warning",
                            "TagID вручную вводить не надо - выберите {TAG_ID} из кнопки параметров справа!"
                          )}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border mt-2">
                        <img
                          src={linkTextJPG}
                          alt="NFC Tools Write Step 4"
                          className="w-full max-w-sm mx-auto rounded border shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Шаг 5-6 */}
                    <div>
                      <p className="font-semibold">
                        {t("admin.authentication.write_step5", "5. Нажмите OK")}
                      </p>
                      <p className="font-semibold mt-2">
                        {t(
                          "admin.authentication.write_step6",
                          "6. Нажмите кнопку Write"
                        )}
                      </p>
                      <div className="bg-white p-3 rounded border mt-2">
                        <img
                          src={writeToChipJPG}
                          alt="NFC Tools Write Step 6"
                          className="w-full max-w-sm mx-auto rounded border shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Шаг 7-8 */}
                    <div>
                      <p className="font-semibold">
                        {t(
                          "admin.authentication.write_step7",
                          "7. Поднесите NFC чип и дождитесь подтверждения записи"
                        )}
                      </p>
                      <p className="font-semibold mt-2">
                        {t(
                          "admin.authentication.write_step8",
                          "8. Для проверки - выйдите из приложения и поднесите NFC тэг к телефону - должна открыться страница с подтверждением подлинности."
                        )}
                      </p>
                    </div>

                    {/* Шаг 9-10 */}
                    <div>
                      <p className="font-semibold">
                        {t(
                          "admin.authentication.write_step9",
                          '9. После успешной записи и проверки - откройте вкладку "Other"'
                        )}
                      </p>
                      <div className="bg-white p-3 rounded border mt-2">
                        <img
                          src={lockTagJPG}
                          alt="NFC Tools Write Step 9"
                          className="w-full max-w-sm mx-auto rounded border shadow-sm"
                        />
                      </div>
                      <p className="font-semibold mt-2">
                        {t(
                          "admin.authentication.write_step10",
                          '10. Выберите "Lock tag"'
                        )}
                      </p>
                    </div>

                    {/* Шаг 11-13 */}
                    <div>
                      <p className="font-semibold">
                        {t(
                          "admin.authentication.write_step11",
                          "11. Поднесите тэг для блокировки"
                        )}
                      </p>
                      <p className="font-semibold mt-1">
                        {t(
                          "admin.authentication.write_step12",
                          "12. Дождитесь подтверждения."
                        )}
                      </p>
                      <p className="font-semibold mt-1">
                        {t("admin.authentication.write_step13", "13. Готово!")}
                      </p>
                    </div>

                    {/* Важное предупреждение */}
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-red-800">
                        <strong>
                          🚨{" "}
                          {t(
                            "admin.authentication.critical_warning",
                            "ВНИМАНИЕ"
                          )}
                        </strong>{" "}
                        -{" "}
                        {t(
                          "admin.authentication.lock_warning",
                          "заблокированный тэг (п.9-12) невозможно перезаписать! Обязательно проверяйте валидность данных (п.8) перед блокировкой!"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticationAdmin;
