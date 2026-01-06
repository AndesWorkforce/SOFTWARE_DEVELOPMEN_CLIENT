"use client";

import { useRouter } from "next/navigation";
import { AddUserModal } from "./AddUserModal";

export default function AddUserModalPage() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return <AddUserModal onClose={handleClose} />;
}
