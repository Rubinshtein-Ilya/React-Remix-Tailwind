import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Link, redirect, type LoaderFunction } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";
import { Input } from "~/shared/inputs/Input";
import { useSendSupportRequest } from "~/queries/user";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/queries/auth";

export const loader: LoaderFunction = async ({ request, context }) => {
  // DK: temporary redirect to faq
  return redirect("/faq");
};

// Создаем схему валидации динамически
const createSupportSchema = (isAuthenticated: boolean) =>
  z.object({
    category: z.string().min(1, "pages.help.validation.category_required"),
    subject: z.string().min(5, "pages.help.validation.subject_min"),
    message: z.string().min(10, "pages.help.validation.message_min"),
    email: isAuthenticated
      ? z.string().optional()
      : z
          .string()
          .min(1, "pages.help.validation.email_required")
          .email("pages.help.validation.email_invalid"),
    name: isAuthenticated
      ? z.string().optional()
      : z
          .string()
          .min(2, "pages.help.validation.name_min")
          .max(50, "pages.help.validation.name_max"),
  });

type SupportFormData = {
  category: string;
  subject: string;
  message: string;
  email?: string;
  name?: string;
};

export default function Help() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const sendSupportRequest = useSendSupportRequest();
  const { user } = useUser();

  const supportSchema = createSupportSchema(!!user);

  const categories = [
    {
      id: "technical",
      title: t("pages.help.categories.technical"),
      description: t("pages.help.categories.technical_desc"),
    },
    {
      id: "financial",
      title: t("pages.help.categories.financial"),
      description: t("pages.help.categories.financial_desc"),
    },
    {
      id: "account",
      title: t("pages.help.categories.account"),
      description: t("pages.help.categories.account_desc"),
    },
    {
      id: "other",
      title: t("pages.help.categories.other"),
      description: t("pages.help.categories.other_desc"),
    },
  ];

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    mode: "onChange",
    defaultValues: {
      category: "",
      subject: "",
      message: "",
      email: "",
      name: "",
    },
  });

  const selectedCategory = watch("category");

  const onSubmit = async (data: SupportFormData) => {
    try {
      await sendSupportRequest.mutateAsync(data);

      showSuccess(t("pages.help.success_message"));

      reset();
    } catch (error) {
      showError(t("pages.help.error_message"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-30 px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-[30px] sm:text-[35px] md:text-[40px] font-bold text-[#121212] mb-6 text-left">
            {t("pages.help.title")}
          </h1>
          <p className="text-[15px] sm:text-[15px] text-gray-600 mb-8 text-left">
            {t("pages.help.subtitle")}
          </p>
        </div>

        <div className="space-y-8">
          {/* FAQ блок */}
          <div className="bg-gradient-to-r from-[#F9B234] to-[#F7931E] rounded-lg shadow-lg p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex-1 mb-6 md:mb-0 md:mr-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                  {t("pages.help.faq_section.title")}
                </h2>
                <p className="text-base sm:text-lg opacity-90 leading-relaxed">
                  {t("pages.help.faq_section.description")}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link to="/faq">
                  <AppButton
                    variant="secondary"
                    size="lg"
                    className="bg-white text-[#F9B234] hover:bg-gray-100 border-white"
                  >
                    {t("pages.help.faq_section.link_text")}
                  </AppButton>
                </Link>
              </div>
            </div>
          </div>

          {/* Форма обращения */}
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("pages.help.contact_us")}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Поля для неавторизованных пользователей */}
              {!user && (
                <div className="space-y-6">
                  <div>
                    <Input
                      {...register("name")}
                      label={t("pages.help.name")}
                      placeholder={t("pages.help.name_placeholder")}
                      error={
                        errors.name
                          ? t(errors.name.message as string)
                          : undefined
                      }
                      required
                    />
                  </div>
                  <div>
                    <Input
                      {...register("email")}
                      type="email"
                      label={t("pages.help.email")}
                      placeholder={t("pages.help.email_placeholder")}
                      error={
                        errors.email
                          ? t(errors.email.message as string)
                          : undefined
                      }
                      required
                    />
                  </div>
                </div>
              )}

              {/* Категории */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  {t("pages.help.select_category")}
                </label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => field.onChange(category.id)}
                          className={`p-4 text-left rounded-lg border-2 transition-colors ${
                            selectedCategory === category.id
                              ? "border-[#F9B234] bg-yellow-50"
                              : "border-gray-200 hover:border-[#F9B234] hover:bg-yellow-50"
                          }`}
                        >
                          <h3 className="font-medium text-gray-900">
                            {category.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">
                            {category.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.category && (
                  <p className="text-red-500 text-sm mt-2">
                    {t(errors.category.message as string)}
                  </p>
                )}
              </div>

              {/* Тема */}
              <div>
                <Input
                  {...register("subject")}
                  label={t("pages.help.subject")}
                  error={
                    errors.subject
                      ? t(errors.subject.message as string)
                      : undefined
                  }
                />
              </div>

              {/* Сообщение */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("pages.help.message")}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  {...register("message")}
                  className={`mt-1 p-3 block w-full rounded-md border shadow-sm focus:ring-[#F9B234] focus:border-[#F9B234] ${
                    errors.message ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Опишите ваш вопрос или проблему подробно..."
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {t(errors.message.message as string)}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <AppButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!isValid || sendSupportRequest.isPending}
                  isLoading={sendSupportRequest.isPending}
                  fullWidth={false}
                  className="mx-auto"
                >
                  {t("pages.help.send")}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
