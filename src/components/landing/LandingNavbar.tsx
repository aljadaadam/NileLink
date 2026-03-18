"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Wifi, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export default function LandingNavbar() {
  const t = useTranslations("landing");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-gray-100/80 dark:border-slate-800/80"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              NileLink
            </span>
          </Link>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/auth/login"
              className="btn-secondary text-sm py-2 px-4"
            >
              {t("hero.login")}
            </Link>
            <Link
              href="/auth/register"
              className="btn-primary text-sm py-2 px-4"
            >
              {t("hero.cta")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16" />

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-16 inset-x-0 z-50 md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-xl animate-fade-in">
            <div className="flex flex-col p-4 gap-3">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="btn-secondary w-full text-center py-2.5"
              >
                {t("hero.login")}
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full text-center py-2.5"
              >
                {t("hero.cta")}
              </Link>
              <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
