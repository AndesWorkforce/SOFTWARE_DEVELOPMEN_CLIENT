export type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

export function requiredMessage(tCommon: TranslateFn, fieldLabel: string): string {
  return tCommon("formModal.fieldRequired", { field: fieldLabel }) || `${fieldLabel} is required`;
}

export function invalidEmailMessage(tCommon: TranslateFn): string {
  return tCommon("formModal.invalidEmail") || "Invalid email address";
}
