"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import {
  DollarSign,
  Users,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Trash2,
  Shield,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface RevenuePerAdmin {
  id: string;
  name: string;
  email: string;
  totalConfirmed: number;
  monthlyConfirmed: number;
  invoiceCount: number;
}

interface MonthlyBreakdown {
  month: string;
  total: number;
  perAdmin: Record<string, number>;
}

interface RecentPayment {
  id: string;
  invoiceNumber: string;
  amount: number;
  plan: string;
  paidAt: string;
  confirmedBy: string | null;
  user: { name: string; email: string };
}

interface ActivityPerAdmin {
  id: string;
  name: string;
  confirmPayments: number;
  cancelInvoices: number;
  deleteUsers: number;
  toggleRoles: number;
  total: number;
}

interface LogEntry {
  id: string;
  action: string;
  adminName: string;
  adminEmail: string;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

interface PartnershipData {
  admins: Admin[];
  totalRevenue: number;
  monthlyRevenue: number;
  sharePerPartner: number;
  monthlySharePerPartner: number;
  revenuePerAdmin: RevenuePerAdmin[];
  unattributedTotal: number;
  monthlyBreakdown: MonthlyBreakdown[];
  recentPayments: RecentPayment[];
  activityPerAdmin: ActivityPerAdmin[];
  recentLogs: LogEntry[];
}

const actionLabels: Record<string, { en: string; ar: string; icon: typeof CheckCircle; color: string }> = {
  CONFIRM_PAYMENT: { en: "Confirmed Payment", ar: "تأكيد دفع", icon: CheckCircle, color: "text-emerald-600" },
  CANCEL_INVOICE: { en: "Cancelled Invoice", ar: "إلغاء فاتورة", icon: XCircle, color: "text-red-500" },
  DELETE_USER: { en: "Deleted User", ar: "حذف مستخدم", icon: Trash2, color: "text-red-500" },
  TOGGLE_ROLE: { en: "Changed Role", ar: "تغيير صلاحية", icon: Shield, color: "text-blue-500" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMonth(m: string) {
  const [y, mo] = m.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(mo) - 1]} ${y}`;
}

const adminColors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500"];

export default function PartnershipPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [data, setData] = useState<PartnershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "activity">("overview");

  useEffect(() => {
    fetch("/api/admin/partnership")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        {isAr ? "جارٍ التحميل..." : "Loading..."}
      </div>
    );
  }

  if (!data) return null;

  const maxMonthly = Math.max(...data.monthlyBreakdown.map((m) => m.total), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isAr ? "الشراكة والأرباح" : "Partnership & Revenue"}
        </h1>
        <p className="text-slate-500 mt-1">
          {isAr
            ? `${data.admins.length} شركاء — تقسيم الأرباح بالتساوي`
            : `${data.admins.length} Partners — Equal profit sharing`}
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">${data.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-slate-500">{isAr ? "إجمالي الأرباح" : "Total Revenue"}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">${data.monthlyRevenue.toFixed(2)}</p>
              <p className="text-xs text-slate-500">{isAr ? "أرباح الشهر" : "This Month"}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">${data.sharePerPartner.toFixed(2)}</p>
              <p className="text-xs text-slate-500">{isAr ? "حصة كل شريك" : "Share / Partner"}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">${data.monthlySharePerPartner.toFixed(2)}</p>
              <p className="text-xs text-slate-500">{isAr ? "حصة الشهر / شريك" : "Monthly / Partner"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.revenuePerAdmin.map((admin, i) => (
          <div key={admin.id} className="card !p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full ${adminColors[i % adminColors.length]} flex items-center justify-center text-white font-bold text-lg`}>
                {admin.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">{admin.name}</p>
                <p className="text-xs text-slate-400" dir="ltr">{admin.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-600">${admin.totalConfirmed.toFixed(2)}</p>
                <p className="text-[10px] text-slate-500">{isAr ? "إجمالي المحصّل" : "Total Confirmed"}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-blue-600">${admin.monthlyConfirmed.toFixed(2)}</p>
                <p className="text-[10px] text-slate-500">{isAr ? "هذا الشهر" : "This Month"}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-slate-900">{admin.invoiceCount}</p>
                <p className="text-[10px] text-slate-500">{isAr ? "فواتير" : "Invoices"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("overview")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === "overview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          {isAr ? "الأرباح الشهرية" : "Monthly Revenue"}
        </button>
        <button
          onClick={() => setTab("activity")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === "activity" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Activity className="w-4 h-4" />
          {isAr ? "سجل النشاط" : "Activity Log"}
        </button>
      </div>

      {tab === "overview" ? (
        <>
          {/* Monthly Revenue Chart (Bar chart with CSS) */}
          <div className="card !p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              {isAr ? "الأرباح الشهرية (آخر 12 شهر)" : "Monthly Revenue (Last 12 Months)"}
            </h2>
            <div className="space-y-2">
              {data.monthlyBreakdown.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-16 shrink-0">{formatMonth(m.month)}</span>
                  <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden flex">
                    {data.admins.map((admin, i) => {
                      const adminAmount = m.perAdmin[admin.id] || 0;
                      const pct = m.total > 0 ? (adminAmount / maxMonthly) * 100 : 0;
                      return (
                        <div
                          key={admin.id}
                          className={`h-full ${adminColors[i % adminColors.length]} transition-all`}
                          style={{ width: `${pct}%` }}
                          title={`${admin.name}: $${adminAmount.toFixed(2)}`}
                        />
                      );
                    })}
                    {/* unattributed portion */}
                    {(() => {
                      const attributed = data.admins.reduce((s, a) => s + (m.perAdmin[a.id] || 0), 0);
                      const rest = m.total - attributed;
                      if (rest <= 0) return null;
                      const pct = (rest / maxMonthly) * 100;
                      return (
                        <div
                          className="h-full bg-slate-300 transition-all"
                          style={{ width: `${pct}%` }}
                          title={isAr ? `غير محدد: $${rest.toFixed(2)}` : `Unattributed: $${rest.toFixed(2)}`}
                        />
                      );
                    })()}
                  </div>
                  <span className="text-xs font-semibold w-16 text-end text-slate-700">${m.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              {data.admins.map((admin, i) => (
                <div key={admin.id} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${adminColors[i % adminColors.length]}`} />
                  <span className="text-xs text-slate-600">{admin.name}</span>
                </div>
              ))}
              {data.unattributedTotal > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-slate-300" />
                  <span className="text-xs text-slate-400">{isAr ? "غير محدد" : "Unattributed"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-slate-900">
                {isAr ? "آخر المدفوعات المؤكدة" : "Recent Confirmed Payments"}
              </h2>
            </div>
            {data.recentPayments.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                {isAr ? "لا توجد مدفوعات بعد" : "No payments yet"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-gray-100">
                      <th className="text-start py-2.5 px-3 font-medium text-slate-500">{isAr ? "الفاتورة" : "Invoice"}</th>
                      <th className="text-start py-2.5 px-3 font-medium text-slate-500">{isAr ? "المستخدم" : "User"}</th>
                      <th className="text-start py-2.5 px-3 font-medium text-slate-500">{isAr ? "الباقة" : "Plan"}</th>
                      <th className="text-start py-2.5 px-3 font-medium text-slate-500">{isAr ? "المبلغ" : "Amount"}</th>
                      <th className="text-start py-2.5 px-3 font-medium text-slate-500">{isAr ? "أكد بواسطة" : "Confirmed By"}</th>
                      <th className="text-start py-2.5 px-3 font-medium text-slate-500">{isAr ? "التاريخ" : "Date"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentPayments.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 font-mono text-xs">{p.invoiceNumber}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-medium text-slate-900 text-xs">{p.user.name}</p>
                          <p className="text-[10px] text-slate-400" dir="ltr">{p.user.email}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{p.plan}</span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-600">${p.amount}</td>
                        <td className="py-2.5 px-3">
                          {p.confirmedBy ? (
                            <span className="text-xs font-medium text-slate-700">{p.confirmedBy}</span>
                          ) : (
                            <span className="text-xs text-slate-400">{isAr ? "—" : "—"}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-slate-500">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Admin Activity Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.activityPerAdmin.map((a, i) => (
              <div key={a.id} className="card !p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${adminColors[i % adminColors.length]} flex items-center justify-center text-white font-bold text-lg`}>
                    {a.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{a.name}</p>
                    <p className="text-xs text-slate-400">{a.total} {isAr ? "إجراء" : "actions"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-emerald-50 rounded-lg p-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-emerald-700">{a.confirmPayments}</p>
                      <p className="text-[10px] text-emerald-600">{isAr ? "تأكيد دفع" : "Payments"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 rounded-lg p-2.5">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-sm font-bold text-red-600">{a.cancelInvoices}</p>
                      <p className="text-[10px] text-red-500">{isAr ? "إلغاء فاتورة" : "Cancelled"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-50 rounded-lg p-2.5">
                    <Trash2 className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-bold text-orange-600">{a.deleteUsers}</p>
                      <p className="text-[10px] text-orange-500">{isAr ? "حذف مستخدم" : "Deleted"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2.5">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-bold text-blue-600">{a.toggleRoles}</p>
                      <p className="text-[10px] text-blue-500">{isAr ? "تغيير صلاحية" : "Roles"}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full Activity Log */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-slate-900">
                {isAr ? "سجل النشاط التفصيلي" : "Detailed Activity Log"}
              </h2>
            </div>
            {data.recentLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Activity className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                {isAr ? "لا توجد أنشطة مسجلة بعد" : "No activity recorded yet"}
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {data.recentLogs.map((log) => {
                  const meta = actionLabels[log.action] || { en: log.action, ar: log.action, icon: Clock, color: "text-slate-500" };
                  const Icon = meta.icon;
                  return (
                    <div key={log.id} className="flex items-start gap-3 p-3 hover:bg-gray-50/50 transition-colors">
                      <div className={`mt-0.5 ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900">
                          <span className="font-medium">{log.adminName}</span>
                          {" "}
                          <span className="text-slate-500">{isAr ? meta.ar : meta.en}</span>
                          {log.details && "amount" in log.details && (
                            <span className="text-emerald-600 font-semibold"> ${log.details.amount as number}</span>
                          )}
                          {log.details && "invoiceNumber" in log.details && (
                            <span className="text-slate-400 text-xs"> ({log.details.invoiceNumber as string})</span>
                          )}
                          {log.details && "email" in log.details && (
                            <span className="text-slate-400 text-xs"> ({log.details.email as string})</span>
                          )}
                          {log.details && "newRole" in log.details && (
                            <span className="text-blue-500 text-xs"> → {log.details.newRole as string}</span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
