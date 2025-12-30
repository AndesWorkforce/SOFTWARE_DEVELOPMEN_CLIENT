"use client";

import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { DeleteUserModal } from "@/app/[locale]/(authorized)/app/super-admin/roles/@modal/(.)delete/[id]/DeleteUserModal";

export default function DeleteUserPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const userId = params?.id as string;

  const handleClose = () => {
    const basePath = `/${locale}/app/super-admin/roles`;
    router.push(basePath);
  };

  if (!userId) return null;

  return <DeleteUserModal userId={userId} onClose={handleClose} />;
}
