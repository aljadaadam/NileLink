"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { CreditCard, FileText, Clock, CheckCircle, AlertCircle, Zap, Crown, Rocket } from "lucide-react";
import { PLAN_LIMITS } from "@/lib/plans";

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
  STARTER: "bg-blue-50 text-blue-600",
  PRO: "bg-purple-50 text-purple-600",
  ENTERPRISE: "bg-amber-50 text-amber-600",
};

const statusColors: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  OVERDUE: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const subStatusColors: Record<string, string> = {
  TRIAL: "bg-blue-50 text-blue-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  PAST_DUE: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  EXPIRED: "bg-gray-100 text-gray-500",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function BillingPage() {
  const t = useTranslations("billing");
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/subscription").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
    ])
      .then(([subData, invData]) => {
        setSub(subData);
        setInvoices(Array.isArray(invData) ? invData : []);
      })
      .catch(() => {})
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
      <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>

      {/* Current Plan Card */}
      {sub && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${planColors[sub.plan] || "bg-blue-50 text-blue-600"}`}>
                <PlanIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
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
              <p className="text-2xl font-bold text-slate-900">${sub.limits.priceUSD}</p>
              <p className="text-sm text-slate-500">/ {t("month")}</p>
            </div>
          </div>

          {/* Limits */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500">{t("limits.routers")}</p>
              <p className="text-lg font-bold text-slate-900">
                {sub.limits.maxRouters === -1 ? t("unlimited") : sub.limits.maxRouters}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500">{t("limits.hotspotUsers")}</p>
              <p className="text-lg font-bold text-slate-900">
                {sub.limits.maxHotspotUsers === -1 ? t("unlimited") : sub.limits.maxHotspotUsers}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500">{t("limits.vouchers")}</p>
              <p className="text-lg font-bold text-slate-900">
                {sub.limits.maxVouchersPerMonth === -1 ? t("unlimited") : sub.limits.maxVouchersPerMonth.toLocaleString()}
              </p>
            </div>
          </div>

          {sub.subscription && (
            <div className="mt-4 text-sm text-slate-500">
              {t("period")}: {formatDate(sub.subscription.currentPeriodStart)} → {formatDate(sub.subscription.currentPeriodEnd)}
            </div>
          )}
        </div>
      )}

      {/* Invoices */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">{t("invoices")}</h2>
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
                <tr className="border-b border-gray-100">
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
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs">{inv.invoiceNumber}</td>
                    <td className="py-3 px-2">{t(`planNames.${inv.plan}`)}</td>
                    <td className="py-3 px-2 font-semibold">${inv.amount.toFixed(2)}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[inv.status] || "bg-gray-100"}`}>
                        {t(`invoiceStatus.${inv.status}`)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-500">{formatDate(inv.dueDate)}</td>
                    <td className="py-3 px-2 text-slate-500 text-xs">
                      {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
