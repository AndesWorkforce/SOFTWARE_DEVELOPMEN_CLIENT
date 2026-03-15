export function openTimePicker(input: HTMLInputElement | null) {
  if (!input) return;

  // showPicker es experimental; usamos cast seguro
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyInput = input as any;
  if (typeof (anyInput as { showPicker?: () => void }).showPicker === "function") {
    (anyInput as { showPicker: () => void }).showPicker();
    return;
  }

  input.focus();
  input.click();
}
