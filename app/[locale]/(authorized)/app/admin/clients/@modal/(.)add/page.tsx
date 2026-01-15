"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { AddClientModal } from "./AddClientModal";

export default function AddPage() {
  const router = useRouter();
  const locale = useLocale();

  const handleClose = () => {
    router.push(`/${locale}/app/admin/clients`);
  };

  return <AddClientModal onClose={handleClose} />;
}
