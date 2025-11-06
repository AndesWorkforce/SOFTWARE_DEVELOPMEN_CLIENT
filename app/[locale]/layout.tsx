import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { LanguageSwitcher } from "@/packages/design-system";

export const metadata: Metadata = {
  title: "Andes Client",
  description: "Internationalized app with authorized/unauthorized routes",
};

export function generateStaticParams() {
  // Pre-render locale roots for SSG
  return [{ locale: "es" }, { locale: "en" }];
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  // Carga explícita de mensajes desde el paquete centralizado
  const messages = (await import(`@/packages/internationalization/dictionaries/${locale}.json`))
    .default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="relative min-h-screen">
        {/* Language Switcher - Fixed in top-right corner */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
