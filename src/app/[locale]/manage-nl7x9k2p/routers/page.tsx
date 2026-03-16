"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  Plus,
  Router as RouterIcon,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  Plug,
  Pencil,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { RouterFormData } from "@/types";

interface RouterItem {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  apiKey: string;
  status: "ONLINE" | "OFFLINE" | "ERROR";
  lastSeen: string | null;
  createdAt: string;
}

export default function RoutersPage() {
  const t = useTranslations("routers");
  const tc = useTranslations("common");
  const [routers, setRouters] = useState<RouterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRouter, setEditingRouter] = useState<RouterItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  async function loadRouters() {
    try {
      const res = await fetch("/api/routers");
      const data = await res.json();
      setRouters(data);
    } catch {
      toast.error("Failed to load routers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRouters();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const body: RouterFormData = {
      name: formData.get("name") as string,
      host: formData.get("host") as string,
      port: parseInt(formData.get("port") as string) || 8728,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    try {
      const isEdit = !!editingRouter;
      const url = isEdit ? `/api/routers/${editingRouter.id}` : "/api/routers";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || t("connectionFailed"));
        return;
      }
      setShowModal(false);
      setEditingRouter(null);
      loadRouters();
      toast.success(isEdit ? tc("saved") : t("connectionSuccess"));
    } catch {
      toast.error(t("connectionFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      await fetch(`/api/routers/${id}`, { method: "DELETE" });
      setRouters((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleTest(id: string) {
    setTestingId(id);
    try {
      const res = await fetch(`/api/routers/${id}/test`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(t("connectionSuccess"));
        loadRouters();
      } else {
        toast.error(t("connectionFailed"));
      }
    } catch {
      toast.error(t("connectionFailed"));
    } finally {
      setTestingId(null);
    }
  }

  function copyApiKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success(tc("copied"));
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const statusConfig = {
    ONLINE: { icon: CheckCircle, class: "badge-success", label: t("online") },
    OFFLINE: { icon: XCircle, class: "badge-gray", label: t("offline") },
    ERROR: { icon: AlertCircle, class: "badge-danger", label: t("error") },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <button onClick={() => setShowHelp(!showHelp)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        <button onClick={() => { setEditingRouter(null); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4" />
          {t("add")}
        </button>
      </div>

      {showHelp && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-primary-800 leading-relaxed">
          {t("helpDesc")}
        </div>
      )}

      {/* Router Cards */}
      {routers.length === 0 ? (
        <div className="card text-center py-16">
          <RouterIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="mt-4 text-slate-500">{t("empty")}</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary mt-4"
          >
            <Plus className="w-4 h-4" />
            {t("add")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {routers.map((router) => {
            const status = statusConfig[router.status];
            const StatusIcon = status.icon;
            return (
              <div key={router.id} className="card space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                      <RouterIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {router.name}
                      </h3>
                      <p className="text-sm text-slate-500" dir="ltr">
                        {router.host}:{router.port}
                      </p>
                    </div>
                  </div>
                  <span className={status.class}>
                    <StatusIcon className="w-3 h-3 me-1" />
                    {status.label}
                  </span>
                </div>

                {/* API Key */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">{t("apiKey")}</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-slate-700 flex-1 truncate" dir="ltr">
                      {router.apiKey}
                    </code>
                    <button
                      onClick={() => copyApiKey(router.apiKey)}
                      className="text-slate-400 hover:text-primary-600 transition-colors"
                    >
                      {copiedKey === router.apiKey ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Last Seen */}
                {router.lastSeen && (
                  <p className="text-xs text-slate-400">
                    {t("lastSeen")}: {new Date(router.lastSeen).toLocaleString()}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleTest(router.id)}
                    disabled={testingId === router.id}
                    className="btn-secondary text-xs py-1.5 px-3 flex-1"
                  >
                    {testingId === router.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plug className="w-3.5 h-3.5" />
                    )}
                    {t("testConnection")}
                  </button>
                  <button
                    onClick={() => {
                      setEditingRouter(router);
                      setShowModal(true);
                    }}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(router.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {editingRouter ? tc("edit") : t("add")}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingRouter(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4" key={editingRouter?.id || "new"}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("name")}
                </label>
                <input name="name" required className="input-field" defaultValue={editingRouter?.name || ""} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("host")}
                  </label>
                  <input name="host" required className="input-field" dir="ltr" defaultValue={editingRouter?.host || ""} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("port")}
                  </label>
                  <input
                    name="port"
                    type="number"
                    defaultValue={editingRouter?.port ?? 8728}
                    className="input-field"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("username")}
                </label>
                <input name="username" required className="input-field" dir="ltr" defaultValue={editingRouter?.username || ""} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("password")}
                </label>
                <input
                  name="password"
                  type="password"
                  required={!editingRouter}
                  placeholder={editingRouter ? t("passwordPlaceholder") : ""}
                  className="input-field"
                  dir="ltr"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? tc("loading") : editingRouter ? tc("save") : t("add")}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingRouter(null); }}
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
