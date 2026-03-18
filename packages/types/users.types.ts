export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Superadmin" | "TeamAdmin" | "Visualizer";
  extraRoles?: Array<"Superadmin" | "TeamAdmin" | "Visualizer">;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "Superadmin" | "TeamAdmin" | "Visualizer";
  extraRoles?: Array<"Superadmin" | "TeamAdmin" | "Visualizer">;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "Superadmin" | "TeamAdmin" | "Visualizer";
  extraRoles?: Array<"Superadmin" | "TeamAdmin" | "Visualizer">;
  password?: string;
}

// Mapeo de roles del backend a nombres amigables para el frontend
export const ROLE_LABELS: Record<string, string> = {
  Superadmin: "Super Administrator",
  TeamAdmin: "Team Administrator",
  Visualizer: "Andes Viewer",
};

// Mapeo inverso: de nombres amigables a roles del backend
export const ROLE_VALUES: Record<string, string> = {
  "Super Administrator": "Superadmin",
  "Team Administrator": "TeamAdmin",
  "Andes Viewer": "Visualizer",
};

// Opciones para el select de roles
export const ROLE_OPTIONS = [
  { value: "Superadmin", label: "Super Administrator" },
  { value: "TeamAdmin", label: "Team Administrator" },
  { value: "Visualizer", label: "Andes Viewer" },
];

export const ROLES = ["Superadmin", "TeamAdmin", "Visualizer"] as const;
export type Role = (typeof ROLES)[number];
