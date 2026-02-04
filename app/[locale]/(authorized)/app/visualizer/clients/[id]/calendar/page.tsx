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

  // Stats (estos deberían venir del API en producción)
  const stats: CalendarStat[] = [
    { label: t("calendar.stats.todayCapacity") || "Today Capacity", value: "70%" },
    { label: t("calendar.stats.todayAbsences") || "Today Absences", value: "3" },
    { label: t("calendar.stats.activeContractors") || "Active Contractors", value: "7/10" },
  ];

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

      // TODO: Cargar ausencias reales desde el API
      // Por ahora usamos datos de ejemplo
      const mockAbsences: AbsenceEvent[] = [
        {
          id: "1",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 6),
          contractorName: "Alejandra Vila",
          contractorRole: "Fullstack Engineer",
          type: "license",
        },
        {
          id: "2",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
          contractorName: "Oliver Ortega",
          contractorRole: "Backend Developer",
          type: "health",
        },
        {
          id: "3",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12),
          contractorName: "Adriana Soto",
          contractorRole: "Frontend Developer",
          type: "vacation",
        },
        {
          id: "4",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 13),
          contractorName: "Adriana Soto",
          contractorRole: "Frontend Developer",
          type: "vacation",
        },
        {
          id: "5",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 13),
          contractorName: "Alejandra Vila",
          contractorRole: "Fullstack Engineer",
          type: "license",
        },
        {
          id: "6",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 14),
          contractorName: "Adriana Soto",
          contractorRole: "Frontend Developer",
          type: "vacation",
        },
        {
          id: "7",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 16),
          contractorName: "Adriana Soto",
          contractorRole: "Frontend Developer",
          type: "vacation",
        },
        {
          id: "8",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 16),
          contractorName: "Alejandra Vila",
          contractorRole: "Fullstack Engineer",
          type: "license",
        },
        {
          id: "9",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 16),
          contractorName: "Daniel Ayala",
          contractorRole: "UX/UI Designer",
          type: "license",
        },
        {
          id: "10",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 16),
          contractorName: "Mateo Cantillo",
          contractorRole: "Support Engineer",
          type: "health",
        },
        {
          id: "11",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
          contractorName: "Daniel Ayala",
          contractorRole: "UX/UI Designer",
          type: "license",
        },
        {
          id: "12",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
          contractorName: "Mateo Cantillo",
          contractorRole: "Support Engineer",
          type: "health",
        },
        {
          id: "13",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
          contractorName: "Alejandra Vila",
          contractorRole: "Fullstack Engineer",
          type: "license",
        },
        {
          id: "14",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
          contractorName: "Alejandra Vila",
          contractorRole: "Fullstack Engineer",
          type: "license",
        },
        {
          id: "15",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22),
          contractorName: "Valentina Bernal",
          contractorRole: "DevOps Engineer",
          type: "health",
        },
        {
          id: "16",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22),
          contractorName: "Oliver Ortega",
          contractorRole: "Backend Developer",
          type: "health",
        },
      ];

      setAbsences(mockAbsences);
    } catch (error) {
      console.error("Error loading client data:", error);
    } finally {
      setLoading(false);
    }
  }, [id, currentDate]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

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

  const filteredAbsences = selectedTeamId
    ? absences.filter(() => true) // TODO: Filtrar por team cuando tengamos la data
    : absences;

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
            onTeamChange={setSelectedTeamId}
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
            <MobileCalendarList
              currentDate={currentDate}
              absences={filteredAbsences}
              locale={locale}
            />
          ) : (
            <ClientCalendarGrid
              currentDate={currentDate}
              absences={filteredAbsences}
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
