"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export default function ThemeGuard() {
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const isDark =
      theme === "dark" ||
      ((!theme || theme === "system") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [locale, pathname]);

  return null;
}
