"use client";

import { AddContractorModal, useContractorsListClose } from "@/packages/shared-views/contractors";

export default function AddContractorModalPage() {
  const handleClose = useContractorsListClose("admin");
  return <AddContractorModal onClose={handleClose} />;
}
