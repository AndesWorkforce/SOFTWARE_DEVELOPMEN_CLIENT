"use client";

import { useId } from "react";
import { Search } from "lucide-react";

export interface ContractorSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}

export function ContractorSearch({
  value = "",
  onChange,
  placeholder = "Search here...",
  className = "",
  "aria-label": ariaLabel = "Buscar contractor",
}: ContractorSearchProps) {
  const id = useId();

  return (
    <div
      className={`flex h-[45px] min-w-0 flex-1 items-center justify-between gap-2 rounded-[10px] border border-[rgba(166,166,166,0.5)] bg-white px-[10px] py-[5px] ${className}`}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <label htmlFor={id} className="text-[10px] font-normal leading-normal text-[#6d6d6d]">
          Contractor
        </label>
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="min-w-0 border-none bg-transparent p-0 text-[14px] font-medium text-black outline-none placeholder:text-[#c2c2c2]"
        />
      </div>
      <Search className="size-6 shrink-0 text-black" aria-hidden />
    </div>
  );
}
