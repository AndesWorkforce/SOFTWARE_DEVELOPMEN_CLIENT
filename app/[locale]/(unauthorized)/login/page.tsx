"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { authService } from "@/packages/api/auth/auth.service";
import { useAuthStore } from "@/packages/store";
import { Button, Input } from "@/packages/design-system";

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const { setToken, setRefreshToken, setUser } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log("📤 Attempting login with:", {
      email: formData.email,
      passwordLength: formData.password.length,
    });

    try {
      const response = await authService.login(formData.email, formData.password);

      console.log("🔍 Login response:", response);
      console.log("👤 User role from backend:", response.user.role);

      // Store token, refreshToken and user data
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.user);

      // Store session cookie
      document.cookie = `session=${response.accessToken}; path=/; max-age=3600`;

      // Redirect based on user role
      let redirectPath = `/${locale}/app/super-admin`; // Default

      console.log("🔀 Checking role for redirect...");
      console.log("📋 Role value:", response.user.role);
      console.log("📋 Role type:", typeof response.user.role);
      console.log("📋 Role === 'TeamAdmin':", response.user.role === "TeamAdmin");
      console.log("📋 Role === 'Superadmin':", response.user.role === "Superadmin");
      console.log("📋 Role === 'Visualizer':", response.user.role === "Visualizer");
      
      switch (response.user.role) {
        case "Superadmin":
          console.log("✅ Redirecting to super-admin");
          redirectPath = `/${locale}/app/super-admin`;
          break;
        case "TeamAdmin":
          console.log("✅ Redirecting to admin (TeamAdmin)");
          redirectPath = `/${locale}/app/admin`;
          break;
        case "Visualizer":
          console.log("✅ Redirecting to client");
          redirectPath = `/${locale}/app/client`;
          break;
        default:
          console.log("⚠️ Unknown role, using default:", response.user.role);
          redirectPath = `/${locale}/app/super-admin`;
      }

      console.log("🎯 Final redirect path:", redirectPath);
      router.push(redirectPath);
    } catch (err) {
      console.error("❌ Login error:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Invalid email or password");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("login.title")}</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t("login.subtitle")}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md"
        >
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label={t("login.email")}
              placeholder={t("login.emailPlaceholder")}
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              id="password"
              name="password"
              type="password"
              label={t("login.password")}
              placeholder={t("login.passwordPlaceholder")}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {t("login.forgotPassword")}
            </button>
          </div>

          <Button type="submit" loading={loading} fullWidth variant="primary">
            {t("login.submit")}
          </Button>
        </form>
      </div>
    </main>
  );
}
