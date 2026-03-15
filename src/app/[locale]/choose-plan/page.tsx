"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { Wifi, Zap, Crown, Rocket, Check } from "lucide-react";

const PLANS = [
  {
    key: "STARTER",
    icon: Zap,
    priceUSD: 9,
    features: ["routers3", "users50", "vouchers5000", "support"],
  },
  {
    key: "PRO",
    icon: Crown,
    priceUSD: 29,
    popular: true,
    features: ["routers10", "usersUnlimited", "vouchersUnlimited", "customLogin", "analytics", "priority"],
  },
  {
    key: "ENTERPRISE",
    icon: Rocket,
    priceUSD: 79,
    features: ["routersUnlimited", "usersUnlimited", "vouchersUnlimited", "customLogin", "analytics", "api", "dedicated", "whiteLabel"],
  },
];

function ChoosePlanContent() {
  const t = useTranslations("landing.pricing");
  const tp = useTranslations("plans");
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  async function selectPlan(plan: string) {
    setLoading(plan);
    try {
      const res = await fetch("/api/subscription/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        router.push("/manage-nl7x9k2p");
      }
    } catch {
      // ignore
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-slate-50 to-accent-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <Wifi className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">NileLink</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{tp("chooseTitle")}</h1>
        <p className="mt-2 text-slate-500">{tp("chooseSubtitle")}</p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(({ key, icon: Icon, priceUSD, popular, features }) => (
          <div
            key={key}
            className={`relative rounded-2xl p-6 transition-all duration-300 ${
              popular
                ? "bg-primary-600 text-white shadow-xl shadow-primary-200/50 scale-[1.02] border-2 border-primary-500"
                : "bg-white border border-gray-200 hover:border-primary-200 hover:shadow-lg"
            }`}
          >
            {popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-accent-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {t("popular")}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${popular ? "bg-white/20" : "bg-primary-50"}`}>
                <Icon className={`w-5 h-5 ${popular ? "text-white" : "text-primary-600"}`} />
              </div>
              <h3 className={`text-lg font-bold ${popular ? "text-white" : "text-slate-900"}`}>
                {t(`plans.${key === "STARTER" ? "starter" : key === "PRO" ? "pro" : "enterprise"}.name`)}
              </h3>
            </div>

            <div className="mb-2">
              <span className={`text-3xl font-bold ${popular ? "text-white" : "text-slate-900"}`}>
                ${priceUSD}
              </span>
              <span className={`text-sm ms-1 ${popular ? "text-primary-100" : "text-slate-500"}`}>
                / {t("month")}
              </span>
            </div>

            <p className={`text-xs mb-4 ${popular ? "text-primary-200" : "text-emerald-600"}`}>
              {tp("trialNote")}
            </p>

            <ul className="space-y-2 mb-6">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className={`w-4 h-4 mt-0.5 shrink-0 ${popular ? "text-primary-200" : "text-primary-500"}`} />
                  <span className={`text-sm ${popular ? "text-primary-50" : "text-slate-600"}`}>
                    {t(`features.${f}`)}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => selectPlan(key)}
              disabled={loading !== null}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors ${
                popular
                  ? "bg-white text-primary-700 hover:bg-primary-50"
                  : "bg-primary-600 text-white hover:bg-primary-700"
              } disabled:opacity-50`}
            >
              {loading === key ? "..." : tp("selectPlan")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChoosePlanPage() {
  return (
    <SessionProvider>
      <ChoosePlanContent />
    </SessionProvider>
  );
}
