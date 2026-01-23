"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { AddContractorModal } from "@/app/[locale]/(authorized)/app/admin/contractors/@modal/(.)add/AddContractorModal";

export function AddContractorModalWrapper({ clientId }: { clientId: string }) {
  const locale = useLocale();
  const router = useRouter();
  const basePath = `/${locale}/app/admin/clients/${clientId}`;

  const close = () => {
    // En intercepting routes, el cierre correcto es volver atrás (desmonta @modal).
    router.back();
    // Fallback para casos donde el usuario entró directo por URL al modal route.
    window.setTimeout(() => {
      router.replace(basePath);
    }, 50);
  };

  return <AddContractorModal onClose={close} initialClientId={clientId} lockClient />;
}
