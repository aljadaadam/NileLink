"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  Plus,
  Users,
  Trash2,
  Loader2,
  X,
  Unplug,
  Wifi,
} from "lucide-react";
import { cn, formatBytes, formatUptime } from "@/lib/utils";
import { toast } from "sonner";

interface HotspotUserItem {
  id: string;
  username: string;
  routerId: string;
  router: { name: string };
  packageName: string | null;
  bytesIn: string;
  bytesOut: string;
  uptime: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface RouterOption {
  id: string;
  name: string;
}

export default function HotspotUsersPage() {
  const t = useTranslations("hotspotUsers");
  const tc = useTranslations("common");
  const [users, setUsers] = useState<HotspotUserItem[]>([]);
  const [routers, setRouters] = useState<RouterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  async function loadData() {
    try {
      const [uRes, rRes] = await Promise.all([
        fetch("/api/hotspot/users"),
        fetch("/api/routers"),
      ]);
      setUsers(await uRes.json());
      setRouters(await rRes.json());
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/hotspot/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
          routerId: formData.get("routerId"),
          packageName: formData.get("packageName") || undefined,
          expiresAt: formData.get("expiresAt") || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setShowModal(false);
      loadData();
    } catch {
      toast.error("Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect(id: string) {
    try {
      await fetch(`/api/hotspot/users/${id}/disconnect`, { method: "POST" });
      toast.success("User disconnected");
      loadData();
    } catch {
      toast.error("Failed to disconnect");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      await fetch(`/api/hotspot/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  }

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginated = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          {t("add")}
        </button>
      </div>

      {users.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="mt-4 text-slate-500">{t("empty")}</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/50">
                  <th className="p-3 text-start text-sm font-medium text-slate-500">
                    {t("username")}
                  </th>
                  <th className="p-3 text-start text-sm font-medium text-slate-500">
                    {t("router")}
                  </th>
                  <th className="p-3 text-start text-sm font-medium text-slate-500">
                    {t("dataUsed")}
                  </th>
                  <th className="p-3 text-start text-sm font-medium text-slate-500">
                    {t("uptime")}
                  </th>
                  <th className="p-3 text-start text-sm font-medium text-slate-500">
                    {tc("status")}
                  </th>
                  <th className="p-3 text-start text-sm font-medium text-slate-500">
                    {tc("actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                          <Wifi className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {user.username}
                          </p>
                          {user.packageName && (
                            <p className="text-xs text-slate-400">
                              {user.packageName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-slate-600">
                      {user.router.name}
                    </td>
                    <td className="p-3 text-sm text-slate-600" dir="ltr">
                      ↓{formatBytes(BigInt(user.bytesIn))} ↑
                      {formatBytes(BigInt(user.bytesOut))}
                    </td>
                    <td className="p-3 text-sm text-slate-600">
                      {formatUptime(user.uptime)}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          user.isActive ? "badge-success" : "badge-gray"
                        }
                      >
                        {user.isActive ? tc("active") : tc("inactive")}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {user.isActive && (
                          <button
                            onClick={() => handleDisconnect(user.id)}
                            className="p-1.5 text-slate-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                            title={t("disconnect")}
                          >
                            <Unplug className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-sm text-slate-500">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, users.length)} / {users.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  ‹
                </button>
                <span className="text-sm text-slate-600">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">{t("add")}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("router")}
                </label>
                <select name="routerId" required className="input-field">
                  <option value="">{t("router")}</option>
                  {routers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("username")}
                </label>
                <input name="username" required className="input-field" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("password")}
                </label>
                <input
                  name="password"
                  type="text"
                  required
                  className="input-field"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("expiresAt")}
                </label>
                <input name="expiresAt" type="datetime-local" className="input-field" dir="ltr" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? tc("loading") : t("add")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  {tc("cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
