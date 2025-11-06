"use client";
import { useEffect } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useAuthStore } from "@/packages/store";

export default function AuthorizedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ locale: string }>();
  const { token, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for store to hydrate before checking authentication
    if (!_hasHydrated) {
      return;
    }

    // Redirect to login if not authenticated
    if (!token) {
      router.push(`/${params.locale}/login`);
    }
  }, [token, _hasHydrated, params.locale, pathname, router]);

  // Show nothing while hydrating
  if (!_hasHydrated) {
    return null;
  }

  // Show nothing while redirecting
  if (!token) {
    return null;
  }

  return <>{children}</>;
}
