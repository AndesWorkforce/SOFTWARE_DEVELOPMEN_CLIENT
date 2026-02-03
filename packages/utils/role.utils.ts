/**
 * Gets the active role for a user.
 * Returns selectedRole if available, otherwise falls back to role.
 */
export function getActiveRole(
  user: {
    role?: string;
    selectedRole?: string;
  } | null,
): string | undefined {
  if (!user) return undefined;
  return user.selectedRole || user.role;
}

/**
 * Checks if the user has access to a specific role.
 * Checks both the main role and extraRoles.
 */
export function hasRole(
  user: {
    role?: string;
    extraRoles?: string[];
    selectedRole?: string;
  } | null,
  requiredRole: string,
): boolean {
  if (!user) return false;

  // Get all available roles
  const allRoles: string[] = [];
  if (user.role) {
    allRoles.push(user.role);
  }
  if (user.extraRoles && user.extraRoles.length > 0) {
    allRoles.push(...user.extraRoles);
  }

  // Check if the required role is in the list
  return allRoles.includes(requiredRole);
}
