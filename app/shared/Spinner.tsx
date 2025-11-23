import { useTranslation } from "react-i18next";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
}

export function Spinner({ size = "md", text, className = "" }: SpinnerProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Внешнее кольцо */}
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-gray-200 border-t-red-600 animate-spin`}
        />
        {/* Внутреннее кольцо для более плавного эффекта */}
        <div
          className={`absolute top-1 left-1 ${
            size === "sm" ? "w-2 h-2" : 
            size === "md" ? "w-6 h-6" :
            size === "lg" ? "w-10 h-10" : "w-14 h-14"
          } rounded-full border border-gray-100 border-b-red-400 animate-spin`}
          style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
        />
      </div>
      
      {text && (
        <p className={`mt-4 text-gray-600 font-medium ${textSizeClasses[size]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
} 