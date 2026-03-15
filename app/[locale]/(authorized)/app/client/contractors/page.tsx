"use client";

import { ContractorsPage } from "@/packages/shared-views/contractors";

export default function ClientContractorsPage() {
  // Usamos el mismo comportamiento de permisos que el rol "visualizer"
  // para garantizar que el cliente no pueda editar, agregar ni eliminar contratistas.
  return <ContractorsPage role="visualizer" />;
}
