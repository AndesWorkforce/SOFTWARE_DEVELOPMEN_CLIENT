import type {
  JobPosition,
  CreateJobPositionDto,
  UpdateJobPositionDto,
} from "@/packages/types/job-positions.types";
import seedData from "@/packages/data/job-positions.json";

const STORAGE_KEY = "job_positions_data";

function getAll(): JobPosition[] {
  if (typeof window === "undefined") return seedData as JobPosition[];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as JobPosition[];
  } catch {
    // ignore parse errors
  }
  // Seed localStorage on first access
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  return seedData as JobPosition[];
}

function saveAll(positions: JobPosition[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

function generateId(): string {
  return `jp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const jobPositionsService = {
  getAll(): JobPosition[] {
    return getAll();
  },

  getById(id: string): JobPosition | null {
    return getAll().find((p) => p.id === id) ?? null;
  },

  create(dto: CreateJobPositionDto): JobPosition {
    const all = getAll();
    const newPosition: JobPosition = {
      id: generateId(),
      name: dto.name.trim(),
      description: dto.description?.trim(),
    };
    saveAll([...all, newPosition]);
    return newPosition;
  },

  update(id: string, dto: UpdateJobPositionDto): JobPosition {
    const all = getAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Job position with id "${id}" not found`);
    const updated: JobPosition = {
      ...all[idx],
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
    };
    const next = [...all];
    next[idx] = updated;
    saveAll(next);
    return updated;
  },

  remove(id: string): void {
    const all = getAll();
    saveAll(all.filter((p) => p.id !== id));
  },
};
