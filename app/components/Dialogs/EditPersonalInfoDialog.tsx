import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Input } from "~/shared/inputs/Input";
import { AppButton } from "~/shared/buttons/AppButton";
import type { User } from "~/types/user";

interface EditPersonalInfoDialogProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSave: (data: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    dateOfBirth?: string;
    gender?: "male" | "female";
  }) => void;
  isLoading?: boolean;
}

export const EditPersonalInfoDialog: React.FC<EditPersonalInfoDialogProps> = ({
  isOpen,
  user,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  // Схема валидации - создается каждый раз для актуальных переводов
  const schema = useMemo(
    () =>
      z
        .object({
          firstName: z
            .string()
            .optional()
            .refine((val) => !val || (val.length >= 2 && val.length <= 30), {
              message: t(
                "errors.first_name_length",
                "Имя должно содержать от 2 до 30 символов"
              ),
            })
            .refine((val) => !val || /^[\p{L}\s\-']+$/u.test(val), {
              message: t(
                "errors.first_name_invalid_characters",
                "Имя может содержать только буквы, пробелы, дефисы и апострофы"
              ),
            }),
          lastName: z
            .string()
            .optional()
            .refine((val) => !val || (val.length >= 2 && val.length <= 30), {
              message: t(
                "errors.last_name_length",
                "Фамилия должна содержать от 2 до 30 символов"
              ),
            })
            .refine((val) => !val || /^[\p{L}\s\-']+$/u.test(val), {
              message: t(
                "errors.last_name_invalid_characters",
                "Фамилия может содержать только буквы, пробелы, дефисы и апострофы"
              ),
            }),
          middleName: z
            .string()
            .optional()
            .refine((val) => !val || (val.length >= 2 && val.length <= 30), {
              message: t(
                "errors.middle_name_length",
                "Отчество должно содержать от 2 до 30 символов"
              ),
            })
            .refine((val) => !val || /^[\p{L}\s\-']+$/u.test(val), {
              message: t(
                "errors.middle_name_invalid_characters",
                "Отчество может содержать только буквы, пробелы, дефисы и апострофы"
              ),
            }),
          dateOfBirth: z
            .string()
            .optional()
            .refine((date) => {
              if (!date) return true;
              const selectedDate = new Date(date);
              const today = new Date();
              const minDate = new Date();
              minDate.setFullYear(today.getFullYear() - 100);
              const maxDate = new Date();
              maxDate.setFullYear(today.getFullYear() - 13);

              return selectedDate >= minDate && selectedDate <= maxDate;
            }, t("errors.date_of_birth_invalid", "Возраст должен быть от 13 до 100 лет")),
          gender: z.enum(["male", "female"]).optional(),
        })
        .refine(
          (data) => {
            // Проверяем что заполнено хотя бы одно поле
            const hasFirstName =
              data.firstName && data.firstName.trim().length > 0;
            const hasLastName =
              data.lastName && data.lastName.trim().length > 0;
            const hasMiddleName =
              data.middleName && data.middleName.trim().length > 0;
            const hasDateOfBirth =
              data.dateOfBirth && data.dateOfBirth.length > 0;
            const hasGender = data.gender;

            return (
              hasFirstName ||
              hasLastName ||
              hasMiddleName ||
              hasDateOfBirth ||
              hasGender
            );
          },
          {
            message: t(
              "errors.at_least_one_field",
              "Заполните хотя бы одно поле"
            ),
            path: ["root"],
          }
        ),
    [t]
  );

  type FormData = z.infer<typeof schema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      middleName: user?.middleName || "",
      dateOfBirth: user?.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: user?.gender || undefined,
    },
  });

  // Следим за изменениями полей для проверки валидности
  const watchedFields = watch();
  const hasAnyFieldFilled = useMemo(() => {
    const hasFirstName =
      watchedFields.firstName && watchedFields.firstName.trim().length > 0;
    const hasLastName =
      watchedFields.lastName && watchedFields.lastName.trim().length > 0;
    const hasMiddleName =
      watchedFields.middleName && watchedFields.middleName.trim().length > 0;
    const hasDateOfBirth =
      watchedFields.dateOfBirth && watchedFields.dateOfBirth.length > 0;
    const hasGender = watchedFields.gender;

    return (
      hasFirstName ||
      hasLastName ||
      hasMiddleName ||
      hasDateOfBirth ||
      hasGender
    );
  }, [watchedFields]);

  // Обновляем значения формы при изменении пользователя или открытии диалога
  useEffect(() => {
    if (isOpen) {
      reset({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        middleName: user?.middleName || "",
        dateOfBirth: user?.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: user?.gender || undefined,
      });
    }
  }, [isOpen, user, reset]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSavePersonalInfo = (data: FormData) => {
    // Подготавливаем данные для отправки (только заполненные поля)
    const updateData: {
      firstName?: string;
      lastName?: string;
      middleName?: string;
      dateOfBirth?: string;
      gender?: "male" | "female";
    } = {};

    if (data.firstName && data.firstName.trim().length > 0) {
      updateData.firstName = data.firstName.trim();
    }

    if (data.lastName && data.lastName.trim().length > 0) {
      updateData.lastName = data.lastName.trim();
    }

    if (data.middleName && data.middleName.trim().length > 0) {
      updateData.middleName = data.middleName.trim();
    }

    if (data.dateOfBirth && data.dateOfBirth.length > 0) {
      updateData.dateOfBirth = data.dateOfBirth;
    }

    if (data.gender) {
      updateData.gender = data.gender;
    }

    onSave(updateData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Фон */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,.5)] backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Модальное окно */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
          aria-label="Закрыть"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Содержимое */}
        <div className="p-6">
          <h2
            className="text-2xl font-bold text-center mb-6"
            style={{ color: "#121212" }}
          >
            {t(
              "profile.edit_personal_info.title",
              "Редактировать личную информацию"
            )}
          </h2>

          <div className="flex flex-col gap-4">
            <p className="text-[#121212] text-[16px] text-center">
              {t(
                "profile.edit_personal_info.description",
                "Обновите ваше имя, фамилию, отчество, дату рождения или пол"
              )}
            </p>

            <form
              onSubmit={handleSubmit(handleSavePersonalInfo)}
              className="flex flex-col gap-4"
            >
              <Controller
                name="firstName"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label={t("profile.edit_personal_info.first_name", "Имя")}
                    placeholder={t(
                      "profile.edit_personal_info.first_name_placeholder",
                      "Введите ваше имя"
                    )}
                    error={fieldState.error?.message}
                    disabled={isLoading}
                  />
                )}
              />

              <Controller
                name="middleName"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label={t(
                      "profile.edit_personal_info.middle_name",
                      "Отчество"
                    )}
                    placeholder={t(
                      "profile.edit_personal_info.middle_name_placeholder",
                      "Введите ваше отчество"
                    )}
                    error={fieldState.error?.message}
                    disabled={isLoading}
                  />
                )}
              />

              <Controller
                name="lastName"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label={t("profile.edit_personal_info.last_name", "Фамилия")}
                    placeholder={t(
                      "profile.edit_personal_info.last_name_placeholder",
                      "Введите вашу фамилию"
                    )}
                    error={fieldState.error?.message}
                    disabled={isLoading}
                  />
                )}
              />

              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="date"
                    label={t(
                      "profile.edit_personal_info.date_of_birth",
                      "Дата рождения"
                    )}
                    error={fieldState.error?.message}
                    disabled={isLoading}
                  />
                )}
              />

              <Controller
                name="gender"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("profile.edit_personal_info.gender", "Пол")}
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="male"
                          checked={field.value === "male"}
                          onChange={() => field.onChange("male")}
                          disabled={isLoading}
                          className="mr-2"
                        />
                        {t("profile.edit_personal_info.gender_male", "Мужской")}
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="female"
                          checked={field.value === "female"}
                          onChange={() => field.onChange("female")}
                          disabled={isLoading}
                          className="mr-2"
                        />
                        {t(
                          "profile.edit_personal_info.gender_female",
                          "Женский"
                        )}
                      </label>
                    </div>
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {errors.root && (
                <p className="text-red-500 text-sm text-center">
                  {errors.root.message}
                </p>
              )}

              <AppButton
                type="submit"
                disabled={!hasAnyFieldFilled || !isValid || isLoading}
                variant="secondary"
                isLoading={isLoading}
              >
                {t("profile.edit_personal_info.save", "Сохранить")}
              </AppButton>

              <AppButton
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                variant="ghost"
              >
                {t("common.cancel", "Отмена")}
              </AppButton>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
