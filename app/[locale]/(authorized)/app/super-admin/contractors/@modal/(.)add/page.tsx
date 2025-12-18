"use client";

import { useRouter } from "next/navigation";
import { AddContractorModal } from "./AddContractorModal";

export default function AddContractorPage() {
  const router = useRouter();

  const handleClose = () => {
    // Usar router.back() para volver a la página anterior sin recargar
    // Esto funciona correctamente con intercepting routes
    router.back();
  };

  return <AddContractorModal onClose={handleClose} />;
}
