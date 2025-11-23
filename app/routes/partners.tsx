import { useTranslation, Trans } from "react-i18next";
import { Link, useLocation } from "react-router";
import { AppButton } from "~/shared/buttons/AppButton";
import { z } from "zod";

import trysova from "../assets/images/partners/trysova.jpg";
import ignatov from "../assets/images/partners/ignatov.jpg";
import martynchev from "../assets/images/partners/martynchev.jpg";
import match25 from "../assets/images/partners/match25.jpg";
import titov from "../assets/images/partners/titov.jpg";
import kynitsa from "../assets/images/partners/kynitsa.jpg";
import dybov from "../assets/images/partners/dybov.jpg";
import kostornaya from "../assets/images/partners/kostornaya.jpg";

import p1_svg from "../assets/images/partners/p1_svg.svg";
import p2_svg from "../assets/images/partners/p2_svg.svg";
import p3_svg from "../assets/images/partners/p3_svg.svg";
import p5_svg from "../assets/images/partners/p5_svg.svg";
import p6_svg from "../assets/images/partners/p6_svg.svg";
import p7_svg from "../assets/images/partners/p7_svg.svg";
import p9_svg from "../assets/images/partners/p9_svg.svg";
import p10_svg from "../assets/images/partners/p10_svg.svg";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/shared/inputs";
import { RiArrowRightLongLine } from "@remixicon/react";
import { cn } from "~/lib/utils";
import { formatPhoneNumber } from "~/utils/formatPhoneNumber";
import { useEffect, useRef } from "react";
import { useAuth } from "~/queries/auth";
import { useSendPartnershipRequest } from "~/queries/user";
import { useNotifications } from "~/hooks/useNotifications";

const partners = [
  {
    name: "Матч года 2025. Все звезды хоккея",
    img: match25,
    href: "/events/match_goda_wdttmxksjkzw",
  },
  {
    name: "Александра Трусова",
    img: trysova,
    href: "/players/aleksandra_trusova_agbsbi9w8g78",
  },
  {
    name: "Макар Игнатов",
    img: ignatov,
    href: "/players/makar_ignatov_vs0bae8bjhts",
  },
  // { name: "Алёна Косторная", img: kostornaya, href: "/players/alena_kostornaya_1divwzf96pc5" },
  // { name: "Георгий Куница", img: kynitsa, href: "/players/georgiy_kunitsa_343gznd7ed9y" },
  {
    name: "Егор Титов",
    img: titov,
    href: "/players/egor_titov_w5e54yq26mwp",
  },
  {
    name: "Даниил Дубов",
    img: dybov,
    href: "/players/daniil_dubov_8ga8m7nnzzal",
  },
  {
    name: "Кирилл Мартынчев",
    img: martynchev,
    href: "/players/kirill_martynychev_zmeacj0vnbl3",
  },
];

const adventages = [
  {
    key: "income",
    icon: p1_svg,
  },
  {
    key: "fans",
    icon: p5_svg,
  },
  {
    key: "innovation",
    icon: p6_svg,
  },
  {
    key: "premium",
    icon: p2_svg,
  },
  {
    key: "flexible",
    icon: p10_svg,
  },
  {
    key: "transparency",
    icon: p7_svg,
  },
  {
    key: "charity",
    icon: p3_svg,
  },
  {
    key: "audience",
    icon: p9_svg,
  },
];

