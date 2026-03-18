export type DomainType =
  | "Code"
  | "Web"
  | "Design"
  | "Chat"
  | "Office"
  | "Productivity"
  | "Development"
  | "Database"
  | "Cloud"
  | "Entertainment"
  | "System";

export interface Domain {
  id: string;
  name: string;
  type: DomainType | null;
  category: string | null;
  weight: number | null;
  created_at: string;
  updated_at: string;
}
