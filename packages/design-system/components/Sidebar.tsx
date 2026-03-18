"use client";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "@/packages/store";
import { ReactNode } from "react";
import { LayoutDashboard, FileText, Users, LogOut, User, RefreshCw, Bot } from "lucide-react";
import Image from "next/image";
import pulseLogo from "@/packages/design-system/images/logo pulse 1.png";

interface NavItem {
  name: string;
  path: string;
  icon: ReactNode;
  roles?: ("super-admin" | "admin" | "client" | "visualizer")[];
}

export interface SidebarProps {
  role: "super-admin" | "admin" | "client" | "visualizer";
}

export const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("sidebar");
  const { logout, user } = useAuthStore();

  // Check if user has multiple roles
  const hasMultipleRoles = (): boolean => {
    if (!user) return false;
    const allRoles: string[] = [];
    if (user.role) {
      allRoles.push(user.role);
    }
    if (user.extraRoles && user.extraRoles.length > 0) {
      allRoles.push(...user.extraRoles);
    }
    return allRoles.length > 1;
  };

  const handleChangeRole = () => {
    // Store all available roles in sessionStorage for the selection page
    if (user) {
      const allRoles: string[] = [];
      if (user.role) {
        allRoles.push(user.role);
      }
      if (user.extraRoles && user.extraRoles.length > 0) {
        allRoles.push(...user.extraRoles);
      }
      sessionStorage.setItem("available_roles", JSON.stringify(allRoles));
      router.push(`/${locale}/select-role`);
    }
  };

  const baseNavItems: NavItem[] = [
    {
      name: t("dashboard"),
      path: `/${locale}/app/${role}`,
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: t("clients"),
      path: `/${locale}/app/${role}/clients`,
      icon: <Users className="w-5 h-5" />,
      // No mostrar para el rol "client"
      roles: ["super-admin", "admin", "visualizer"],
    },
    {
      name: t("contractors"),
      path: `/${locale}/app/${role}/contractors`,
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: t("reports"),
      path: `/${locale}/app/${role}/reports`,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: t("roles"),
      path: `/${locale}/app/${role}/roles`,
      icon: <User className="w-5 h-5" />,
      roles: ["super-admin"], // Solo para super-admin
    },
    {
      name: t("agents"),
      path: `/${locale}/app/${role}/agents`,
      icon: <Bot className="w-5 h-5" />,
      roles: ["super-admin", "admin"],
    },
  ];

  // Filtrar items según el rol
  const navItems = baseNavItems.filter((item) => {
    if (item.roles) {
      return item.roles.includes(role);
    }
    return true;
  });

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
      <aside className="hidden md:flex md:flex-col w-[237px] h-screen fixed left-0 top-0 bg-white px-[30px] py-[40px] shadow-[2px_0_8px_rgba(0,0,0,0.06)]">
        {/* Logo */}
        <div className="flex items-start justify-start mb-[25px]">
          <div className="relative w-[130px] h-[63px] flex-shrink-0">
            <Image
              src={pulseLogo}
              alt="PULSE by Andes Workforce"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-[20px] mt-[25px]">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="w-full flex items-center gap-[10px] p-[10px] rounded-[10px] transition-colors text-left cursor-pointer"
                style={{
                  background: active ? "rgba(0,151,178,0.1)" : "transparent",
                  color: active ? "#007489" : "#64748b",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "rgba(0,151,178,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                <span
                  className={`text-[14px] leading-normal ${active ? "font-bold" : "font-normal"}`}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Change Role & Logout */}
        <div className="flex flex-col gap-[10px]">
          {hasMultipleRoles() && (
            <button
              onClick={handleChangeRole}
              className="w-full flex items-center gap-[10px] p-[10px] rounded-[10px] transition-colors text-left cursor-pointer text-[#0f172a] text-[14px] font-normal"
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <RefreshCw className="w-5 h-5 flex-shrink-0" />
              <span>{t("changeRole")}</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-[10px] p-[10px] rounded-[10px] transition-colors text-left cursor-pointer text-[#0f172a] text-[14px] font-normal"
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>{t("logout")}</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav (icons only) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-[#64748b] z-50"
        aria-label="Bottom Navigation"
      >
        <ul className="h-full flex items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <button
                  aria-label={item.name}
                  onClick={() => router.push(item.path)}
                  className="p-2 cursor-pointer"
                  style={{ color: active ? "#007489" : "#64748b" }}
                >
                  <span className="inline-flex w-6 h-6 items-center justify-center">
                    {item.icon}
                  </span>
                </button>
              </li>
            );
          })}
          {hasMultipleRoles() && (
            <li>
              <button
                aria-label={t("changeRole")}
                onClick={handleChangeRole}
                className="p-2 cursor-pointer"
                style={{ color: "#0f172a" }}
              >
                <span className="inline-flex w-6 h-6 items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </span>
              </button>
            </li>
          )}
          <li>
            <button
              aria-label={t("logout")}
              onClick={handleLogout}
              className="p-2 cursor-pointer"
              style={{ color: "#0f172a" }}
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
