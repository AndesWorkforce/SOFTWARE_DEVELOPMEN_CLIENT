"use client";
import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import type { SelectOption } from "../../types/FilterPanel.types";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || `select-${generatedId}`;

    return (
      <div className="w-full relative">
        {label && (
          <label htmlFor={selectId} className="block text-[16px] font-medium text-black mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
        w-full h-[35px] md:h-[40px] px-[15px] pr-[40px]
        bg-white text-[#08252A] text-[14px] md:text-[16px]
            border rounded-[5px]
            shadow-[0px_4px_4px_rgba(166,166,166,0.25)]
            appearance-none
            cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-[rgba(166,166,166,0.5)]"
            }
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Chevron personalizado al estilo Figma */}
        <div className="pointer-events-none absolute right-[15px] top-1/2 -translate-y-1/2 flex items-center">
          <ChevronDown className="w-5 h-5 md:w-5 md:h-5 text-[#000000]" />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
