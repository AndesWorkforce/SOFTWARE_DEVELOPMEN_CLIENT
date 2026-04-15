"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import type { SelectOption } from "../../types/FilterPanel.types";

export interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  id?: string;
  /** Texto si no hay coincidencias al filtrar */
  emptyFilterMessage?: string;
}

export function SearchableSelect({
  label,
  placeholder = "",
  options,
  value,
  onValueChange,
  required,
  error,
  disabled,
  id,
  emptyFilterMessage = "Sin resultados",
}: SearchableSelectProps) {
  const generatedId = useId();
  const inputId = id || `searchable-select-${generatedId}`;
  const listId = `${inputId}-listbox`;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const portalListRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [listCoords, setListCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 240,
  });

  const selectable = useMemo(() => options.filter((o) => o.value !== ""), [options]);

  const selectedLabel = useMemo(() => {
    const found = selectable.find((o) => o.value === value);
    return found?.label ?? "";
  }, [selectable, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return selectable;
    return selectable.filter((o) => o.label.toLowerCase().includes(q));
  }, [selectable, query]);

  const displayValue = open ? query : selectedLabel;

  const inputPlaceholder = open
    ? !query && !selectedLabel
      ? placeholder
      : undefined
    : !selectedLabel
      ? placeholder
      : undefined;

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const updateListPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 4;
    const preferredMax = 240;
    const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - gap - 8);
    const maxHeight = Math.min(preferredMax, spaceBelow);
    setListCoords({
      top: rect.bottom + gap,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateListPosition();
    window.addEventListener("resize", updateListPosition);
    window.addEventListener("scroll", updateListPosition, true);
    return () => {
      window.removeEventListener("resize", updateListPosition);
      window.removeEventListener("scroll", updateListPosition, true);
    };
  }, [open, updateListPosition, filtered.length]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || portalListRef.current?.contains(t)) return;
      close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
  };

  const pick = (v: string) => {
    onValueChange(v);
    close();
  };

  const borderClass = error
    ? "border-red-300 focus-within:ring-red-500 focus-within:border-red-500"
    : "border-[rgba(166,166,166,0.5)] focus-within:ring-[#0097B2] focus-within:border-[#0097B2]";

  const dropdownList =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <ul
        ref={portalListRef}
        id={listId}
        role="listbox"
        className="overflow-auto rounded-[5px] border border-[rgba(166,166,166,0.5)] bg-white py-1 shadow-lg"
        style={{
          position: "fixed",
          top: listCoords.top,
          left: listCoords.left,
          width: listCoords.width,
          maxHeight: listCoords.maxHeight,
          zIndex: 100,
        }}
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-2 text-sm text-gray-500">{emptyFilterMessage}</li>
        ) : (
          filtered.map((opt) => (
            <li key={opt.value} role="option" aria-selected={value === opt.value}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-[14px] md:text-[16px] text-[#08252A] hover:bg-[#E0F7FA]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(opt.value)}
              >
                {opt.label}
              </button>
            </li>
          ))
        )}
      </ul>,
      document.body,
    );

  return (
    <div className="w-full" ref={rootRef}>
      {label && (
        <label htmlFor={inputId} className="block text-[16px] font-medium text-black mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative w-full">
        <div
          ref={triggerRef}
          className={`
            flex w-full h-[35px] md:h-[40px] items-stretch rounded-[5px] border bg-white shadow-[0px_4px_4px_rgba(166,166,166,0.25)]
            focus-within:ring-2
            ${borderClass}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            disabled={disabled}
            placeholder={inputPlaceholder}
            value={displayValue}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={openList}
            className="min-w-0 flex-1 bg-transparent px-[15px] pr-2 text-[14px] md:text-[16px] text-[#08252A] placeholder:text-[#6B7280] focus:outline-none rounded-[5px] disabled:cursor-not-allowed"
          />
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            disabled={disabled}
            onClick={() => (open ? close() : openList())}
            className="pointer-events-auto flex shrink-0 items-center justify-center px-2 text-[#000000] disabled:cursor-not-allowed"
          >
            <ChevronDown className="h-5 w-5 shrink-0" aria-hidden />
          </button>
        </div>

        {dropdownList}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
