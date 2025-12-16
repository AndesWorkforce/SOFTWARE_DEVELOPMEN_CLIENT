"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/packages/design-system";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import { Trash2 } from "lucide-react";

interface DeleteContractorModalProps {
  contractorId: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteContractorModal({
  contractorId,
  onClose,
  onDeleted,
}: DeleteContractorModalProps) {
  const t = useTranslations("contractors.modal");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await contractorsService.delete(contractorId);
      if (onDeleted) {
        onDeleted();
      }
      setShowSuccess(true);
    } catch (error) {
      console.error("Error deleting contractor:", error);
      alert(t("errorDeleting") || "Error deleting contractor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    onClose();
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <>
      {/* Modal de confirmación */}
      {!showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-[12px] px-8 py-6 shadow-lg w-[80%] max-w-[400px] md:w-full">
            <h2 className="text-xl font-semibold text-center mb-3" style={{ color: "#000000" }}>
              {t("deleteConfirmTitle") || "Are you sure?"}
            </h2>
            <p className="text-[15px] text-center mb-6" style={{ color: "#4B5563" }}>
              {t("deleteConfirmSubtitle") ||
                "This action cannot be undone. All values associated with this user will be lost."}
            </p>
            <div className="flex flex-col md:flex-row w-full gap-[10px]">
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loading}
                className="w-full md:w-auto"
                style={{
                  background: "#FF0004",
                  color: "#FFFFFF",
                  padding: "8px 20px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: 500,
                }}
              >
                {t("deleteConfirmDelete") || "Delete"}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-full md:w-auto"
                style={{
                  background: "#A6A6A6",
                  color: "#FFFFFF",
                  padding: "8px 24px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: 500,
                }}
              >
                {t("deleteConfirmCancel") || "Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] px-[40px] py-[30px] flex items-center justify-center w-[80%] max-w-[400px] md:w-full">
            <div className="flex flex-col items-center justify-between h-[184px] w-[360px] gap-[15px]">
              <div className="flex flex-col items-center gap-[15px] w-full">
                <Trash2 className="w-[75px] h-[75px] text-[#000000]" />
                <p
                  className="text-[16px] text-center text-[#1e1e1e] font-normal leading-normal"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {t("deleteSuccessTitle") || "Contractor deleted successfully"}
                </p>
              </div>
              <Button
                type="button"
                onClick={handleSuccessContinue}
                style={{
                  background: "#0097b2",
                  color: "#FFFFFF",
                  height: "45px",
                  padding: "12px 15px",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: 600,
                  width: "100%",
                  boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {t("deleteSuccessContinue") || "Continue"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
