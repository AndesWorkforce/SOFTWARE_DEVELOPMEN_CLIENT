"use client";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "@/packages/store";
import { ReactNode } from "react";
import { LayoutDashboard, FileText, Users, LogOut, User } from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: ReactNode;
}

export interface SidebarProps {
  role: "admin" | "super-admin";
}

export const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("sidebar");
  const { logout } = useAuthStore();

  const baseNavItems: NavItem[] = [
    {
      name: t("dashboard"),
      path: `/${locale}/app/${role}`,
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: t("reports"),
      path: `/${locale}/app/${role}/reports`,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: t("contractors"),
      path: `/${locale}/app/${role}/contractors`,
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: t("clients"),
      path: `/${locale}/app/${role}/clients`,
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: t("roles"),
      path: `/${locale}/app/${role}/roles`,
      icon: <User className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push(`/${locale}/login`);
  };

  const isActive = (path: string) => {
    if (path === `/${locale}/app/${role}`) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop/Tablet sidebar (left) */}
      <aside
        className="hidden md:flex md:flex-col w-60 h-screen fixed left-0 top-0"
        style={{ background: "#FFFFFF", borderRight: "1px solid #E5E5E5" }}
      >
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center justify-center">
            <img src="/logo_andes_home.png" alt="ANDES WORKFORCE" className="h-12 w-auto" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {baseNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
                style={{
                  color: active ? "#0097B2" : "#000000",
                  background: active ? "#E6F7FA" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "#F5F5F5";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4" style={{ borderTop: "1px solid #E5E5E5" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
            style={{ color: "#000000" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F5F5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">{t("logout")}</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav (icons only) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-[#E5E5E5] z-50"
        aria-label="Bottom Navigation"
      >
        <ul className="h-full flex items-center justify-around">
          {baseNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <button
                  aria-label={item.name}
                  onClick={() => router.push(item.path)}
                  className="p-2"
                  style={{ color: active ? "#0097B2" : "#000000" }}
                >
                  {/* Clone icon with consistent size on mobile */}
                  <span className="inline-flex w-6 h-6 items-center justify-center">
                    {/* icons already sized w-5 h-5; wrapper ensures tap area */}
                    {item.icon}
                  </span>
                </button>
              </li>
            );
          })}
          {/* Logout icon */}
          <li>
            <button
              aria-label={t("logout")}
              onClick={handleLogout}
              className="p-2"
              style={{ color: "#000000" }}
            >
              <span className="inline-flex w-6 h-6 items-center justify-center">
                <LogOut className="w-5 h-5" />
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};
