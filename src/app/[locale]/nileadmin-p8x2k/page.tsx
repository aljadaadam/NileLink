"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  Users,
  Router,
  Ticket,
  DollarSign,
  UserPlus,
  Activity,
} from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalRouters: number;
  onlineRouters: number;
  totalVouchers: number;
  usedVouchers: number;
  totalRevenue: number;
  activeHotspotUsers: number;
  recentUsers: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    createdAt: string;
    _count: { routers: number; vouchers: number };
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
          title={isAr ? "إجمالي القسائم" : "Total Vouchers"}
          value={loading ? "–" : stats?.totalVouchers ?? 0}
          icon={Ticket}
          color="primary"
        />
        <StatsCard
          title={isAr ? "قسائم مستخدمة" : "Used Vouchers"}
          value={loading ? "–" : stats?.usedVouchers ?? 0}
          icon={Ticket}
          color="red"
        />
        <StatsCard
          title={isAr ? "مستخدمو الهوتسبوت النشطون" : "Active Hotspot Users"}
          value={loading ? "–" : stats?.activeHotspotUsers ?? 0}
          icon={Users}
          color="accent"
        />
        <StatsCard
          title={isAr ? "إجمالي الإيرادات" : "Total Revenue"}
          value={loading ? "–" : `$${(stats?.totalRevenue ?? 0).toFixed(2)}`}
          icon={DollarSign}
          color="emerald"
        />
      </div>

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
                  {isAr ? "الشركة" : "Company"}
                </th>
                <th className="text-start py-3 px-4 font-medium text-slate-500">
                  {isAr ? "الراوترات" : "Routers"}
                </th>
                <th className="text-start py-3 px-4 font-medium text-slate-500">
                  {isAr ? "القسائم" : "Vouchers"}
                </th>
                <th className="text-start py-3 px-4 font-medium text-slate-500">
                  {isAr ? "تاريخ التسجيل" : "Joined"}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {isAr ? "جارٍ التحميل..." : "Loading..."}
                  </td>
                </tr>
              ) : stats?.recentUsers?.length ? (
                stats.recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">{user.name}</td>
                    <td className="py-3 px-4 text-slate-600" dir="ltr">{user.email}</td>
                    <td className="py-3 px-4 text-slate-600">{user.company || "—"}</td>
                    <td className="py-3 px-4 text-slate-600">{user._count.routers}</td>
                    <td className="py-3 px-4 text-slate-600">{user._count.vouchers}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
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
