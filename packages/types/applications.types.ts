export type AppType =
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

export interface Application {
  id: string;
  name: string;
  type: AppType | null;
  category: string | null;
  weight: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationPayload {
  name: string;
  type?: AppType;
  category?: string;
  weight?: number;
}
