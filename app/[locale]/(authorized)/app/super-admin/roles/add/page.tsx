"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { AddUserModal } from "@/app/[locale]/(authorized)/app/super-admin/roles/@modal/(.)add/AddUserModal";

export default function AddUserPage() {
  const router = useRouter();
  const locale = useLocale();

  const handleClose = () => {
    // Navegar de vuelta a roles
    const basePath = `/${locale}/app/super-admin/roles`;
    router.push(basePath);
  };

  // Esta página solo se renderiza en navegación directa (hard navigation)
  // En navegación interceptada, se usa @modal/(.)add/page.tsx
  return <AddUserModal onClose={handleClose} />;
}
