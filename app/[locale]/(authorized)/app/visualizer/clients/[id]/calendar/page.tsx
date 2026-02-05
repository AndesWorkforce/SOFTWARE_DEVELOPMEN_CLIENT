"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Header,
  ClientCalendarStats,
  TeamFilters,
  AbsenceLegend,
  ClientCalendarGrid,
  MobileCalendarList,
  AbsenceDetailModal,
} from "@/packages/design-system";
import type { AbsenceEvent } from "@/packages/design-system";
import type { TeamFilterOption, CalendarStat } from "@/packages/design-system";
import { clientsService } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import { contractorsService } from "@/packages/api/contractors/contractors.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClientCalendarPage({ params }: PageProps) {
  const { id } = use(params);
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [clientName, setClientName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teams, setTeams] = useState<TeamFilterOption[]>([]);
  const [absences, setAbsences] = useState<AbsenceEvent[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeContractors, setActiveContractors] = useState<number>(0);
  const [totalContractors, setTotalContractors] = useState<number>(0);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Modal state
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [modalAbsences, setModalAbsences] = useState<AbsenceEvent[]>([]);

  // Calcular estadísticas en tiempo real
  const todayAbsences = absences.filter((absence) => {
    const today = new Date();
    const absenceDate = new Date(absence.date);
    return (
      absenceDate.getFullYear() === today.getFullYear() &&
      absenceDate.getMonth() === today.getMonth() &&
      absenceDate.getDate() === today.getDate()
    );
  }).length;

  const todayCapacity =
    totalContractors > 0
      ? Math.round(((totalContractors - todayAbsences) / totalContractors) * 100)
      : 0;

  const stats: CalendarStat[] = [
    {
      label: t("calendar.stats.todayCapacity") || "Today Capacity",
      value: `${todayCapacity}%`,
    },
    {
      label: t("calendar.stats.todayAbsences") || "Today Absences",
      value: todayAbsences.toString(),
    },
    {
      label: t("calendar.stats.activeContractors") || "Active Contractors",
      value: `${activeContractors}/${totalContractors}`,
    },
  ];

  // Cargar datos iniciales del cliente (solo una vez)
  const loadClientData = useCallback(async () => {
    try {
      setLoading(true);
      const client = await clientsService.getById(id);
      setClientName(client.name);

      // Cargar equipos del cliente
      const allTeams = await teamsService.getAll();
      const clientTeams = allTeams.filter((team) => team.client_id === id);
      setTeams(
        clientTeams.map((team) => ({
          id: team.id,
          label: team.name,
        })),
      );
    } catch (error) {
      console.error("Error loading client data:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Cargar datos del calendario (ausencias y estadísticas)
  const loadCalendarData = useCallback(async () => {
    try {
      // Cargar ausencias reales desde el API
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const dayOffs = await clientsService.getDayOffs(id, {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        ...(selectedTeamId && { teamId: selectedTeamId }),
      });

      // Mapear day-offs a formato AbsenceEvent
      const mappedAbsences: AbsenceEvent[] = dayOffs.map((dayOff) => ({
        id: dayOff.id,
        date: new Date(dayOff.date),
        contractorName: dayOff.contractor_name,
        contractorRole: dayOff.team_name || "Sin equipo",
        type: dayOff.reason as "license" | "vacation" | "health",
      }));

      setAbsences(mappedAbsences);

      // Cargar contratistas del cliente para las estadísticas
      const contractors = await contractorsService.getAll({
        client_id: id,
        ...(selectedTeamId && { team_id: selectedTeamId }),
      });

      const active = contractors.filter((c) => c.isActive).length;
      setActiveContractors(active);
      setTotalContractors(contractors.length);
    } catch (error) {
      console.error("Error loading calendar data:", error);
      // En caso de error, mantener array vacío
      setAbsences([]);
      setActiveContractors(0);
      setTotalContractors(0);
    }
  }, [id, currentDate, selectedTeamId]);

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  // Cargar datos del calendario cuando cambien mes o equipo
  useEffect(() => {
    if (clientName) {
      loadCalendarData();
    }
  }, [clientName, loadCalendarData]);

  const handleBack = () => {
    router.push(`/${locale}/app/visualizer/clients`);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthYearText = currentDate.toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleMoreAbsencesClick = (date: Date, dateAbsences: AbsenceEvent[]) => {
    setModalDate(date);
    setModalAbsences(dateAbsences);
    setShowAbsenceModal(true);
  };

  // El filtrado ahora se hace en el servidor, no necesitamos filtrar localmente
  const handleTeamChange = (teamId: string | null) => {
    setSelectedTeamId(teamId);
    // loadClientData se ejecutará automáticamente por el useEffect
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <div className="flex-1 pt-[71px] px-4 md:px-8 pb-4 md:pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex-1 pt-[71px] px-4 md:px-8 pb-4 md:pb-8 overflow-x-hidden">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8 flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Back to clients"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-black" />
            </button>
            <h1 className="text-xl md:text-3xl font-semibold text-black truncate">{clientName}</h1>
          </div>

          {/* Stats */}
          <ClientCalendarStats stats={stats} className="mb-5 md:mb-6" />

          {/* Team Filters */}
          <TeamFilters
            teams={teams}
            selectedTeamId={selectedTeamId}
            onTeamChange={handleTeamChange}
            allTeamsLabel={t("calendar.filters.allTeams") || "All Teams"}
            className="mb-5 md:mb-6"
          />

          {/* Calendar Header */}
          <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePreviousMonth}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
              </button>
              <h2 className="text-lg md:text-2xl font-semibold text-black capitalize min-w-[200px] text-center">
                {monthYearText}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
              </button>
            </div>

            {/* Absence Legend - Only show on desktop */}
            {!isMobile && <AbsenceLegend />}
          </div>

          {/* Absence Legend - Show on mobile before calendar */}
          {isMobile && <AbsenceLegend className="mb-4" />}

          {/* Calendar - Desktop Grid or Mobile List */}
          {isMobile ? (
            <MobileCalendarList currentDate={currentDate} absences={absences} locale={locale} />
          ) : (
            <ClientCalendarGrid
              currentDate={currentDate}
              absences={absences}
              locale={locale}
              onMoreAbsencesClick={handleMoreAbsencesClick}
            />
          )}
        </div>
      </div>

      {/* Absence Detail Modal */}
      <AbsenceDetailModal
        isOpen={showAbsenceModal}
        onClose={() => setShowAbsenceModal(false)}
        date={modalDate}
        absences={modalAbsences}
        locale={locale}
      />
    </div>
  );
}
