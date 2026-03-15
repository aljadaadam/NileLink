"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, Zap, Crown, Rocket } from "lucide-react";

interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
}

const PLANS = [
  {
    key: "starter",
    icon: Zap,
    priceUSD: 9,
    popular: false,
    features: ["routers3", "users50", "vouchers100", "support"],
  },
  {
    key: "pro",
    icon: Crown,
    priceUSD: 29,
    popular: true,
    features: ["routers10", "usersUnlimited", "vouchersUnlimited", "customLogin", "analytics", "priority"],
  },
  {
    key: "enterprise",
    icon: Rocket,
    priceUSD: 79,
    popular: false,
    features: ["routersUnlimited", "usersUnlimited", "vouchersUnlimited", "customLogin", "analytics", "api", "dedicated", "whiteLabel"],
  },
];

function formatPrice(amount: number, currency: CurrencyInfo): string {
  // Round nicely based on currency
  let rounded: number;
  if (currency.rate >= 1000) {
    rounded = Math.round(amount / 1000) * 1000;
  } else if (currency.rate >= 100) {
    rounded = Math.round(amount / 10) * 10;
  } else if (currency.rate >= 10) {
    rounded = Math.round(amount);
  } else {
    rounded = Math.round(amount * 100) / 100;
  }

  // Format
  if (currency.code === "USD") return `$${rounded}`;
  return `${rounded} ${currency.symbol}`;
}

export default function PricingSection() {
  const t = useTranslations("landing.pricing");
  const [currency, setCurrency] = useState<CurrencyInfo>({ code: "USD", symbol: "$", rate: 1 });

  useEffect(() => {
    fetch("/api/geo")
      .then((r) => r.json())
      .then((data) => {
        if (data.currency) setCurrency(data.currency);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PLANS.map(({ key, icon: Icon, priceUSD, popular, features }) => {
            const price = priceUSD * currency.rate;
            return (
              <div
                key={key}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  popular
                    ? "bg-primary-600 text-white shadow-xl shadow-primary-200/50 scale-[1.02] border-2 border-primary-500"
                    : "bg-white border border-gray-200 hover:border-primary-200 hover:shadow-lg"
                }`}
              >
                {popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-accent-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                      {t("popular")}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      popular ? "bg-white/20" : "bg-primary-50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${popular ? "text-white" : "text-primary-600"}`} />
                  </div>
                  <h3 className={`text-xl font-bold ${popular ? "text-white" : "text-slate-900"}`}>
                    {t(`plans.${key}.name`)}
                  </h3>
                </div>

                <div className="mb-2">
                  <span className={`text-4xl font-bold ${popular ? "text-white" : "text-slate-900"}`}>
                    {formatPrice(price, currency)}
                  </span>
                  <span className={`text-sm ms-1 ${popular ? "text-primary-100" : "text-slate-500"}`}>
                    / {t("month")}
                  </span>
                </div>

                <p className={`text-sm mb-8 ${popular ? "text-primary-100" : "text-slate-500"}`}>
                  {t(`plans.${key}.desc`)}
                </p>

                <ul className="space-y-3 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check
                        className={`w-5 h-5 mt-0.5 shrink-0 ${
                          popular ? "text-primary-200" : "text-primary-500"
                        }`}
                      />
                      <span className={`text-sm ${popular ? "text-primary-50" : "text-slate-600"}`}>
                        {t(`features.${f}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`w-full inline-flex items-center justify-center py-3 px-6 rounded-xl font-semibold text-sm transition-colors ${
                    popular
                      ? "bg-white text-primary-700 hover:bg-primary-50"
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  }`}
                >
                  {t("cta")}
                </Link>
              </div>
            );
          })}
        </div>

        {currency.code !== "USD" && (
          <p className="text-center text-xs text-slate-400 mt-6">
            {t("converted", { currency: currency.code })}
          </p>
        )}
      </div>
    </section>
  );
}
