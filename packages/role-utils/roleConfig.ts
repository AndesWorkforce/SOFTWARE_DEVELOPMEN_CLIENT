import type { Role } from "./useRoleRoutes";

export interface RolePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canAdd: boolean;
  showCalendar: boolean;
  showReports: boolean;
}

export const roleConfig: Record<Role, RolePermissions> = {
  admin: {
    canEdit: true,
    canDelete: true,
    canAdd: true,
    showCalendar: true,
    showReports: true,
  },
  "super-admin": {
    canEdit: true,
    canDelete: true,
    canAdd: true,
    showCalendar: true,
    showReports: true,
  },
  visualizer: {
    canEdit: false,
    canDelete: false,
    canAdd: false,
    showCalendar: true,
    showReports: true,
  },
  client: {
    canEdit: false,
    canDelete: false,
    canAdd: false,
    showCalendar: false,
    showReports: true,
  },
};

export function getRolePermissions(role: Role): RolePermissions {
  return roleConfig[role];
}
