"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { AddContractorModal } from "@/app/[locale]/(authorized)/app/super-admin/contractors/@modal/(.)add/AddContractorModal";

export default function AddContractorPage() {
  const router = useRouter();
  const locale = useLocale();

  const handleClose = () => {
    // Navegar de vuelta a contractors
    const basePath = `/${locale}/app/super-admin/contractors`;
    router.push(basePath);
  };

  // Esta página solo se renderiza en navegación directa (hard navigation)
  // En navegación interceptada, se usa @modal/(.)add/page.tsx
  return <AddContractorModal onClose={handleClose} />;
}
