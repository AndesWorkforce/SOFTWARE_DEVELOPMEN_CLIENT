"use client";
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showHeader?: boolean;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showHeader = true,
  overlayClassName = "",
  overlayStyle,
  containerClassName = "",
  containerStyle,
  contentClassName = "",
  contentStyle,
}: ModalProps) => {
  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw]",
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
      style={{ background: "rgba(0, 0, 0, 0.5)", ...overlayStyle }}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${sizeClasses[size]} rounded-[10px] shadow-xl ${containerClassName}`}
        style={{
          background: "#FFFFFF",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(166, 166, 166, 0.5)",
          boxShadow: "0px 4px 4px rgba(166, 166, 166, 0.25)",
          ...containerStyle,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {showHeader && (
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "#E5E5E5" }}
          >
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: "#000000" }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" style={{ color: "#000000" }} />
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className={`px-6 py-4 overflow-y-auto flex-1 ${contentClassName}`}
          style={{ overflowX: "hidden", ...contentStyle }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
