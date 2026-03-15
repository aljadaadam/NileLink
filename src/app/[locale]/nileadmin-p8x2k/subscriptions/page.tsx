"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import {
  CreditCard,
  Search,
  Users,
  Router,
  Ticket,
  Package,
} from "lucide-react";

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

export default function AdminSubscriptionsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [users, setUsers] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAr ? "الاشتراكات والاستخدام" : "Subscriptions & Usage"}
          </h1>
          <p className="text-slate-500 mt-1">
            {isAr ? "عرض استخدام كل مستخدم للموارد" : "View each user's resource usage"}
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

      {/* Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            {isAr ? "جارٍ التحميل..." : "Loading..."}
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            {isAr ? "لا يوجد مستخدمين" : "No users found"}
          </div>
        ) : (
          filtered.map((user) => (
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
                    <p className="text-[10px] text-slate-400">{isAr ? "قسائم" : "Vouchers"}</p>
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
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
