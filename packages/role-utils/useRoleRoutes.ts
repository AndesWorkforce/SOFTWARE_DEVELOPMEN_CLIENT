import { useLocale } from "next-intl";

export type Role = "admin" | "super-admin" | "visualizer" | "client";

export interface RoleRoutes {
  base: string;
  clients: {
    list: string;
    detail: (id: string) => string;
    edit: (id: string) => string;
    delete: (id: string) => string;
    add: string;
    calendar?: (id: string) => string;
  };
  contractors: {
    list: string;
    detail: (id: string) => string;
    edit: (id: string) => string;
    delete: (id: string) => string;
    add: string;
    calendar: (id: string) => string;
  };
  reports: {
    list: string;
    detail: (id: string, from?: string, to?: string) => string;
    group: (params?: URLSearchParams | Record<string, string>) => string;
    export: string;
  };
}

export function useRoleRoutes(role: Role): RoleRoutes {
  const locale = useLocale();
  const base = `/${locale}/app/${role}`;

  return {
    base,
    clients: {
      list: `${base}/clients`,
      detail: (id: string) => `${base}/clients/${id}`,
      edit: (id: string) => `${base}/clients/edit/${id}`,
      delete: (id: string) => `${base}/clients/delete/${id}`,
      add: `${base}/clients/add`,
      ...((role === "visualizer" || role === "admin" || role === "super-admin") && {
        calendar: (id: string) => `${base}/clients/${id}/calendar`,
      }),
    },
    contractors: {
      list: `${base}/contractors`,
      detail: (id: string) => `${base}/contractors/${id}`,
      edit: (id: string) => `${base}/contractors/edit/${id}`,
      delete: (id: string) => `${base}/contractors/delete/${id}`,
      add: `${base}/contractors/add`,
      calendar: (id: string) => `${base}/contractors/calendar/${id}`,
    },
    reports: {
      list: `${base}/reports`,
      detail: (id: string, from?: string, to?: string) => {
        const params = new URLSearchParams();
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        const query = params.toString();
        return `${base}/reports/detail/${id}${query ? `?${query}` : ""}`;
      },
      group: (params?: URLSearchParams | Record<string, string>) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params instanceof URLSearchParams) {
            return `${base}/reports/group?${params.toString()}`;
          } else {
            Object.entries(params).forEach(([key, value]) => {
              if (value) searchParams.set(key, value);
            });
          }
        }
        return `${base}/reports/group?${searchParams.toString()}`;
      },
      export: `${base}/reports/export`,
    },
  };
}
