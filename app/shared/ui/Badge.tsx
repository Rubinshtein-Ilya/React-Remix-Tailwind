import React from "react";

type BadgeVariant = "default" | "secondary" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[#121212] text-white",
  secondary: "bg-[#F5F5F5] text-[#787878]",
  outline: "border border-[#CFCFCF] bg-white text-[#121212]",
};

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = "default", 
  className = "" 
}) => {
  const baseStyles = "inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium";
  
  // Если передан className, используем его вместо стилей варианта
  const finalStyles = className 
    ? `${baseStyles} ${className}`
    : `${baseStyles} ${variantStyles[variant]}`;
  
  return (
    <span className={finalStyles}>
      {children}
    </span>
  );
}; 