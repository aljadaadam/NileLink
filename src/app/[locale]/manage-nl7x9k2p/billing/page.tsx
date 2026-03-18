"use client";

import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { CreditCard, FileText, Clock, CheckCircle, AlertCircle, Zap, Crown, Rocket, MessageCircle, Mail, HelpCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PLAN_LIMITS } from "@/lib/plans";
import { toast } from "sonner";

interface SubscriptionInfo {
  plan: string;
  trialEndsAt: string | null;
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  } | null;
  isActive: boolean;
  limits: { maxRouters: number; maxHotspotUsers: number; maxVouchersPerMonth: number; priceUSD: number };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

const planIcons: Record<string, typeof Zap> = { STARTER: Zap, PRO: Crown, ENTERPRISE: Rocket };
const planColors: Record<string, string> = {
  STARTER: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
  PRO: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
  ENTERPRISE: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
};

const statusColors: Record<string, string> = {
  PAID: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  PENDING: "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
  OVERDUE: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  CANCELLED: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

const subStatusColors: Record<string, string> = {
  TRIAL: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  ACTIVE: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  PAST_DUE: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  CANCELLED: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  EXPIRED: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

// formatDate imported from @/lib/utils

interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
}

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
  if (currency.code === "USD") return `$${rounded}`;
  return `${rounded} ${currency.symbol}`;
}

export default function BillingPage() {
  const t = useTranslations("billing");
  const locale = useLocale();
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<CurrencyInfo>({ code: "USD", symbol: "$", rate: 1 });
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/subscription").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/geo").then((r) => r.json()),
    ])
      .then(([subData, invData, geoData]) => {
        setSub(subData);
        setInvoices(Array.isArray(invData) ? invData : []);
        if (geoData.currency) setCurrency(geoData.currency);
      })
      .catch(() => toast.error("Failed to load billing data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const PlanIcon = sub ? planIcons[sub.plan] || Zap : Zap;
  const trialDaysLeft = sub?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("title")}</h1>
        <button onClick={() => setShowHelp(!showHelp)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-600 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      {showHelp && (
        <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-800 rounded-xl p-4 text-sm text-primary-800 dark:text-primary-300 leading-relaxed">
          {t("helpDesc")}
        </div>
      )}

      {/* Current Plan Card */}
      {sub && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${planColors[sub.plan] || "bg-blue-50 text-blue-600"}`}>
                <PlanIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t(`planNames.${sub.plan}`)}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${subStatusColors[sub.subscription?.status || "TRIAL"]}`}>
                    {t(`status.${sub.subscription?.status || "TRIAL"}`)}
                  </span>
                  {sub.subscription?.status === "TRIAL" && trialDaysLeft > 0 && (
                    <span className="text-xs text-slate-500">
                      {t("trialDaysLeft", { days: trialDaysLeft })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-end">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatPrice(sub.limits.priceUSD * currency.rate, currency)}</p>
              <p className="text-sm text-slate-500">/ {t("month")}</p>
            </div>
          </div>

          {/* Limits */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("limits.routers")}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {sub.limits.maxRouters === -1 ? t("unlimited") : sub.limits.maxRouters}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("limits.hotspotUsers")}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {sub.limits.maxHotspotUsers === -1 ? t("unlimited") : sub.limits.maxHotspotUsers}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("limits.vouchers")}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {sub.limits.maxVouchersPerMonth === -1 ? t("unlimited") : sub.limits.maxVouchersPerMonth.toLocaleString(locale)}
              </p>
            </div>
          </div>

          {sub.subscription && (
            <div className="mt-4 text-sm text-slate-500">
              {t("period")}: {formatDate(sub.subscription.currentPeriodStart, locale)} → {formatDate(sub.subscription.currentPeriodEnd, locale)}
            </div>
          )}
        </div>
      )}

      {/* Invoices */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("invoices")}</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t("noInvoices")}</p>
            <p className="text-sm text-slate-400 mt-1">{t("noInvoicesHint")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  <th className="text-start py-3 px-2 font-medium text-slate-500">{t("invoiceNumber")}</th>
                  <th className="text-start py-3 px-2 font-medium text-slate-500">{t("plan")}</th>
                  <th className="text-start py-3 px-2 font-medium text-slate-500">{t("amount")}</th>
                  <th className="text-start py-3 px-2 font-medium text-slate-500">{t("statusLabel")}</th>
                  <th className="text-start py-3 px-2 font-medium text-slate-500">{t("dueDate")}</th>
                  <th className="text-start py-3 px-2 font-medium text-slate-500">{t("periodLabel")}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs">{inv.invoiceNumber}</td>
                    <td className="py-3 px-2">{t(`planNames.${inv.plan}`)}</td>
                    <td className="py-3 px-2 font-semibold">{formatPrice(inv.amount * currency.rate, currency)}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[inv.status] || "bg-gray-100"}`}>
                        {t(`invoiceStatus.${inv.status}`)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-500">{formatDate(inv.dueDate, locale)}</td>
                    <td className="py-3 px-2 text-slate-500 text-xs">
                      {formatDate(inv.periodStart, locale)} – {formatDate(inv.periodEnd, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      {invoices.some((inv) => inv.status === "PENDING" || inv.status === "OVERDUE") && (
        <div className="card border-2 border-primary-100 dark:border-primary-800 bg-gradient-to-br from-primary-50/30 dark:from-primary-950/30 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("paymentInstructions")}</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{t("paymentDesc")}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/249123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t("contactWhatsApp")}
            </a>
            <a
              href="mailto:support@nilelink.net"
              className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t("contactEmail")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
