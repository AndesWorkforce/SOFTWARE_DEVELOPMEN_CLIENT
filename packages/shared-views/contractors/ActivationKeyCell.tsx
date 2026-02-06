"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { contractorsService } from "@/packages/api/contractors/contractors.service";

interface ActivationKeyCellProps {
  value: string | null;
  contractorId: string;
}

export const ActivationKeyCell = ({ value, contractorId }: ActivationKeyCellProps) => {
  const t = useTranslations();
  const [isCopied, setIsCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  if (!value) return <span>N/A</span>;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCopying) return;

    try {
      setIsCopying(true);
      // Obtener la clave completa desde el backend
      const fullKey = await contractorsService.getFullActivationKey(contractorId);
      await navigator.clipboard.writeText(fullKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying activation key:", error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="inline-flex items-center justify-start md:justify-center gap-2 whitespace-normal">
      <span className="text-[14px] font-normal font-mono max-w-[180px] text-left break-all leading-tight">
        {value}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <button
            onClick={handleCopy}
            disabled={isCopying}
            className={`text-[#0097B2] hover:opacity-70 transition-opacity ${
              isCopying ? "cursor-wait opacity-50" : "cursor-pointer"
            }`}
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </button>
          {isCopied && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded shadow-lg animate-in fade-in zoom-in duration-200 z-10 whitespace-nowrap">
              {t("contractors.table.copied")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
