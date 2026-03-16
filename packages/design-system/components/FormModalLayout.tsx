"use client";

import type { CSSProperties, ReactNode } from "react";
import { Modal } from "./Modal";

export interface FormModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  contentPadding?: string;
  modalStyle?: CSSProperties;
  titleStyle?: CSSProperties;
  errorMessage?: string | null;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Layout-only modal container to be used with react-hook-form + zod in the calling component.
 * Keeps the same visual container used by `FormModal` (border/shadow/padding) but does NOT manage fields/state.
 */
export function FormModalLayout({
  isOpen,
  onClose,
  title,
  size = "md",
  className = "",
  contentPadding,
  modalStyle,
  titleStyle,
  errorMessage,
  children,
  footer,
}: FormModalLayoutProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      showHeader={false}
      containerClassName="rounded-none shadow-none"
      containerStyle={{ background: "transparent", border: "none", boxShadow: "none" }}
      contentClassName="p-0"
    >
      <div
        className={`bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] px-[40px] py-[30px] md:max-w-none ${className}`}
        style={{
          width: "100%",
          maxWidth: "338px",
          marginLeft: "auto",
          marginRight: "auto",
          ...(contentPadding && { padding: contentPadding }),
          ...modalStyle,
        }}
      >
        <div className="flex flex-col gap-[30px] items-center">
          <h2
            className="text-[24px] font-semibold text-black text-center w-full"
            style={titleStyle}
          >
            {title}
          </h2>

          {errorMessage && (
            <div className="w-full p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          <div className="w-full">{children}</div>

          {footer ? <div className="w-full">{footer}</div> : null}
        </div>
      </div>
    </Modal>
  );
}
