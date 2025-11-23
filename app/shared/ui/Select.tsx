import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface SelectOption {
  value: string;
  label: React.ReactNode;
}

interface SelectLabelProps {
  children: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  children?: React.ReactNode;
}

// Контекст для передачи состояния
const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  disabled?: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
} | null>(null);

export const Select: React.FC<SelectProps> = ({ 
  value, 
  onValueChange, 
  children, 
  disabled = false,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, disabled, triggerRef }}>
      <div ref={selectRef} className={`relative ${className}`}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = "" }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");

  const { isOpen, setIsOpen, disabled, triggerRef } = context;

  return (
    <button
      ref={triggerRef}
      type="button"
      disabled={disabled}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      className={`
        w-full flex items-center justify-between 
        rounded-lg py-[10px] px-[30px] border border-[#CFCFCF] 
        bg-white text-[#121212] text-sm
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-[#787878]"}
        ${isOpen ? "border-[#121212]" : ""}
        ${className}
      `}
    >
      {children}
      <svg
        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none"
        stroke="#787878"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({ children }) => {
  return <span>{children}</span>;
};

export const SelectLabel: React.FC<SelectLabelProps> = ({ children }) => {
  return (
    <p className="text-sm text-[#787878] font-semibold mb-2">
      {children}
    </p>
  );
}

export const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used within Select");

  const { isOpen, triggerRef } = context;
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      
      // Если места снизу мало, показываем сверху
      const showAbove = spaceBelow < 200;
      
      setPosition({
        top: showAbove ? rect.top - 200 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 9999,
      }}
      className="
        bg-white border border-[#CFCFCF] rounded-lg shadow-lg
        max-h-60 overflow-auto
      "
    >
      {children}
    </div>,
    document.body
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within Select");

  const { value: selectedValue, onValueChange, setIsOpen } = context;
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      onMouseDown={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      className={`
        w-full text-left px-[15px] py-[10px] text-sm
        hover:bg-[#F5F5F5] transition-colors
        ${isSelected ? "bg-[#F5F5F5] text-[#121212] font-medium" : "text-[#787878]"}
        first:rounded-t-lg last:rounded-b-lg
      `}
    >
      {children}
    </button>
  );
}; 