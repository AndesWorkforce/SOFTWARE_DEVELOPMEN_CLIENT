"use client";

import { useRouter } from "next/navigation";
import { AddClientModal } from "./AddClientModal";

export default function AddClientModalPage() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return <AddClientModal onClose={handleClose} />;
}
