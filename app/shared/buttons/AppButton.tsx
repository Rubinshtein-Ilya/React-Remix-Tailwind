import React from "react";

export interface AppButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "profile";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      fullWidth = true,
      style,
      icon,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "font-medium transition-all duration-200 focus:outline-none disabled:!opacity-50 disabled:!cursor-not-allowed enabled:hover:!opacity-80 enabled:active:!opacity-90";

    const variantClasses = {
      primary:
        "text-white bg-[#121212] hover:!opacity-80 active:!opacity-90 text-[14px] uppercase",
      secondary:
        "text-[#121212] bg-[#F9B234] hover:!opacity-80 active:!opacity-90 text-[14px] uppercase",
      ghost:
        "text-[#121212] hover:opacity-80 transition-opacity bg-transparent text-[14px] uppercase",
      profile:
        "text-black bg-yellow-400 hover:bg-yellow-500 font-semibold transition flex items-center justify-center",
    };

    const sizeClasses = {
      sm: variant === "profile" ? "py-2 px-6" : "py-2 px-4",
      md: "py-3 px-4",
      lg: "py-3 px-6",
    };

    const widthClass = fullWidth ? "w-full" : "";

    // Для профильных кнопок используем rounded-full, для остальных - borderRadius: 100px
    const roundedStyle =
      variant === "profile"
        ? { ...style }
        : variant !== "ghost"
        ? { borderRadius: "100px", ...style }
        : style;

    const profileClass = variant === "profile" ? "rounded-full" : "";

    const combinedClassName = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClass,
      profileClass,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        className={combinedClassName}
        style={roundedStyle}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? "Загрузка..." : children}
        {icon && <span className="ml-2">{icon}</span>}
      </button>
    );
  }
);

AppButton.displayName = "AppButton";
