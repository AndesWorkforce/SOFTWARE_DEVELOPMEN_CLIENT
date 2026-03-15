"use client";

import { useParams } from "next/navigation";
import { CreateTeamModal } from "../../../teams/add/CreateTeamModal";

export default function ClientAddTeamModalRoute() {
  const params = useParams<{ id: string }>();
  const clientId = params?.id;
  if (!clientId) return null;

  return <CreateTeamModal clientId={clientId} />;
}
