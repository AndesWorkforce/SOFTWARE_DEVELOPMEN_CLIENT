import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";

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
      {children}
    </NextIntlClientProvider>
  );
}
