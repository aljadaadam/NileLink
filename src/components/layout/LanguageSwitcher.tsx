"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale() {
    const newLocale = locale === "en" ? "ar" : "en";
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <button
      onClick={switchLocale}
      className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm
        text-slate-600 hover:text-slate-900 hover:bg-gray-100 transition-colors"
    >
      <Globe className="w-4 h-4" />
      <span className="hidden sm:inline">{locale === "en" ? "العربية" : "English"}</span>
      <span className="sm:hidden text-xs">{locale === "en" ? "AR" : "EN"}</span>
    </button>
  );
}
