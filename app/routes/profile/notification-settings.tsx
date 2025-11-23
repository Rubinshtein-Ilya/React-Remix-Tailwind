import { AppButton } from "~/shared/buttons/AppButton";
import { RiArrowRightLongLine } from "@remixicon/react";
import { useNavigate } from "react-router";
import { z } from "zod";
import { Switch } from "~/components/ui/switch";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "~/queries/user";
import { useNotifications } from "~/hooks/useNotifications";
import { useTranslation } from "react-i18next";
import type { NotificationSettings } from "~/types/user";

const notificationSettingsSchema = z.object({
  advertising: z.boolean(),
  auction_end: z.boolean(),
  auction_win: z.boolean(),
  bet_outbid: z.boolean(),
  delivery_status: z.boolean(),
});

const options: Record<string, string>[] = [
  {
    label: "Маркетинговые уведомления",
    name: "advertising",
  },
  {
    label: "Ставка перебита",
    name: "bet_outbid",
  },
  {
    label: "Окончание аукциона",
    name: "auction_end",
  },
  {
    label: "Выигрыш в аукционе",
    name: "auction_win",
  },
  {
    label: "Статус доставки",
    name: "delivery_status",
  },
];

function NotificationSettings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();

  const { data: notificationSettings } = useNotificationSettings();
  const updateNotificationSettings = useUpdateNotificationSettings();

  const { handleSubmit, control, watch, reset } = useForm<NotificationSettings>(
    {
      resolver: zodResolver(notificationSettingsSchema),
      defaultValues: {
        advertising: true,
        auction_end: true,
        auction_win: true,
        bet_outbid: true,
        delivery_status: true,
      },
    }
  );

  // Загружаем данные при получении с сервера
  useEffect(() => {
    if (notificationSettings?.data) {
      reset(notificationSettings.data);
    }
  }, [notificationSettings, reset]);

  const onSubmit = (data: NotificationSettings) => {
    updateNotificationSettings.mutate(data, {
      onSuccess: () => {
        showSuccess(
          t("notification_settings_updated") ||
            "Настройки уведомлений обновлены"
        );
      },
      onError: (error) => {
        showError(
          t("error_updating_notification_settings") ||
            "Ошибка при обновлении настроек"
        );
        console.error("Error updating notification settings:", error);
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xl sm:text-3xl font-normal">
          Настройка уведомлений
        </h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <ul className="border-t border-[#CFCFCF] w-full sm:w-xl">
            {options.map((option) => (
              <li
                className="flex items-center gap-3.5 py-2 border-b border-[#CFCFCF]"
                key={option.name}
              >
                <Controller
                  control={control}
                  name={option.name as keyof NotificationSettings}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                {option.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-2 mt-4">
          <AppButton variant="secondary" fullWidth={false} type="submit">
            Сохранить
          </AppButton>
          <AppButton
            variant="secondary"
            className="flex items-center gap-2"
            fullWidth={false}
            onClick={() => navigate(-1)}
          >
            Вернуться назад
            <RiArrowRightLongLine size={16} />
          </AppButton>
        </div>
      </form>
    </div>
  );
}

export default NotificationSettings;
