"use client";

import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { EditUserModal } from "@/app/[locale]/(authorized)/app/super-admin/roles/@modal/(.)edit/[id]/EditUserModal";

export default function EditUserPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const userId = params?.id as string;

  const handleClose = () => {
    const basePath = `/${locale}/app/super-admin/roles`;
    router.push(basePath);
  };

  if (!userId) return null;

  return <EditUserModal userId={userId} onClose={handleClose} />;
}
