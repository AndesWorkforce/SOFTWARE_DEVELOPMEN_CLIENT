"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/packages/store";
import Image from "next/image";
import andesLogo from "@/packages/design-system/images/andes logo login.png";

export default function SelectRolePage() {
  const router = useRouter();
  const locale = useLocale();
  const { user, setSelectedRole } = useAuthStore();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      // Get roles from sessionStorage (set by login page)
      const stored = sessionStorage.getItem("available_roles");
      if (!stored) {
        // If no roles in sessionStorage, try to get from user store
        if (user) {
          const allRoles: string[] = [];
          if (user.role) {
            allRoles.push(user.role);
          }
          if (user.extraRoles && user.extraRoles.length > 0) {
            allRoles.push(...user.extraRoles);
          }
          if (allRoles.length > 1) {
            setRoles(allRoles);
            setLoading(false);
            return;
          }
        }
        // If only one role or no roles, redirect to login
        router.replace(`/${locale}/login`);
        return;
      }

      const parsedRoles = JSON.parse(stored) as string[];
      if (!parsedRoles || parsedRoles.length <= 1) {
        router.replace(`/${locale}/login`);
        return;
      }

      setRoles(parsedRoles);
    } catch (e) {
      console.error("Error reading available roles:", e);
      router.replace(`/${locale}/login`);
    } finally {
      setLoading(false);
    }
  }, [router, locale, user]);

  const handleRoleSelection = (selectedRole: string) => {
    if (submitting) return;
    setSubmitting(true);

    // Store selected role in the user store
    setSelectedRole(selectedRole);

    // Clear sessionStorage
    sessionStorage.removeItem("available_roles");

    // Redirect based on selected role
    let redirectPath = `/${locale}/app/super-admin`; // Default

    switch (selectedRole) {
      case "Superadmin":
        redirectPath = `/${locale}/app/super-admin`;
        break;
      case "TeamAdmin":
        redirectPath = `/${locale}/app/admin`;
        break;
      case "Visualizer":
        redirectPath = `/${locale}/app/visualizer`;
        break;
      default:
        redirectPath = `/${locale}/app/super-admin`;
    }

    router.push(redirectPath);
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem("available_roles");
    useAuthStore.getState().logout();
    router.replace(`/${locale}/login`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    Superadmin: "Super Admin",
    TeamAdmin: "Team Admin",
    Visualizer: "Visualizer",
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative">
        {/* Back icon (top-right) */}
        <button
          type="button"
          onClick={handleBackToLogin}
          disabled={submitting}
          aria-label="Back to login"
          className="absolute right-4 top-4 inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#0097B2] shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          <LogOut size={18} />
          <span className="sr-only">Back to login</span>
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
          <div className="shrink-0">
            <div className="relative w-[216px] h-[72px] flex-shrink-0">
              <Image
                src={andesLogo}
                alt="Andes Workforce Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#17323A]">Select a role</h1>
            <p className="text-sm text-gray-600">
              Choose the role you want to use for this session.
            </p>
          </div>
        </div>

        {/* Grid of role cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
          aria-label="Available roles"
        >
          {roles.map((role) => {
            const label = roleLabels[role] || role;
            const bgImage = "/images/logo-andes.png"; // default background image
            return (
              <button
                key={role}
                onClick={() => handleRoleSelection(role)}
                disabled={submitting}
                aria-label={`Use role ${label}`}
                className="group relative h-36 sm:h-40 w-full rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md focus:shadow-md transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0097B2] focus:ring-offset-2 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0">
                  <div
                    className="w-full h-full bg-gradient-to-br from-[#0097B2]/10 via-white to-[#0097B2]/5"
                    aria-hidden="true"
                  />
                </div>
                <div className="relative z-10 flex h-full items-center justify-center">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-wide text-[#17323A]">
                    {label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="mt-4 text-xs text-gray-500">
          Tip: you can change your active role any time by logging out and back in.
        </div>
      </div>

      {/* Busy overlay when submitting */}
      {submitting && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-50" aria-hidden="true" />
      )}
    </section>
  );
}
