import type { CSSProperties } from "react";

export const FORM_CONTROL_CLASS =
  "w-full h-[40px] md:h-[45px] px-[15px] rounded-[10px] border border-[#b6b4b4] shadow-none text-[15px] md:text-[16px]";

export const FORM_SELECT_CLASS =
  "w-full h-[40px] md:h-[45px] px-[15px] pr-[40px] rounded-[10px] border border-[#b6b4b4] shadow-none text-[15px] md:text-[16px]";

export const FORM_CONTROL_STYLE: CSSProperties = {
  borderColor: "#b6b4b4",
  paddingTop: 0,
  paddingBottom: 0,
};

export function getFormControlStyle(hasError?: boolean): CSSProperties {
  return {
    ...FORM_CONTROL_STYLE,
    borderColor: hasError ? "#ef4444" : "#b6b4b4",
  };
}

export const FORM_TEXTAREA_CLASS =
  "w-full px-[15px] py-[12px] rounded-[10px] border border-[#b6b4b4] text-[15px] md:text-[16px]";

export const FORM_PRIMARY_BUTTON_STYLE: CSSProperties = {
  width: "100%",
  height: "45px",
  background: "#0097b2",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: 600,
  padding: "12px 15px",
  borderRadius: "10px",
  boxShadow: "0px 4px 4px rgba(166, 166, 166, 0.25)",
};

export const FORM_SECONDARY_BUTTON_STYLE: CSSProperties = {
  width: "100%",
  height: "45px",
  background: "#a6a6a6",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: 600,
  padding: "12px 15px",
  borderRadius: "10px",
  boxShadow: "0px 4px 4px rgba(166, 166, 166, 0.25)",
};

export const FORM_FIELD_LABEL_CLASS = "text-[16px] font-semibold text-black leading-normal mb-1";
