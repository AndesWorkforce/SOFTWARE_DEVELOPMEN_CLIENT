"use client";

import { ReportsPage } from "@/packages/shared-views/reports";

export default function ClientReportsPage() {
  // Rol "client" para que los enlaces (ej. detalle) queden bajo /app/client/ y no redirijan a login.
  return <ReportsPage role="client" />;
}
