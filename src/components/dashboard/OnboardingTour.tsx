"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Router,
  Package,
  Ticket,
  FileCode,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOUR_KEY = "nilelink_onboarding_done";

const steps = [
  { icon: Router, href: "/manage-nl7x9k2p/routers", color: "from-blue-500 to-cyan-500" },
  { icon: Package, href: "/manage-nl7x9k2p/packages", color: "from-violet-500 to-purple-500" },
  { icon: Ticket, href: "/manage-nl7x9k2p/vouchers", color: "from-amber-500 to-orange-500" },
  { icon: FileCode, href: "/manage-nl7x9k2p/login-pages", color: "from-emerald-500 to-teal-500" },
  { icon: BarChart3, href: "/manage-nl7x9k2p", color: "from-rose-500 to-pink-500" },
];

export default function OnboardingTour() {
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(-1); // -1 = welcome screen

  useEffect(() => {
    if (typeof window !== "undefined") {
      const done = localStorage.getItem(TOUR_KEY);
      if (!done) setShow(true);
    }
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem(TOUR_KEY, "1");
  }

  if (!show) return null;

  const totalSteps = steps.length;
  const isWelcome = step === -1;
  const isLast = step === totalSteps - 1;
  const currentStep = step >= 0 ? steps[step] : null;
  const StepIcon = currentStep?.icon || Sparkles;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-slate-950/50 overflow-hidden animate-in fade-in zoom-in-95 duration-300"
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 end-4 z-10 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isWelcome ? (
          /* Welcome Screen */
          <div className="p-8 text-center">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("welcome")}
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
              {t("welcomeDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setStep(0)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25"
              >
                <Sparkles className="w-4 h-4" />
                {t("startTour")}
              </button>
              <button
                onClick={dismiss}
                className="px-6 py-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 font-medium transition-colors"
              >
                {t("skipTour")}
              </button>
            </div>
          </div>
        ) : (
          /* Step Content */
          <div>
            {/* Gradient header */}
            <div className={cn("h-2 bg-gradient-to-r", currentStep?.color)} />

            <div className="p-8">
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium text-slate-400">
                  {t("stepOf", { current: step + 1, total: totalSteps })}
                </span>
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === step
                          ? "w-6 bg-primary-500"
                          : i < step
                          ? "w-1.5 bg-primary-300"
                          : "w-1.5 bg-slate-200"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Icon */}
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-lg",
                  currentStep?.color
                )}
              >
                <StepIcon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t(`step${step + 1}Title`)}
              </h3>
              <p className="text-slate-500 leading-relaxed mb-8">
                {t(`step${step + 1}Desc`)}
              </p>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={step === 0}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    step === 0
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {isAr ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                  {t("prevStep")}
                </button>

                {isLast ? (
                  <Link
                    href={currentStep?.href || "/manage-nl7x9k2p/routers"}
                    onClick={dismiss}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 text-sm"
                  >
                    <Rocket className="w-4 h-4" />
                    {t("finish")}
                  </Link>
                ) : (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-sm"
                  >
                    {t("nextStep")}
                    {isAr ? (
                      <ChevronLeft className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
