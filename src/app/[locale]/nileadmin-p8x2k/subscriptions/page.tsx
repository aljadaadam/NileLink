"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { formatDate } from "@/lib/utils";
import {
  CreditCard,
  Search,
  Users,
  Router,
  Ticket,
  Package,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface UserSubscription {
  id: string;
  name: string;
  email: string;
  company: string | null;
  createdAt: string;
  _count: {
    routers: number;
    vouchers: number;
    packages: number;
    hotspotUsers: number;
  };
}

interface AdminInvoice {
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
  user: { name: string; email: string; plan: string };
}

const statusIcons: Record<string, typeof Clock> = {
  PENDING: Clock,
  PAID: CheckCircle,
  OVERDUE: AlertCircle,
  CANCELLED: XCircle,
};
const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  PAID: "bg-emerald-50 text-emerald-700",
  OVERDUE: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

// formatDate imported from utils

type Tab = "invoices" | "usage";

export default function AdminSubscriptionsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [tab, setTab] = useState<Tab>("invoices");
  const [users, setUsers] = useState<UserSubscription[]>([]);
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/invoices").then((r) => r.json()),
    ])
      .then(([userData, invData]) => {
        setUsers(userData.users || []);
        setInvoices(Array.isArray(invData) ? invData : []);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const handleInvoiceAction = async (invoiceId: string, action: "pay" | "cancel") => {
    setActing(invoiceId);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? { ...inv, status: data.status, paidAt: action === "pay" ? new Date().toISOString() : inv.paidAt }
            : inv
        )
      );
      toast.success(action === "pay"
        ? (isAr ? "تم تأكيد الدفع وتفعيل الاشتراك" : "Payment confirmed & subscription activated")
        : (isAr ? "تم إلغاء الفاتورة" : "Invoice cancelled")
      );
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setActing(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.user.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.user.email.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAr ? "الاشتراكات والفواتير" : "Subscriptions & Invoices"}
          </h1>
          <p className="text-slate-500 mt-1">
            {isAr ? "إدارة الفواتير وتأكيد المدفوعات" : "Manage invoices and confirm payments"}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "بحث..." : "Search..."}
            className="w-full ps-9 pe-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{invoices.length}</p>
            <p className="text-xs text-slate-500">{isAr ? "إجمالي الفواتير" : "Total Invoices"}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{pendingCount}</p>
            <p className="text-xs text-slate-500">{isAr ? "بانتظار الدفع" : "Awaiting Payment"}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">
              ${invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0)}
            </p>
            <p className="text-xs text-slate-500">{isAr ? "إجمالي المحصّل" : "Total Collected"}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{users.length}</p>
            <p className="text-xs text-slate-500">{isAr ? "المستخدمين" : "Total Users"}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("invoices")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === "invoices" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileText className="w-4 h-4" />
          {isAr ? "الفواتير" : "Invoices"}
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </button>
        <button
          onClick={() => setTab("usage")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === "usage" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          {isAr ? "الاستخدام" : "Usage"}
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          {isAr ? "جارٍ التحميل..." : "Loading..."}
        </div>
      ) : tab === "invoices" ? (
        /* Invoices Table */
        <div className="card overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{isAr ? "لا توجد فواتير" : "No invoices found"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50/50">
                    <th className="text-start py-3 px-3 font-medium text-slate-500">{isAr ? "الفاتورة" : "Invoice"}</th>
                    <th className="text-start py-3 px-3 font-medium text-slate-500">{isAr ? "المستخدم" : "User"}</th>
                    <th className="text-start py-3 px-3 font-medium text-slate-500">{isAr ? "الباقة" : "Plan"}</th>
                    <th className="text-start py-3 px-3 font-medium text-slate-500">{isAr ? "المبلغ" : "Amount"}</th>
                    <th className="text-start py-3 px-3 font-medium text-slate-500">{isAr ? "الحالة" : "Status"}</th>
                    <th className="text-start py-3 px-3 font-medium text-slate-500">{isAr ? "الاستحقاق" : "Due Date"}</th>
                    <th className="text-start py-3 px-3 font-medium text-slate-500">{isAr ? "إجراء" : "Action"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => {
                    const StatusIcon = statusIcons[inv.status] || Clock;
                    return (
                      <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-mono text-xs font-medium">{inv.invoiceNumber}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(inv.createdAt, locale)}</p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-medium text-slate-900 text-sm">{inv.user.name}</p>
                          <p className="text-[11px] text-slate-400" dir="ltr">{inv.user.email}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                            {inv.plan}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold">${inv.amount}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[inv.status] || "bg-gray-100"}`}>
                            <StatusIcon className="w-3 h-3" />
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-xs">{formatDate(inv.dueDate, locale)}</td>
                        <td className="py-3 px-3">
                          {(inv.status === "PENDING" || inv.status === "OVERDUE") && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleInvoiceAction(inv.id, "pay")}
                                disabled={acting === inv.id}
                                className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-3 h-3" />
                                {isAr ? "تأكيد الدفع" : "Confirm Payment"}
                              </button>
                              <button
                                onClick={() => handleInvoiceAction(inv.id, "cancel")}
                                disabled={acting === inv.id}
                                className="inline-flex items-center gap-1 text-slate-400 hover:text-red-500 text-xs px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          {inv.status === "PAID" && inv.paidAt && (
                            <span className="text-[11px] text-emerald-600">{formatDate(inv.paidAt, locale)}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Usage Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              {isAr ? "لا يوجد مستخدمين" : "No users found"}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-700">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate" dir="ltr">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-lg p-2.5 flex items-center gap-2">
                    <Router className="w-4 h-4 text-primary-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user._count.routers}</p>
                      <p className="text-[10px] text-slate-400">{isAr ? "راوترات" : "Routers"}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2.5 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user._count.packages}</p>
                      <p className="text-[10px] text-slate-400">{isAr ? "باقات" : "Packages"}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2.5 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-accent-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user._count.vouchers}</p>
                      <p className="text-[10px] text-slate-400">{isAr ? "أكواد" : "Codes"}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2.5 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user._count.hotspotUsers}</p>
                      <p className="text-[10px] text-slate-400">{isAr ? "مستخدمين" : "Users"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-slate-400">
                  {isAr ? "تاريخ التسجيل: " : "Joined: "}
                  {new Date(user.createdAt).toLocaleDateString(locale)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
