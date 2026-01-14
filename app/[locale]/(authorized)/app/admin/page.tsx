"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ChevronRight, Download, Calendar } from "lucide-react";
import { DataTable, DashboardSkeleton } from "@/packages/design-system";
import { usersService } from "@/packages/api/users/users.service";
import { clientsService, type Client } from "@/packages/api/clients/clients.service";
import {
  contractorsService,
  type Contractor,
} from "@/packages/api/contractors/contractors.service";
import { clientsTableConfig, getContractorsTableConfig } from "./constants";

export default function AdminPage() {
  const locale = useLocale();
  const router = useRouter();

  const [stats, setStats] = useState<{
    totalClients: number;
    totalContractors: number;
    totalTeams: number;
  } | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, clientsData, contractorsData] = await Promise.all([
          usersService.getStats(),
          clientsService.getAll(),
          contractorsService.getAll(),
        ]);

        setStats(statsData);
        setClients(clientsData.slice(0, 6)); // Solo 6 clientes para el preview
        setContractors(contractorsData.slice(0, 10)); // Solo 10 contractors para el preview
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Configuración de la tabla de clientes
  const memoizedClientsConfig = useMemo(() => clientsTableConfig, []);

  // Configuración de la tabla de contractors
  const memoizedContractorsConfig = useMemo(
    () =>
      getContractorsTableConfig(() => (
        <button type="button" className="inline-flex items-center gap-1 text-black hover:underline">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-sm font-medium underline">View</span>
        </button>
      )),
    [],
  );

  if (loading) {
    return <DashboardSkeleton variant="admin" />;
  }

  // Obtener fecha actual formateada
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-4 md:p-8 min-h-screen overflow-x-hidden" style={{ background: "#FFFFFF" }}>
      <div className="max-w-full overflow-x-hidden">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold" style={{ color: "#000000" }}>
            Dashboard
          </h1>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            className="bg-white border border-[rgba(166,166,166,0.25)] rounded-lg shadow-[0px_4px_4px_rgba(166,166,166,0.25)] p-4 flex flex-col items-center justify-center"
            style={{ height: "100px" }}
          >
            <p className="text-base font-medium text-center mb-2" style={{ color: "#0097B2" }}>
              Clients
            </p>
            <p className="text-3xl font-semibold text-center" style={{ color: "#000000" }}>
              {stats?.totalClients || 0}
            </p>
          </div>

          <div
            className="bg-white border border-[rgba(166,166,166,0.25)] rounded-lg shadow-[0px_4px_4px_rgba(166,166,166,0.25)] p-4 flex flex-col items-center justify-center"
            style={{ height: "100px" }}
          >
            <p className="text-base font-medium text-center mb-2" style={{ color: "#0097B2" }}>
              Contractors
            </p>
            <p className="text-3xl font-semibold text-center" style={{ color: "#000000" }}>
              {stats?.totalContractors || 0}
            </p>
          </div>

          <div
            className="bg-white border border-[rgba(166,166,166,0.25)] rounded-lg shadow-[0px_4px_4px_rgba(166,166,166,0.25)] p-4 flex flex-col items-center justify-center"
            style={{ height: "100px" }}
          >
            <p className="text-base font-medium text-center mb-2" style={{ color: "#0097B2" }}>
              Teams
            </p>
            <p className="text-3xl font-semibold text-center" style={{ color: "#000000" }}>
              {stats?.totalTeams || 0}
            </p>
          </div>
        </div>

        {/* Grid: Columna izquierda (Reports + Clients) | Columna derecha (Contractors) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Reports + Clients */}
          <div className="flex flex-col gap-6">
            {/* Card de Reports */}
            <div
              className="bg-white border border-[rgba(166,166,166,0.5)] rounded-lg shadow-[0px_4px_4px_rgba(166,166,166,0.25)] p-6 flex flex-col justify-between"
              style={{ height: "153px" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xl font-semibold mb-1" style={{ color: "#000000" }}>
                    Reports
                  </p>
                  <p className="text-base" style={{ color: "#666666" }}>
                    {formattedDate}
                  </p>
                </div>
                <button
                  type="button"
                  className="bg-[#0097B2] text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-[0px_4px_4px_rgba(166,166,166,0.25)] flex items-center gap-2 hover:bg-[#007a94] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
              <div className="pt-3 flex justify-center">
                <Link
                  href={`/${locale}/app/admin/reports`}
                  className="inline-flex items-center gap-1 text-[#0097B2] hover:underline font-medium"
                >
                  <span>View Reports</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Card de Clients */}
            <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-lg shadow-[0px_4px_4px_rgba(166,166,166,0.25)] p-6">
              <p className="text-xl font-semibold mb-4" style={{ color: "#000000" }}>
                Clients
              </p>
              <div className="mb-4" style={{ maxHeight: "350px", overflow: "hidden" }}>
                <DataTable config={memoizedClientsConfig} data={clients} />
              </div>
              <div className="pt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/app/super-admin/clients`)}
                  className="inline-flex items-center gap-1 text-[#0097B2] hover:underline font-medium"
                >
                  <span>View Clients</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Columna derecha: Card de Contractors */}
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-lg shadow-[0px_4px_4px_rgba(166,166,166,0.25)] p-6">
            <p className="text-xl font-semibold mb-4" style={{ color: "#000000" }}>
              Contractors
            </p>
            <div className="mb-4" style={{ maxHeight: "548px", overflow: "hidden" }}>
              <DataTable config={memoizedContractorsConfig} data={contractors} />
            </div>
            <div className="pt-3 flex justify-center">
              <button
                type="button"
                onClick={() => router.push(`/${locale}/app/super-admin/contractors`)}
                className="inline-flex items-center gap-1 text-[#0097B2] hover:underline font-medium"
              >
                <span>View Contractors</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
