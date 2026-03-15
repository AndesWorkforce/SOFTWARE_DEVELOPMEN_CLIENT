"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { AddClientModal } from "@/app/[locale]/(authorized)/app/super-admin/clients/@modal/(.)add/AddClientModal";

export default function AddClientPage() {
  const router = useRouter();
  const locale = useLocale();

  const handleClose = () => {
    const basePath = `/${locale}/app/super-admin/clients`;
    router.push(basePath);
  };

  return <AddClientModal onClose={handleClose} />;
}
