"use client";

import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { EditClientModal } from "@/app/[locale]/(authorized)/app/super-admin/clients/@modal/(.)edit/[id]/EditClientModal";

export default function EditClientPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const clientId = params?.id as string;

  const handleClose = () => {
    const basePath = `/${locale}/app/super-admin/clients`;
    router.push(basePath);
  };

  if (!clientId) return null;

  return <EditClientModal clientId={clientId} onClose={handleClose} />;
}
