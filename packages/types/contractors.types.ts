/**
 * Tipo para Contractor basado en el schema de Prisma
 */
export interface Contractor {
  id: string;
  name: string;
  email: string | null;
  job_position: string;
  country: string | null;
  client_id: string;
  team_id: string | null;
  activation_key: string | null;
  work_schedule_start: string | null;
  work_schedule_end: string | null;
  lunch_start: string | null;
  lunch_end: string | null;
  created_at: string;
  updated_at: string;
  isActive?: boolean;
  // Campos enriquecidos (pueden venir del backend o calcularse)
  client_name?: string;
  team_name?: string;
}

/**
 * Contractor con días libres
 */
export interface ContractorWithDayOffs extends Contractor {
  contractor_day_offs: ContractorDayOff[];
}

/**
 * Contractor Day Off
 */
export interface ContractorDayOff {
  id: string;
  contractor_id: string;
  date: string;
  reason: string;
  created_at: string;
}

/**
 * DTO para crear un Contractor Day Off
 */
export interface CreateContractorDayOffDto {
  contractor_id: string;
  date: string;
  reason: string;
}

/**
 * DTO para actualizar un Contractor Day Off
 */
export interface UpdateContractorDayOffDto {
  date?: string;
  reason?: string;
}

/**
 * Respuesta al buscar contractor por activation key
 */
export interface ContractorByActivationKey {
  id: string;
  name: string;
  activation_key: string | null;
  applications: Array<{
    id: string;
    name: string;
    [key: string]: unknown;
  }>;
}

/**
 * Filtros para obtener contractors (aplicados en el frontend)
 */
export interface ContractorFilters {
  name?: string;
  country?: string;
  client_id?: string;
  team_id?: string;
  job_position?: string;
}
