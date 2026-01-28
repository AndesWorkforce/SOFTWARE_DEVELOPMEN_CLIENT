"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { authService } from "@/packages/api/auth/auth.service";
import { useAuthStore } from "@/packages/store";
import { Button, Input, Select, type SelectOption } from "@/packages/design-system";

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const { setToken, setUser } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "Visualizer",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.register(formData);

      // Store token and user data
      setToken(response.accessToken);
      setUser(response.user);

      // Store session cookie (you might want to do this on the backend)
      document.cookie = `session=${response.accessToken}; path=/; max-age=3600`;

      // Redirect to dashboard based on role
      let redirectPath = `/${locale}/app/visualizer`; // Default for registered users

      switch (response.user.role) {
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
          redirectPath = `/${locale}/app/visualizer`;
      }

      router.push(redirectPath);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error registering user");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const roleOptions: SelectOption[] = [
    { value: "Visualizer", label: t("register.roles.visualizer") },
    { value: "TeamAdmin", label: t("register.roles.teamAdmin") },
    { value: "Superadmin", label: t("register.roles.superadmin") },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("register.title")}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t("register.subtitle")}</p>
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
              id="name"
              name="name"
              type="text"
              label={t("register.fullName")}
              placeholder={t("register.namePlaceholder")}
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              id="email"
              name="email"
              type="email"
              label={t("register.email")}
              placeholder={t("register.emailPlaceholder")}
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              id="password"
              name="password"
              type="password"
              label={t("register.password")}
              placeholder={t("register.passwordPlaceholder")}
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Select
              id="role"
              name="role"
              label={t("register.role")}
              options={roleOptions}
              value={formData.role}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" loading={loading} fullWidth variant="primary">
            {t("register.submit")}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t("register.alreadyHaveAccount")}{" "}
            </span>
            <Link
              href={`/${locale}/login`}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {t("register.login")}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
