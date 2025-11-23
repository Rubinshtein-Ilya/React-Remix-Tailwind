import React from "react";
import { cn } from "~/lib/utils";
import { RiArrowRightLongLine } from "@remixicon/react";
import clsx from "clsx";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-[17px] uppercase disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      primary:
        "text-white bg-[#121212] hover:!opacity-80 active:!opacity-90 focus:ring-gray-700",
      secondary:
        "text-[#121212] bg-[#F9B234] hover:!opacity-80 active:!opacity-90 focus:ring-yellow-500",
      ghost:
        "text-[#121212] hover:opacity-80 transition-opacity bg-transparent",
    };

    const sizeClasses = {
      sm: "py-2 px-4",
      md: "py-3 px-4",
      lg: "py-3 px-6",
    };

    const roundedStyle = variant !== "ghost" ? { borderRadius: "100px" } : {};

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          "w-full",
          className
        )}
        style={roundedStyle}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? "Загрузка..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";

interface IProps {
  text: string;
  styles?: string;
  onClick?: () => void;
  arrow?: boolean;
  disabled?: boolean;
}

function ButtonComponent({ ...props }: IProps) {
  const { text, styles, onClick, arrow = true, disabled = false } = props;
  return (
    <button
      className={clsx(
        `flex w-fit text-nowrap h-16 items-center gap-2 uppercase text-xl font-medium  px-11 rounded-full`,
        styles
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
      {arrow && <RiArrowRightLongLine size={24} />}
    </button>
  );
}

export default ButtonComponent;
