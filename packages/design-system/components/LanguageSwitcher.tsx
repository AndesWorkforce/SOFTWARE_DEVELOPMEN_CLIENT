"use client";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchLocale = (newLocale: string) => {
    // Replace the locale in the current pathname
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");
    router.push(newPath);
  };

  return (
    <div className="flex items-center bg-white rounded-[10px] h-[30px] w-[120px] overflow-hidden">
      <button
        onClick={() => switchLocale("es")}
        className="flex-1 h-full flex items-center justify-center text-[14px] font-bold transition-colors cursor-pointer"
        style={{
          backgroundColor: currentLocale === "es" ? "#007489" : "#ffffff",
          color: currentLocale === "es" ? "#ffffff" : "#0f172a",
          borderRadius: "10px",
        }}
        aria-label="Cambiar a Español"
      >
        ESP
      </button>
      <button
        onClick={() => switchLocale("en")}
        className="flex-1 h-full flex items-center justify-center text-[14px] font-bold transition-colors cursor-pointer"
        style={{
          backgroundColor: currentLocale === "en" ? "#007489" : "#ffffff",
          color: currentLocale === "en" ? "#ffffff" : "#0f172a",
          borderRadius: "10px",
        }}
        aria-label="Switch to English"
      >
        ENG
      </button>
    </div>
  );
}
