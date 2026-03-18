"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "@/packages/api/auth/auth.service";
import { useAuthStore } from "@/packages/store";

// Importar imágenes
import loginAndesImage from "@/packages/design-system/images/andes image login.png";
import andesLogo from "@/packages/design-system/images/logo pulse 1.png";

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
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);

      // Store token, refreshToken and user data
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.user);

      // Store session cookie
      document.cookie = `session=${response.accessToken}; path=/; max-age=3600`;

      // Si es un cliente, redirigir directamente a /app/client
      // Verificamos userType explícitamente, o si no tiene role (clientes no tienen role)
      const isClient =
        response.user.userType === "client" ||
        (!response.user.role && !response.user.extraRoles && response.user.userType !== "user");

      if (isClient) {
        router.push(`/${locale}/app/client`);
        return;
      }

      // Check if user has multiple roles (role + extraRoles)
      const allRoles: string[] = [];
      if (response.user.role) {
        allRoles.push(response.user.role);
      }

      // Handle extraRoles - could be array, string, or null/undefined
      let extraRolesArray: string[] = [];
      const extraRoles: string[] | string | undefined = response.user.extraRoles;
      if (extraRoles) {
        if (Array.isArray(extraRoles)) {
          extraRolesArray = extraRoles;
        } else {
          // If it's a string, try to parse it
          const extraRolesStr = extraRoles as string;
          try {
            const parsed = JSON.parse(extraRolesStr);
            extraRolesArray = Array.isArray(parsed) ? parsed : [];
          } catch {
            // If JSON.parse fails, it might be a PostgreSQL array string format
            // Format: "{TeamAdmin,Visualizer}" or "[TeamAdmin,Visualizer]"
            const cleaned = extraRolesStr
              .replace(/^[{\[]/, "")
              .replace(/[}\]]$/, "")
              .split(",")
              .map((r: string) => r.trim())
              .filter((r: string) => r.length > 0);
            extraRolesArray = cleaned;
          }
        }
      }

      if (extraRolesArray.length > 0) {
        allRoles.push(...extraRolesArray);
      }

      // If user has more than one role, redirect to role selection
      if (allRoles.length > 1) {
        // Store roles in sessionStorage for the selection page
        sessionStorage.setItem("available_roles", JSON.stringify(allRoles));
        router.push(`/${locale}/select-role`);
        return;
      }

      // If only one role, use it directly
      const roleToUse = allRoles[0] || response.user.role;

      // Redirect based on user role
      let redirectPath = `/${locale}/app/super-admin`; // Default

      switch (roleToUse) {
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
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Invalid email or password");
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
    <main className="flex min-h-screen bg-white">
      {/* Sección izquierda con imagen */}
      <div className="hidden lg:block relative w-[45%] h-screen flex-shrink-0">
        <Image src={loginAndesImage} alt="Andes Workforce" fill className="object-cover" priority />
      </div>

      {/* Sección derecha con formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[494px] flex flex-col items-center gap-[50px]">
          {/* Logo y título */}
          <div className="flex flex-col items-center gap-[75px]">
            <div className="relative w-[200px] h-[97px] flex-shrink-0">
              <Image
                src={andesLogo}
                alt="Andes Workforce Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-[24px] font-bold text-[#007489] text-center leading-normal">
              {t("login.title")}
            </h1>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[25px]">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[10px] text-sm">
                {error}
              </div>
            )}

            {/* Campo Email */}
            <div className="flex flex-col items-start w-full">
              <label
                htmlFor="email"
                className="text-[16px] font-normal text-[#0f172a] leading-normal mb-0"
              >
                {t("login.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full h-[55px] bg-white border border-[#64748b] border-[0.2px] rounded-[10px] px-4 text-[16px] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#007489] focus:border-[#007489]"
                placeholder={t("login.emailPlaceholder")}
              />
            </div>

            {/* Campo Password */}
            <div className="flex flex-col items-start w-full">
              <label
                htmlFor="password"
                className="text-[16px] font-normal text-[#0f172a] leading-normal mb-0"
              >
                {t("login.password")}
              </label>
              <div className="relative w-full">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full h-[55px] bg-white border border-[#64748b] border-[0.2px] rounded-[10px] px-4 pr-[50px] text-[16px] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#007489] focus:border-[#007489]"
                  placeholder={t("login.passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[19px] top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-[#64748b] hover:opacity-70 transition-opacity"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Botón Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[55px] bg-[#007489] text-white text-[16px] font-bold rounded-[10px] shadow-[0px_4px_4px_0px_rgba(100,116,139,0.25)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? t("login.submitting") : t("login.submit")}
            </button>

            {/* Forgot password */}
            <div className="flex flex-col items-center text-[16px] leading-[30px] text-center text-[#0f172a]">
              <span className="font-medium">Forgot password?</span>
              <a href="#" className="font-semibold text-[#007489] underline">
                Click here
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
