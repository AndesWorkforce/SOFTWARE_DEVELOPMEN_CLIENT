"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/packages/store";
import { Sidebar, Header } from "@/packages/design-system";
import { getActiveRole } from "@/packages/utils/role.utils";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const activeRole = getActiveRole(user);

  useEffect(() => {
    if (_hasHydrated && user && activeRole !== "TeamAdmin") {
      // Redirect to correct dashboard based on role
      if (activeRole === "Superadmin") {
        router.push(`/${params.locale}/app/super-admin`);
      } else if (activeRole === "Visualizer") {
        router.push(`/${params.locale}/app/visualizer`);
      } else {
        router.push(`/${params.locale}/auth/login`);
      }
    }
  }, [_hasHydrated, user, activeRole, router, params.locale]);

  if (!_hasHydrated || !user || activeRole !== "TeamAdmin") {
    return null;
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#FFFFFF", color: "#000000" }}>
      <Sidebar role="admin" />
      <Header userName={user.name || user.email || "User"} />
      <main className="flex-1 md:ml-60 pb-16 md:pb-0 pt-[55px]">{children}</main>
    </div>
  );
}
