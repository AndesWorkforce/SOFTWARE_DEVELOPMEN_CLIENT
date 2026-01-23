"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/packages/store";
import { Sidebar, Header } from "@/packages/design-system";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  useEffect(() => {
    if (_hasHydrated && user && user.role !== "Visualizer") {
      // Redirect to correct dashboard based on role
      if (user.role === "Superadmin") {
        router.push(`/${params.locale}/app/super-admin`);
      } else if (user.role === "TeamAdmin") {
        router.push(`/${params.locale}/app/admin`);
      } else {
        router.push(`/${params.locale}/login`);
      }
    }
  }, [_hasHydrated, user, router, params.locale]);

  if (!_hasHydrated || !user || user.role !== "Visualizer") {
    return null;
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#FFFFFF", color: "#000000" }}>
      <Sidebar role="client" />
      <Header userName={user.name} />
      <main className="flex-1 md:ml-60 pb-16 md:pb-0 pt-[55px]">{children}</main>
    </div>
  );
}
