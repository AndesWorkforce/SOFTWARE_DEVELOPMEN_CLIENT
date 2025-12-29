"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/packages/design-system";
import { usersService } from "@/packages/api/users/users.service";
import { Trash2 } from "lucide-react";

interface DeleteUserModalProps {
  userId: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteUserModal({ userId, onClose, onDeleted }: DeleteUserModalProps) {
  const t = useTranslations("roles.modal");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await usersService.remove(userId);
      if (onDeleted) {
        onDeleted();
      }
      setShowSuccess(true);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(t("errorDeleting") || "Error deleting user. Please try again.");
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-[12px] px-8 py-6 shadow-lg w-[80%] max-w-[400px] md:w-full text-center">
            <div className="flex justify-center mb-4">
              <Trash2 className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "#000000" }}>
              {t("deleteSuccessTitle") || "Deleted!"}
            </h2>
            <p className="text-[15px] mb-6" style={{ color: "#4B5563" }}>
              {t("deleteSuccessMessage") || "User has been deleted successfully."}
            </p>
            <Button
              onClick={handleSuccessContinue}
              style={{
                background: "#0097B2",
                color: "#FFFFFF",
                padding: "8px 20px",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 500,
              }}
            >
              {t("continue") || "Continue"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
