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
  TrendingUp,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { StatsData } from "@/types";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const ts = useTranslations("sidebar");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    fetch("/api/manage-nl7x9k2p/stats")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setStats)
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  const quickActions = [
    {
      label: ts("routers"),
      href: "/manage-nl7x9k2p/routers",
      icon: Router,
      color: "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400",
    },
    {
      label: ts("vouchers"),
      href: "/manage-nl7x9k2p/vouchers",
      icon: Ticket,
      color: "bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400",
    },
    {
      label: ts("packages"),
      href: "/manage-nl7x9k2p/packages",
      icon: Zap,
      color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: ts("users"),
      href: "/manage-nl7x9k2p/users",
      icon: Users,
      color: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Help */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("title")}</h1>
        <button onClick={() => setShowHelp(!showHelp)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-600 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      {showHelp && (
        <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 rounded-xl p-4 text-sm text-primary-800 dark:text-primary-200 leading-relaxed">
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
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
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
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {t("stats.usedVouchers")}
            </h3>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {loading ? "–" : stats?.usedVouchers ?? 0}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            / {loading ? "–" : stats?.totalVouchers ?? 0}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {t("stats.revenue")}
            </h3>
            <DollarSign className="w-5 h-5 text-accent-500" />
          </div>
          {loading ? (
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">–</p>
          ) : !stats?.revenueByCurrency?.length ? (
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">0</p>
          ) : (
            <div className="space-y-1">
              {stats.revenueByCurrency.map((r) => (
                <p key={r.currency} className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {r.amount.toFixed(2)} <span className="text-base font-medium text-slate-500">{r.currency}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Charts */}
      {!loading && stats && (
        <>
          {/* Peak Hours Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                {t("stats.peakHours")}
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(h) => `${h}:00`}
                    tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                    interval={2}
                  />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(h) => `${h}:00 - ${h}:59`}
                    formatter={(value: number) => [value, t("stats.sessions")]}
                    contentStyle={{ borderRadius: 12, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, fontSize: 13, backgroundColor: isDark ? "#1e293b" : "#fff", color: isDark ? "#e2e8f0" : "#0f172a" }}
                  />
                  <Bar dataKey="sessions" fill="#0891b2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Usage + Prediction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  {t("stats.dailyUsage")}
                </h3>
              </div>
              {stats.dailyUsage.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.dailyUsage}>
                      <defs>
                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0891b2" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} />
                      <XAxis
                        dataKey="day"
                        tickFormatter={(d) => d.slice(5)}
                        tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} allowDecimals={false} />
                      <Tooltip
                        formatter={(value: number) => [value, t("stats.usedVouchers")]}
                        contentStyle={{ borderRadius: 12, border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, fontSize: 13, backgroundColor: isDark ? "#1e293b" : "#fff", color: isDark ? "#e2e8f0" : "#0f172a" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#0891b2"
                        strokeWidth={2}
                        fill="url(#colorUsage)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-12">{t("stats.noData")}</p>
              )}
            </div>

            {/* Prediction Card */}
            <div className="card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    {t("stats.prediction")}
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t("stats.unusedCodes")}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.unusedVouchers}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t("stats.avgPerDay")}</p>
                    <p className="text-3xl font-bold text-primary-600 mt-1">{stats.avgVouchersPerDay}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                {stats.daysUntilEmpty !== null ? (
                  <div className={`rounded-xl p-3 text-center ${stats.daysUntilEmpty <= 3 ? "bg-red-50 dark:bg-red-900/30" : stats.daysUntilEmpty <= 7 ? "bg-amber-50 dark:bg-amber-900/30" : "bg-emerald-50 dark:bg-emerald-900/30"}`}>
                    <p className={`text-2xl font-bold ${stats.daysUntilEmpty <= 3 ? "text-red-600" : stats.daysUntilEmpty <= 7 ? "text-amber-600" : "text-emerald-600"}`}>
                      ~{stats.daysUntilEmpty} {t("stats.days")}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{t("stats.untilEmpty")}</p>
                  </div>
                ) : (
                  <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-center">
                    <p className="text-sm text-slate-400">{t("stats.noData")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
