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
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
      <button
        onClick={() => switchLocale("en")}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          currentLocale === "en"
            ? "bg-blue-600 text-white"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        aria-label="Switch to English"
      >
        🇺🇸 EN
      </button>
      <button
        onClick={() => switchLocale("es")}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          currentLocale === "es"
            ? "bg-blue-600 text-white"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        aria-label="Cambiar a Español"
      >
        🇪🇸 ES
      </button>
    </div>
  );
}
