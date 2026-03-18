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
  Cpu,
  Rocket,
  Sparkles,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import RouterSetupWizard from "@/components/dashboard/RouterSetupWizard";

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
  routerOsVersion?: string;
  boardName?: string;
}

export default function RoutersPage() {
  const t = useTranslations("routers");
  const tc = useTranslations("common");
  const [routers, setRouters] = useState<RouterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editingRouter, setEditingRouter] = useState<RouterItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

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

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingRouter) return;
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name") as string,
      host: formData.get("host") as string,
      port: parseInt(formData.get("port") as string) || 8728,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    try {
      const res = await fetch(`/api/routers/${editingRouter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || t("connectionFailed"));
        return;
      }
      setEditingRouter(null);
      loadRouters();
      toast.success(tc("saved"));
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
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        {routers.length > 0 && (
          <button
            onClick={() => setShowWizard(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/20 text-sm"
          >
            <Plus className="w-4 h-4" />
            {t("add")}
          </button>
        )}
      </div>

      {/* Empty State — Wizard CTA */}
      {routers.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 md:p-12 text-white">
          {/* Decorative elements */}
          <div className="absolute top-0 end-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 start-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-6 animate-float-slow">
              <RouterIcon className="w-10 h-10 text-white" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-3 h-3" />
              {t("wizard.onlyOneScript")}
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {t("wizard.emptyTitle")}
            </h2>
            <p className="text-primary-100 mb-8 leading-relaxed">
              {t("wizard.emptyDesc")}
            </p>

            <button
              onClick={() => setShowWizard(true)}
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-xl shadow-black/10 text-base"
            >
              <Rocket className="w-5 h-5" />
              {t("wizard.startSetup")}
            </button>

            {/* 3 feature pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[t("wizard.feat1"), t("wizard.feat2"), t("wizard.feat3")].map((feat, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-xs text-primary-100 px-3 py-1.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Router Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {routers.map((router) => {
            const status = statusConfig[router.status];
            const StatusIcon = status.icon;
            return (
              <div key={router.id} className="card space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      router.status === "ONLINE"
                        ? "bg-emerald-50"
                        : router.status === "ERROR"
                        ? "bg-red-50"
                        : "bg-slate-100"
                    )}>
                      <Wifi className={cn(
                        "w-5 h-5",
                        router.status === "ONLINE"
                          ? "text-emerald-500"
                          : router.status === "ERROR"
                          ? "text-red-500"
                          : "text-slate-400"
                      )} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{router.name}</h3>
                      <p className="text-sm text-slate-500" dir="ltr">{router.host}:{router.port}</p>
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
                    <code className="text-xs text-slate-700 flex-1 truncate" dir="ltr">{router.apiKey}</code>
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

                {/* Device Info */}
                {(router.routerOsVersion || router.boardName) && (
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {router.routerOsVersion && <span>RouterOS {router.routerOsVersion}</span>}
                    {router.routerOsVersion && router.boardName && <span className="text-slate-300">|</span>}
                    {router.boardName && <span>{router.boardName}</span>}
                  </div>
                )}

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
                    onClick={() => setEditingRouter(router)}
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

      {/* Edit Router Modal — only for existing routers */}
      {editingRouter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">{tc("edit")}</h2>
              <button onClick={() => setEditingRouter(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4" key={editingRouter.id}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("name")}</label>
                <input name="name" required className="input-field" defaultValue={editingRouter.name} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t("host")}</label>
                  <input name="host" required className="input-field" dir="ltr" defaultValue={editingRouter.host} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t("port")}</label>
                  <input name="port" type="number" defaultValue={editingRouter.port} className="input-field" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("username")}</label>
                <input name="username" required className="input-field" dir="ltr" defaultValue={editingRouter.username} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("password")}</label>
                <input name="password" type="password" placeholder={t("passwordPlaceholder")} className="input-field" dir="ltr" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? tc("loading") : tc("save")}
                </button>
                <button type="button" onClick={() => setEditingRouter(null)} className="btn-secondary">
                  {tc("cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Setup Wizard */}
      {showWizard && (
        <RouterSetupWizard
          onComplete={() => {
            setShowWizard(false);
            loadRouters();
          }}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}
