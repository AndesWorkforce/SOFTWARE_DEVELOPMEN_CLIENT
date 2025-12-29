"use client";

import { AddUserModal } from "../@modal/(.)add/AddUserModal";
import { useRouter } from "next/navigation";

export default function AddUserPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push("..");
  };

  return <AddUserModal onClose={handleClose} />;
}
