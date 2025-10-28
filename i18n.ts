import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/packages/internationalization/routing";

export default getRequestConfig(async ({ locale }) => {
  // Validar que el idioma solicitado existe en nuestra configuración
  const localeToUse = locale || routing.defaultLocale;

  if (!routing.locales.includes(localeToUse as (typeof routing.locales)[number])) {
    notFound();
  }

  return {
    locale: localeToUse,
    messages: (await import(`./packages/internationalization/dictionaries/${localeToUse}.json`))
      .default,
  };
});
