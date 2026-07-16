"use client";

import { AddContractorModal, useContractorsListClose } from "@/packages/shared-views/contractors";

export default function AddContractorPage() {
  const handleClose = useContractorsListClose("super-admin");
  return <AddContractorModal onClose={handleClose} />;
}
