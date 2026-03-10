"use client";

import { useEffect, useState } from "react";
import { Users, BadgeAlert, BriefcaseBusiness } from "lucide-react";

import type { ClientCalendarCardDataProps } from "@/packages/design-system/components/ClientCalendarCardData";
import type { ClientCalendarTeam } from "@/packages/design-system/components/ClientCalendar";
import { clientsService } from "@/packages/api/clients/clients.service";

export interface UseClientCalendarResult {
  clientName: string;
  cards: ClientCalendarCardDataProps[];
  /** Equipos del cliente. Mock para pruebas; luego reemplazar por API. */
  teams: ClientCalendarTeam[];
}

export function useClientCalendar(clientId: string | null | undefined): UseClientCalendarResult {
  const [clientName, setClientName] = useState<string>("Client");

  useEffect(() => {
    const loadClient = async () => {
      if (!clientId) return;
      try {
        const client = await clientsService.getById(clientId);
        if (client?.name) {
          setClientName(client.name);
        }
      } catch (error) {
        console.error("❌ Error cargando datos del cliente en useClientCalendar:", error);
      }
    };

    loadClient();
  }, [clientId]);

  const cards: ClientCalendarCardDataProps[] = [
    {
      icon: <Users className="h-7 w-7" />,
      title: "Today Capacity",
      value: "90/100",
      accentColorClass: "text-[#0097B2]",
    },
    {
      icon: <BadgeAlert className="h-7 w-7" />,
      title: "Today Absences",
      value: 3,
      accentColorClass: "text-[#FE6A35]",
    },
    {
      icon: <BriefcaseBusiness className="h-7 w-7" />,
      title: "Full-Time Contractors",
      value: 80,
      accentColorClass: "text-[#7E22CE]",
    },
    {
      icon: <BriefcaseBusiness className="h-7 w-7" />,
      title: "Part-Time Contractors",
      value: 20,
      accentColorClass: "text-[#0E7490]",
    },
  ];

  // Mock de equipos para probar las tabs (reemplazar por API cuando exista)
  const teams: ClientCalendarTeam[] = [
    { id: "1", name: "Team DevOps" },
    { id: "2", name: "Team Frontend" },
    { id: "3", name: "Team Backend" },
    { id: "4", name: "Team QA" },
    { id: "5", name: "Team Data" },
  ];

  return { clientName, cards, teams };
}