export default function Partners() {
  const { t } = useTranslation();
  const location = useLocation();
  const advantegesRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const sendPartnershipRequest = useSendPartnershipRequest();
  const notifications = useNotifications();

  const feedbackSchema = z.object({
    name: z
      .string()
      .min(1, { message: t("pages.partners.validation.name_required") }),
    specialization: z.string().min(1, {
      message: t("pages.partners.validation.specialization_required"),
    }),
    companyName: z
      .string()
      .min(1, { message: t("pages.partners.validation.company_required") }),
    email: z
      .string()
      .email({ message: t("pages.partners.validation.email_invalid") }),
    phone: z
      .string()
      .min(1, t("errors.phone_required"))
      .transform((value) => formatPhoneNumber(value))
      .refine((value) => {
        if (!/^\+7 \d{3} \d{3}-\d{2}-\d{2}$/.test(value)) {
          return false;
        }
        const numbers = value.replace(/\D/g, "");
        if (!numbers.startsWith("7") || numbers.length !== 11) {
          return false;
        }
        return true;
      }, t("errors.phone_invalid_format")),
    message: z.string().optional(),
    agreeToPersonalData: z.boolean().refine((val) => val === true, {
      message: t("pages.partners.validation.agree_to_personal_data"),
    }),
  });

  type FeedbackFormData = z.infer<typeof feedbackSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      specialization: "",
      companyName: "",
      email: "",
      phone: "",
      message: "",
      agreeToPersonalData: false,
    },
  });

  // Автозаполнение полей при входе пользователя
  useEffect(() => {
    if (user) {
      const fullName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.lastName || "";
      
      reset({
        name: fullName,
        specialization: "",
        companyName: "",
        email: user.email || "",
        phone: user.phone || "",
        message: "",
        agreeToPersonalData: false,
      });
    }
  }, [user, reset]);

  useEffect(() => {
    if (location.hash === "#advantages" && advantegesRef.current) {
      advantegesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      await sendPartnershipRequest.mutateAsync(data);
      notifications.showSuccess(
        t("pages.partners.notifications.partnership_success")
      );
      // Сброс формы после успешной отправки
      reset({
        name: user?.firstName && user?.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user?.firstName || user?.lastName || "",
        specialization: "",
        companyName: "",
        email: user?.email || "",
        phone: user?.phone || "",
        message: "",
        agreeToPersonalData: false,
      });
    } catch (error) {
      notifications.showError(
        t("pages.partners.notifications.partnership_error")
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-10 sm:mt-20 lg:mt-30 pt-8 sm:pt-12 lg:pt-16">
      {/* Партнеры */}
      <div className="w-full bg-[#F8F8F8]">
        <div className="container">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 justify-between items-start sm:items-center mb-6 sm:mb-10">
            <h3 className="uppercase text-2xl sm:text-4xl ">
              {t("pages.partners.exclusive_partners")}
            </h3>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-16">
            {partners.map((p) => (
              <Link to={p.href} key={p.name}>
                <div className="flex flex-col items-center">
                  <div className="bg-white rounded-xl shadow w-full aspect-[5/4]  flex items-end justify-center overflow-hidden">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-cover "
                      loading="lazy"
                    />
                  </div>
                  <div className="text-center text-sm sm:text-base font-medium text-[#121212] mt-2">
                    {p.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* Преимущества для партнеров */}
      <div
        id="advantages"
        ref={advantegesRef}
        className="w-full bg-[#fff] py-10 sm:py-16 scroll-mt-40"
      >
        <div className="container px-4">
          <h2 className="text-2xl sm:text-4xl  text-[#121212] text-left mb-6 sm:mb-10 leading-tight uppercase">
            {t("pages.partners.advantages_title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8">
            {adventages.map((a) => (
              <div
                className="flex flex-col items-start bg-[#FAFAFA] rounded-xl p-4 sm:p-6"
                key={a.key}
              >
                <div className="flex items-center gap-4 ">
                  <span className=" text-yellow-500">
                    <img
                      src={a.icon}
                      alt={t(`pages.partners.advantages.${a.key}.title`)}
                      className="w-6 h-6 sm:w-8 sm:h-8"
                    />
                  </span>
                  <div className="font-bold  text-sm sm:text-base">
                    {t(`pages.partners.advantages.${a.key}.title`)}:
                  </div>
                </div>
                <div className="text-gray-700 text-sm sm:text-base">
                  {t(`pages.partners.advantages.${a.key}.description`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Форма */}
      <div className="w-full bg-[#fff] md:py-10 ">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl sm:text-4xl  text-[#121212] text-left mb-6 sm:mb-10 leading-tight uppercase">
              {t("pages.partners.cooperation_title")}
            </h2>
            <p className="text-base text-pretty">
              <Trans
                i18nKey="pages.partners.cooperation_description"
                values={{ email: "business@fansdream.ru" }}
                components={[
                  <a
                    key="0"
                    href="mailto:business@fansdream.ru"
                    className="text-blue-500 hover:text-blue-700 underline"
                  />,
                ]}
              />
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-2 p-5 bg-[#F8F8F8] rounded-xl">
                <Input
                  {...register("name")}
                  placeholder={t("pages.partners.form.name_placeholder")}
                  error={errors.name?.message}
                />
                <Input
                  {...register("specialization")}
                  placeholder={t(
                    "pages.partners.form.specialization_placeholder"
                  )}
                  error={errors.specialization?.message}
                />
                <Input
                  {...register("companyName")}
                  placeholder={t("pages.partners.form.company_placeholder")}
                  error={errors.companyName?.message}
                />
                <Input
                  {...register("email")}
                  placeholder={t("pages.partners.form.email_placeholder")}
                  error={errors.email?.message}
                />

                <Controller
                  name="phone"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      value={field.value}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                      placeholder={t(
                        "verification_dialog.step_2.phone_placeholder"
                      )}
                      type="tel"
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <textarea
                  {...register("message")}
                  className={cn(
                    "bg-white rounded-lg py-[10px] px-[30px] text-[#121212] text-base resize-none border ",
                    errors.message ? "border-red-500" : "border-[#CFCFCF]"
                  )}
                  style={{ height: "124px" }}
                  placeholder={t("pages.partners.form.message_placeholder")}
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.message.message}
                  </p>
                )}

                {/* Чекбокс согласия на обработку персональных данных */}
                <div className="flex flex-col gap-2 mt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("agreeToPersonalData")}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span
                      className="text-sm text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: t("pages.partners.form.checkbox_personal_data"),
                      }}
                    />
                  </label>
                  {errors.agreeToPersonalData && (
                    <p className="text-red-500 text-sm">
                      {errors.agreeToPersonalData.message}
                    </p>
                  )}
                </div>
              </div>
              <AppButton 
                className="w-full flex items-center justify-center gap-2 mt-5"
                type="submit"
                disabled={!isValid || sendPartnershipRequest.isPending}
              >
                {sendPartnershipRequest.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    {t("pages.partners.form.submit")}
                    <RiArrowRightLongLine />
                  </>
                )}
              </AppButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
