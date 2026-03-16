"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  Users,
  Router,
  DollarSign,
  UserPlus,
  Activity,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalRouters: number;
  onlineRouters: number;
  totalRevenue: number;
  pendingInvoices: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  adminPaymentStats: {
    id: string;
    name: string;
    email: string;
    invoiceCount: number;
    totalAmount: number;
  }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    plan: string;
    createdAt: string;
    _count: { routers: number };
  }[];
}

export default function AdminDashboardPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isAr ? "لوحة تحكم المنصة" : "Platform Dashboard"}
        </h1>
        <p className="text-slate-500 mt-1">
          {isAr ? "نظرة عامة على المنصة بالكامل" : "Overview of the entire platform"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatsCard
          title={isAr ? "إجمالي المستخدمين" : "Total Users"}
          value={loading ? "–" : stats?.totalUsers ?? 0}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title={isAr ? "مستخدمون جدد (هذا الشهر)" : "New Users (This Month)"}
          value={loading ? "–" : stats?.newUsersThisMonth ?? 0}
          icon={UserPlus}
          color="emerald"
        />
        <StatsCard
          title={isAr ? "إجمالي الراوترات" : "Total Routers"}
          value={loading ? "–" : stats?.totalRouters ?? 0}
          icon={Router}
          color="accent"
        />
        <StatsCard
          title={isAr ? "راوترات متصلة" : "Online Routers"}
          value={loading ? "–" : stats?.onlineRouters ?? 0}
          icon={Activity}
          color="emerald"
        />
        <StatsCard
          title={isAr ? "الاشتراكات النشطة" : "Active Subscriptions"}
          value={loading ? "–" : stats?.activeSubscriptions ?? 0}
          icon={CheckCircle}
          color="emerald"
        />
        <StatsCard
          title={isAr ? "اشتراكات تجريبية" : "Trial Subscriptions"}
          value={loading ? "–" : stats?.trialSubscriptions ?? 0}
          icon={CreditCard}
          color="primary"
        />
        <StatsCard
          title={isAr ? "اشتراكات منتهية" : "Expired Subscriptions"}
          value={loading ? "–" : stats?.expiredSubscriptions ?? 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title={isAr ? "فواتير معلقة" : "Pending Invoices"}
          value={loading ? "–" : stats?.pendingInvoices ?? 0}
          icon={Clock}
          color="red"
        />
        <StatsCard
          title={isAr ? "إجمالي الإيرادات" : "Total Revenue"}
          value={loading ? "–" : `$${(stats?.totalRevenue ?? 0).toFixed(2)}`}
          icon={DollarSign}
          color="emerald"
        />
      </div>

      {/* Admin Payment Stats */}
      {!loading && stats?.adminPaymentStats && stats.adminPaymentStats.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            {isAr ? "تحصيل المدفوعات حسب المشرف" : "Payment Collection by Admin"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.adminPaymentStats.map((admin) => (
              <div key={admin.id} className="card !p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    {admin.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{admin.name}</p>
                    <p className="text-[11px] text-slate-400 truncate" dir="ltr">{admin.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-emerald-600">${admin.totalAmount.toFixed(2)}</p>
                    <p className="text-[10px] text-emerald-600/70">{isAr ? "إجمالي المحصّل" : "Total Collected"}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-blue-600">{admin.invoiceCount}</p>
                    <p className="text-[10px] text-blue-600/70">{isAr ? "فاتورة تم تسديدها" : "Invoices Confirmed"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Users */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {isAr ? "أحدث المستخدمين المسجلين" : "Recently Registered Users"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-start py-3 px-4 font-medium text-slate-500">
                  {isAr ? "الاسم" : "Name"}
                </th>
                <th className="text-start py-3 px-4 font-medium text-slate-500">
                  {isAr ? "البريد" : "Email"}
                </th>
                <th className="text-start py-3 px-4 font-medium text-slate-500">
                  {isAr ? "الباقة" : "Plan"}
                </th>
                <th className="text-start py-3 px-4 font-medium text-slate-500">
                  {isAr ? "الراوترات" : "Routers"}
                </th>
                <th className="text-start py-3 px-4 font-medium text-slate-500">
                  {isAr ? "تاريخ التسجيل" : "Joined"}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    {isAr ? "جارٍ التحميل..." : "Loading..."}
                  </td>
                </tr>
              ) : stats?.recentUsers?.length ? (
                stats.recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">{user.name}</td>
                    <td className="py-3 px-4 text-slate-600" dir="ltr">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{user._count.routers}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    {isAr ? "لا يوجد مستخدمين" : "No users yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
