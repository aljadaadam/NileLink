"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Users, Server, Ticket } from "lucide-react";

interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
}

const PLANS = [
  { key: "users100", priceUSD: 15, users: 100, routers: 1, vouchers: 5000, tier: "basic" },
  { key: "users150", priceUSD: 25, users: 150, routers: 2, vouchers: 6000, tier: "basic" },
  { key: "users200", priceUSD: 35, users: 200, routers: 3, vouchers: 12000, tier: "basic" },
  { key: "users250", priceUSD: 45, users: 250, routers: 5, vouchers: 15000, tier: "basic" },
  { key: "users350", priceUSD: 55, users: 350, routers: 6, vouchers: 16000, tier: "basic" },
  { key: "users400", priceUSD: 65, users: 400, routers: 7, vouchers: 21000, tier: "basic" },
  { key: "users450", priceUSD: 85, users: 450, routers: 10, vouchers: 30000, tier: "basic" },
  { key: "business", priceUSD: 150, users: 2000, routers: 20, vouchers: 80000, tier: "business" },
  { key: "businessPro", priceUSD: 220, users: 3000, routers: 25, vouchers: 80000, tier: "business" },
  { key: "distributor", priceUSD: 450, users: 3500, routers: 30, vouchers: 100000, tier: "vip" },
  { key: "distributorVip", priceUSD: 1400, users: 5000, routers: 100, vouchers: 130000, tier: "vip" },
];

function formatPrice(amount: number, currency: CurrencyInfo): string {
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
  if (currency.code === "USD") return `$${rounded.toLocaleString()}`;
  return `${rounded.toLocaleString()} ${currency.symbol}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
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

  const basicPlans = PLANS.filter((p) => p.tier === "basic");
  const businessPlans = PLANS.filter((p) => p.tier === "business");
  const vipPlans = PLANS.filter((p) => p.tier === "vip");

  const tierColor: Record<string, { badge: string; border: string }> = {
    basic: { badge: "bg-violet-600", border: "border-violet-500/20" },
    business: { badge: "bg-amber-500", border: "border-amber-500/20" },
    vip: { badge: "bg-emerald-500", border: "border-emerald-500/20" },
  };

  const renderCard = (plan: (typeof PLANS)[number]) => {
    const price = plan.priceUSD * currency.rate;
    const colors = tierColor[plan.tier];
    return (
      <div
        key={plan.key}
        className={`bg-white rounded-2xl border ${colors.border} shadow-sm hover:shadow-xl 
          transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 pb-4 text-center border-b border-gray-100">
          <h3 className="text-lg font-bold text-slate-800 mb-3">
            {t(`plans.${plan.key}`)}
          </h3>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {formatPrice(price, currency)}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {t("month")}
          </span>
        </div>

        {/* Features */}
        <div className="p-6 pt-5 flex-1 space-y-4">
          {/* Users */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{t("subscribers")}</span>
            </div>
            <span className={`${colors.badge} text-white text-xs font-bold px-3 py-1 rounded-md`}>
              {formatNumber(plan.users)} {t("user")}
            </span>
          </div>

          {/* Routers */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Server className="w-4 h-4 text-slate-400" />
              <span>{t("routers")}</span>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {plan.routers} {t("router")}
            </span>
          </div>

          {/* Vouchers */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Ticket className="w-4 h-4 text-slate-400" />
              <span>{t("voucherCards")}</span>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {formatNumber(plan.vouchers)} {t("card")}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 pt-2">
          <Link
            href="/auth/register"
            className="w-full inline-flex items-center justify-center py-3 px-6 rounded-xl 
              bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-colors"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Basic Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {basicPlans.map(renderCard)}
        </div>

        {/* Business Plans */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessPlans.map(renderCard)}
        </div>

        {/* VIP / Distributor Plans */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {vipPlans.map(renderCard)}
        </div>

        {currency.code !== "USD" && (
          <p className="text-center text-xs text-slate-500 mt-8">
            {t("converted", { currency: currency.code })}
          </p>
        )}
      </div>
    </section>
  );
}
