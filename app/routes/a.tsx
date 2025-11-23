import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const NFCRedirectPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const tagId = searchParams.get("t");
    const hash = searchParams.get("h");

    if (tagId && hash) {
      // Перенаправляем на страницу аутентификации с параметрами NFC
      navigate(
        `/authenticate?t=${encodeURIComponent(
          tagId.replace(/\:/g, "").toUpperCase()
        )}&h=${encodeURIComponent(hash)}`
      );
    } else {
      // Если параметры неверные, перенаправляем на главную
      navigate("/");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {t("common.redirecting", "Перенаправление...")}
        </p>
      </div>
    </div>
  );
};

export default NFCRedirectPage;
