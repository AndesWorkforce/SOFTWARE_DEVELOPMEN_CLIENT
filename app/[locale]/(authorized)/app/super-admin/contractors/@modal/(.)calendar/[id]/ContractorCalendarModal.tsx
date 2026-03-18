"use client";

import { DsContractorCalendarModal } from "@/packages/design-system";

interface ContractorCalendarModalProps {
  contractorId: string;
  contractorName?: string;
  onClose: () => void;
}

export const ContractorCalendarModal = (props: ContractorCalendarModalProps) => {
  return <DsContractorCalendarModal {...props} />;
};
