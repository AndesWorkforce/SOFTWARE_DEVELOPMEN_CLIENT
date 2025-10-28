"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function LocaleIndex() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Next Intl Starter</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("unauthorized.description")}</p>
        <div className="flex items-center justify-center gap-4">
          <Link className="rounded bg-black text-white px-4 py-2" href={`/${locale}/login`}>
            {t("actions.goHome")}
          </Link>
          <Link className="underline" href={`/${locale}/register`}>
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
