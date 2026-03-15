import type { DataTableConfig } from "@/packages/types/DataTable.types";
import type { Client } from "@/packages/api/clients/clients.service";
import type { Contractor } from "@/packages/api/contractors/contractors.service";
import type { ReactNode } from "react";

export const clientsTableConfig: DataTableConfig<Client> = {
  columns: [
    {
      key: "name",
      title: "Name Client",
      translationKey: "clients.table.name",
      dataPath: "name",
      type: "text",
      minWidth: "200px",
      align: "center",
    },
    {
      key: "email",
      title: "Email",
      translationKey: "clients.table.email",
      dataPath: (row) => row.email || "N/A",
      type: "text",
      minWidth: "245px",
      align: "center",
    },
  ],
  rowKey: "id",
  striped: true,
  evenRowColor: "#E2E2E2",
  oddRowColor: "#FFFFFF",
  styles: {
    table: {
      border: "1px solid rgba(166,166,166,0.5)",
      boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
      borderRadius: "10px",
    },
    cell: {
      paddingTop: "4px",
      paddingBottom: "4px",
    },
    mobileCard: {
      border: "1px solid rgba(166,166,166,0.5)",
      boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
      borderRadius: "10px",
    },
  },
};

export const getContractorsTableConfig = (): DataTableConfig<Contractor> => ({
  columns: [
    {
      key: "name",
      title: "User",
      translationKey: "contractors.table.user",
      dataPath: "name",
      type: "text",
      minWidth: "250px",
      align: "center",
    },
    {
      key: "client",
      title: "Client",
      translationKey: "contractors.table.client",
      dataPath: (row) => row.client_name || "N/A",
      type: "text",
      minWidth: "240px",
      align: "center",
    },
    {
      key: "team",
      title: "Team",
      translationKey: "contractors.table.team",
      dataPath: (row) => row.team_name || "N/A",
      type: "text",
      minWidth: "240px",
      align: "center",
    },
  ],
  rowKey: "id",
  striped: true,
  evenRowColor: "#E2E2E2",
  oddRowColor: "#FFFFFF",
  styles: {
    table: {
      border: "1px solid rgba(166,166,166,0.5)",
      boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
      borderRadius: "10px",
    },
    cell: {
      paddingTop: "4px",
      paddingBottom: "4px",
    },
    mobileCard: {
      border: "1px solid rgba(166,166,166,0.5)",
      boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
      borderRadius: "10px",
    },
  },
});
