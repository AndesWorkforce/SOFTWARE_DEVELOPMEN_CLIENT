"use client";

import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { DeleteClientModal } from "@/app/[locale]/(authorized)/app/super-admin/clients/@modal/(.)delete/[id]/DeleteClientModal";

export default function DeleteClientPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const clientId = params?.id as string;

  const handleClose = () => {
    const basePath = `/${locale}/app/super-admin/clients`;
    router.push(basePath);
  };

  if (!clientId) return null;

  return <DeleteClientModal clientId={clientId} onClose={handleClose} />;
}
