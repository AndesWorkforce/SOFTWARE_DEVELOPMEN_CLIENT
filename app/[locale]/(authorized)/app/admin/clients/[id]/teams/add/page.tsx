"use client";

import { useParams } from "next/navigation";
import { CreateTeamModal } from "./CreateTeamModal";

export default function CreateTeamPage() {
  const params = useParams<{ id: string }>();
  const clientId = params?.id;

  if (!clientId) return null;

  return <CreateTeamModal clientId={clientId} />;
}
