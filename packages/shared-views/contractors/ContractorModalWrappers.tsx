"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { AddContractorModal } from "./AddContractorModal";
import { EditContractorModal } from "./EditContractorModal";
import { DeleteContractorModal } from "./DeleteContractorModal";

export type ContractorAppRole = "super-admin" | "admin";

/**
 * Close intercepting-route modals. `router.push` to the list often leaves @modal mounted;
 * `back` dismisses the slot, `replace` covers hard navigation / empty history.
 */
export function useContractorsListClose(role: ContractorAppRole) {
  const locale = useLocale();
  const router = useRouter();
  const listPath = `/${locale}/app/${role}/contractors`;

  return () => {
    router.back();
    window.setTimeout(() => {
      router.replace(listPath);
    }, 50);
  };
}

function useClientContractorsClose(role: ContractorAppRole, clientId: string) {
  const locale = useLocale();
  const router = useRouter();
  const basePath = `/${locale}/app/${role}/clients/${clientId}`;

  return () => {
    router.back();
    window.setTimeout(() => {
      router.replace(basePath);
    }, 50);
  };
}

export function AddContractorModalWrapper({
  clientId,
  role,
}: {
  clientId: string;
  role: ContractorAppRole;
}) {
  const close = useClientContractorsClose(role, clientId);
  return <AddContractorModal onClose={close} initialClientId={clientId} lockClient />;
}

export function EditContractorModalWrapper({
  clientId,
  contractorId,
  role,
}: {
  clientId: string;
  contractorId: string;
  role: ContractorAppRole;
}) {
  const close = useClientContractorsClose(role, clientId);
  return <EditContractorModal contractorId={contractorId} onClose={close} />;
}

export function DeleteContractorModalWrapper({
  clientId,
  contractorId,
  role,
}: {
  clientId: string;
  contractorId: string;
  role: ContractorAppRole;
}) {
  const close = useClientContractorsClose(role, clientId);
  return <DeleteContractorModal contractorId={contractorId} onClose={close} />;
}
