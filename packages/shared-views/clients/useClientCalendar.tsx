"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Users, BadgeAlert, BriefcaseBusiness } from "lucide-react";

import type { ClientCalendarCardDataProps } from "@/packages/design-system/components/ClientCalendarCardData";
import type { ClientCalendarTeam } from "@/packages/design-system/components/ClientCalendar";
import { clientsService } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import { contractorsService } from "@/packages/api/contractors/contractors.service";

export interface UseClientCalendarResult {
  clientName: string;
  cards: ClientCalendarCardDataProps[];
  teams: ClientCalendarTeam[];
}

export function useClientCalendar(clientId: string | null | undefined): UseClientCalendarResult {
  const tCalendarStats = useTranslations("calendar.stats");

  const [clientName, setClientName] = useState<string>("Client");
  const [teams, setTeams] = useState<ClientCalendarTeam[]>([]);
  const [totalContractors, setTotalContractors] = useState<number>(0);
  const [contractorsWithoutDayOffToday, setContractorsWithoutDayOffToday] = useState<number>(0);
  const [fullTimeCount, setFullTimeCount] = useState<number>(0);
  const [partTimeCount, setPartTimeCount] = useState<number>(0);

  useEffect(() => {
    const loadClient = async () => {
      if (!clientId) return;
      console.log("[useClientCalendar] Loading client calendar for clientId:", clientId);
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

  useEffect(() => {
    const loadTeams = async () => {
      if (!clientId) return;
      console.log("[useClientCalendar] Loading teams for clientId:", clientId);
      try {
        const apiTeams = await teamsService.getByClientId(clientId);
        setTeams(
          apiTeams.map((team) => ({
            id: team.id,
            name: team.name,
          })),
        );
      } catch (error) {
        console.error("❌ Error cargando teams del cliente en useClientCalendar:", error);
      }
    };

    loadTeams();
  }, [clientId]);

  useEffect(() => {
    const loadContractorsStats = async () => {
      if (!clientId) return;
      try {
        const [allContractors, noDayOffToday] = await Promise.all([
          contractorsService.getByClientId(clientId),
          contractorsService.getByClientIdWithoutDayOffToday(clientId),
        ]);

        setTotalContractors(allContractors.length);
        setContractorsWithoutDayOffToday(noDayOffToday.length);

        const fullTime = allContractors.filter((c) => c.job_schedule === "full_time").length;
        const partTime = allContractors.filter((c) => c.job_schedule === "part_time").length;

        setFullTimeCount(fullTime);
        setPartTimeCount(partTime);
      } catch (error) {
        console.error("❌ Error cargando stats de contractors en useClientCalendar:", error);
        setTotalContractors(0);
        setContractorsWithoutDayOffToday(0);
        setFullTimeCount(0);
        setPartTimeCount(0);
      }
    };

    loadContractorsStats();
  }, [clientId]);

  const contractorsWithDayOffToday =
    totalContractors > 0 ? Math.max(totalContractors - contractorsWithoutDayOffToday, 0) : 0;

  const cards: ClientCalendarCardDataProps[] = [
    {
      icon: <Users className="h-7 w-7" />,
      title: tCalendarStats("todayCapacity"),
      value: totalContractors > 0 ? `${contractorsWithoutDayOffToday}/${totalContractors}` : "0/0",
      accentColorClass: "text-[#0097B2]",
    },
    {
      icon: <BadgeAlert className="h-7 w-7" />,
      title: tCalendarStats("todayAbsences"),
      value: contractorsWithDayOffToday,
      accentColorClass: "text-[#FE6A35]",
    },
    {
      icon: <BriefcaseBusiness className="h-7 w-7" />,
      title: tCalendarStats("fullTimeContractors"),
      value: fullTimeCount,
      accentColorClass: "text-[#7E22CE]",
    },
    {
      icon: <BriefcaseBusiness className="h-7 w-7" />,
      title: tCalendarStats("partTimeContractors"),
      value: partTimeCount,
      accentColorClass: "text-[#0E7490]",
    },
  ];

  return { clientName, cards, teams };
}
