import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "es",
  // Removemos pathnames para permitir el ruteo dinámico de Next.js
});
