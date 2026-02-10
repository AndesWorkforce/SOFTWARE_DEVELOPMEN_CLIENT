"use client";

import { ReportsPage } from "@/packages/shared-views/reports";

export default function ClientReportsPage() {
  // Reutilizamos la vista de reports del rol "visualizer" en modo solo lectura.
  return <ReportsPage role="visualizer" />;
}
