"use client";

import type { ReactNode } from "react";
import { FORM_FIELD_LABEL_CLASS } from "@/packages/types/formUi.constants";

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

/**
 * UI-only field wrapper: renders label + control + error message.
 * Useful with react-hook-form + zod to avoid repeating label/error markup across forms.
 */
export function FormField({ label, required = false, error, children }: FormFieldProps) {
  return (
    <div className="w-full">
      <p className={FORM_FIELD_LABEL_CLASS}>
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </p>
      <div className="w-full">{children}</div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
