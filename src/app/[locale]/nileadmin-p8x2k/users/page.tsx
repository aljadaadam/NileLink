"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { formatDate } from "@/lib/utils";
import {
  Users,
  Search,
  Shield,
  User,
  Trash2,
  Eye,
  Router,
  Ticket,
  Calendar,
  Phone,
  Building2,
  X,
} from "lucide-react";

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count: {
    routers: number;
    vouchers: number;
    packages: number;
    hotspotUsers: number;
  };
}

export default function AdminUsersPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId: string, newRole: "USER" | "ADMIN") => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) fetchUsers();
  };

  const handleDelete = async (userId: string, userName: string) => {
    const confirmed = window.confirm(
      isAr
        ? `هل أنت متأكد من حذف المستخدم "${userName}"؟ سيتم حذف جميع بياناته.`
        : `Are you sure you want to delete "${userName}"? All their data will be removed.`
    );
    if (!confirmed) return;

    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      fetchUsers();
      setSelectedUser(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAr ? "إدارة المستخدمين" : "User Management"}
          </h1>
          <p className="text-slate-500 mt-1">
            {isAr ? `${users.length} مستخدم مسجل` : `${users.length} registered users`}
          </p>
        </div>

        {/* Search */}
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

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50">
                <th className="text-start py-3 px-4 font-medium text-slate-500">
                  {isAr ? "المستخدم" : "User"}
                </th>
                <th className="text-start py-3 px-4 font-medium text-slate-500">
                  {isAr ? "البريد" : "Email"}
                </th>
                <th className="text-start py-3 px-4 font-medium text-slate-500">
                  {isAr ? "الراوترات" : "Routers"}
                </th>
                <th className="text-start py-3 px-4 font-medium text-slate-500">
                  {isAr ? "التسجيل" : "Joined"}
                </th>
                <th className="text-start py-3 px-4 font-medium text-slate-500">
                  {isAr ? "إجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      {isAr ? "جارٍ التحميل..." : "Loading..."}
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    {isAr ? "لا يوجد مستخدمين" : "No users found"}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          {user.company && (
                            <p className="text-xs text-slate-400">{user.company}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600" dir="ltr">{user.email}</td>
                    <td className="py-3 px-4 text-slate-600">{user._count.routers}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {formatDate(user.createdAt, locale)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                          title={isAr ? "عرض" : "View"}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleRoleToggle(user.id, user.role === "ADMIN" ? "USER" : "ADMIN")
                          }
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                          title={isAr ? "تغيير الدور" : "Toggle Role"}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                          title={isAr ? "حذف" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {isAr ? "تفاصيل المستخدم" : "User Details"}
              </h2>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-700">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{selectedUser.name}</p>
                  <p className="text-sm text-slate-500" dir="ltr">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{selectedUser.company || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600" dir="ltr">{selectedUser.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">
                    {formatDate(selectedUser.createdAt, locale)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className={`font-medium ${selectedUser.role === "ADMIN" ? "text-red-600" : "text-slate-600"}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <Router className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900">{selectedUser._count.routers}</p>
                  <p className="text-xs text-slate-500">{isAr ? "راوترات" : "Routers"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <Ticket className="w-5 h-5 text-accent-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900">{selectedUser._count.vouchers}</p>
                  <p className="text-xs text-slate-500">{isAr ? "قسائم" : "Vouchers"}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => {
                    handleRoleToggle(
                      selectedUser.id,
                      selectedUser.role === "ADMIN" ? "USER" : "ADMIN"
                    );
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-2 px-4 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  {selectedUser.role === "ADMIN"
                    ? isAr ? "إزالة صلاحية الأدمن" : "Remove Admin"
                    : isAr ? "ترقية لأدمن" : "Make Admin"}
                </button>
                <button
                  onClick={() => handleDelete(selectedUser.id, selectedUser.name)}
                  className="py-2 px-4 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  {isAr ? "حذف" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
