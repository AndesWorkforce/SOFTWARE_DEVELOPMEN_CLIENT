"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/packages/design-system";
import { clientsService } from "@/packages/api/clients/clients.service";

interface DeleteClientModalProps {
  clientId: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteClientModal({ clientId, onClose, onDeleted }: DeleteClientModalProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await clientsService.remove(clientId);
      if (onDeleted) {
        onDeleted();
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] px-[40px] py-[30px] md:py-[25px] w-[80%] max-w-[423px] md:max-w-[480px] md:w-full flex items-center justify-center">
        <div className="flex flex-col gap-[30px] items-center w-full max-w-[343px] md:max-w-[400px]">
          <div className="flex flex-col gap-[15px] text-center w-full">
            <h2 className="text-[24px] font-bold text-black">
              {t("clients.deleteConfirmTitle") || "Are you sure?"}
            </h2>
            <p className="text-[16px] font-normal text-[#1E1E1E]">
              {t("clients.deleteConfirmSubtitle") ||
                "This action cannot be undone. All values associated with this user will be lost."}
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-[10px] w-full">
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={loading}
              className="w-full md:flex-1"
              style={{
                background: "#FF0004",
                color: "#FFFFFF",
                height: "45px",
                padding: "12px 15px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: 600,
                boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
              }}
            >
              {t("clients.deleteConfirmDelete") || "Delete"}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="w-full md:flex-1"
              style={{
                background: "#A6A6A6",
                color: "#FFFFFF",
                height: "45px",
                padding: "12px 15px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: 600,
                boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
              }}
            >
              {t("clients.deleteConfirmCancel") || "Cancel"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
