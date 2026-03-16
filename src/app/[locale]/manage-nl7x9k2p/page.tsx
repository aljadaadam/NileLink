"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  Router,
  Wifi,
  Users,
  Ticket,
  CheckCircle,
  DollarSign,
  Plus,
  Zap,
  HelpCircle,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { StatsData } from "@/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const ts = useTranslations("sidebar");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetch("/api/manage-nl7x9k2p/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  const quickActions = [
    {
      label: ts("routers"),
      href: "/manage-nl7x9k2p/routers",
      icon: Router,
      color: "bg-primary-50 text-primary-600",
    },
    {
      label: ts("vouchers"),
      href: "/manage-nl7x9k2p/vouchers",
      icon: Ticket,
      color: "bg-accent-50 text-accent-600",
    },
    {
      label: ts("packages"),
      href: "/manage-nl7x9k2p/packages",
      icon: Zap,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: ts("users"),
      href: "/manage-nl7x9k2p/users",
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Help */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <button onClick={() => setShowHelp(!showHelp)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      {showHelp && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-primary-800 leading-relaxed">
          {t("helpDesc")}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatsCard
          title={t("stats.totalRouters")}
          value={loading ? "–" : stats?.totalRouters ?? 0}
          icon={Router}
          color="primary"
        />
        <StatsCard
          title={t("stats.onlineRouters")}
          value={loading ? "–" : stats?.onlineRouters ?? 0}
          icon={Wifi}
          color="emerald"
        />
        <StatsCard
          title={t("stats.activeUsers")}
          value={loading ? "–" : stats?.activeUsers ?? 0}
          icon={Users}
          color="accent"
        />
        <StatsCard
          title={t("stats.totalVouchers")}
          value={loading ? "–" : stats?.totalVouchers ?? 0}
          icon={Ticket}
          color="primary"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {t("quickActions")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="card hover:shadow-md transition-shadow flex flex-col items-center gap-3 py-8"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}
              >
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Stats Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">
              {t("stats.usedVouchers")}
            </h3>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {loading ? "–" : stats?.usedVouchers ?? 0}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            / {loading ? "–" : stats?.totalVouchers ?? 0}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">
              {t("stats.revenue")}
            </h3>
            <DollarSign className="w-5 h-5 text-accent-500" />
          </div>
          {loading ? (
            <p className="text-3xl font-bold text-slate-900">–</p>
          ) : !stats?.revenueByCurrency?.length ? (
            <p className="text-3xl font-bold text-slate-900">0</p>
          ) : (
            <div className="space-y-1">
              {stats.revenueByCurrency.map((r) => (
                <p key={r.currency} className="text-2xl font-bold text-slate-900">
                  {r.amount.toFixed(2)} <span className="text-base font-medium text-slate-500">{r.currency}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
