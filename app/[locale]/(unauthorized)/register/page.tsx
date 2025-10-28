"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CustomLink } from "@/packages/design-system/components/CustomLink";

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-semibold">{t("unauthorized.title")}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("unauthorized.description")}</p>
        <div className="flex items-center justify-center gap-4">
          <Link className="underline" href={`/${locale}`}>
            {t("actions.goHome")}
          </Link>
          <CustomLink
            className="rounded bg-black text-white px-4 py-2"
            href={`/${locale}/dashboard`}
          >
            {t("actions.enterDashboard")}
          </CustomLink>
        </div>
      </div>
    </main>
  );
}
