"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  Plus,
  Package,
  Trash2,
  Loader2,
  X,
  Pencil,
  Zap,
  Clock,
  HardDrive,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
} from "lucide-react";
import { cn, formatBytes, formatDuration } from "@/lib/utils";
import { toast } from "sonner";

interface PackageItem {
  id: string;
  name: string;
  duration: number | null;
  dataLimit: string | null;
  uploadSpeed: number | null;
  downloadSpeed: number | null;
  price: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
}

export default function PackagesPage() {
  const t = useTranslations("packages");
  const tc = useTranslations("common");
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editingPkg, setEditingPkg] = useState<PackageItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currency, setCurrency] = useState<CurrencyInfo>({ code: "USD", symbol: "$", rate: 1 });

  async function loadPackages() {
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      setPackages(data);
    } catch {
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPackages();
    fetch("/api/geo").then(r => r.json()).then(data => {
      if (data.currency) setCurrency(data.currency);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      duration: formData.get("duration")
        ? parseInt(formData.get("duration") as string)
        : editId ? null : undefined,
      dataLimit: formData.get("dataLimit")
        ? parseInt(formData.get("dataLimit") as string) * 1024 * 1024
        : editId ? null : undefined,
      uploadSpeed: formData.get("uploadSpeed")
        ? parseInt(formData.get("uploadSpeed") as string)
        : editId ? null : undefined,
      downloadSpeed: formData.get("downloadSpeed")
        ? parseInt(formData.get("downloadSpeed") as string)
        : editId ? null : undefined,
      price: parseFloat(formData.get("price") as string),
      currency: formData.get("currency") as string,
    };

    try {
      const url = editId ? `/api/packages/${editId}` : "/api/packages";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to save package");
        return;
      }
      setShowModal(false);
      setEditId(null);
      setEditingPkg(null);
      loadPackages();
      toast.success(editId ? tc("saved") : t("add"));
    } catch {
      toast.error("Failed to save package");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to delete");
        return;
      }
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleToggleActive(pkg: PackageItem) {
    try {
      const res = await fetch(`/api/packages/${pkg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !pkg.isActive }),
      });
      if (!res.ok) return;
      setPackages((prev) =>
        prev.map((p) => p.id === pkg.id ? { ...p, isActive: !p.isActive } : p)
      );
    } catch {
      toast.error("Failed to update");
    }
  }

  function openEdit(pkg: PackageItem) {
    setEditId(pkg.id);
    setEditingPkg(pkg);
    setShowModal(true);
  }

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
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <button onClick={() => setShowHelp(!showHelp)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setEditingPkg(null);
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          {t("add")}
        </button>
      </div>

      {showHelp && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-primary-800 leading-relaxed">
          {t("helpDesc")}
        </div>
      )}

      {packages.length === 0 ? (
        <div className="card text-center py-16">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="mt-4 text-slate-500">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{pkg.name}</h3>
                </div>
                <span
                  className={cn(
                    pkg.isActive ? "badge-success" : "badge-gray"
                  )}
                >
                  {pkg.isActive ? tc("active") : tc("inactive")}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>
                    {pkg.duration ? formatDuration(pkg.duration) : t("unlimited")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <HardDrive className="w-4 h-4 text-slate-400" />
                  <span>
                    {pkg.dataLimit
                      ? formatBytes(BigInt(pkg.dataLimit))
                      : t("unlimited")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ArrowDown className="w-4 h-4 text-slate-400" />
                  <span>
                    {pkg.downloadSpeed
                      ? `${pkg.downloadSpeed} Kbps`
                      : t("unlimited")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ArrowUp className="w-4 h-4 text-slate-400" />
                  <span>
                    {pkg.uploadSpeed
                      ? `${pkg.uploadSpeed} Kbps`
                      : t("unlimited")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-lg font-bold text-primary-700">
                  {pkg.price} {pkg.currency}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(pkg)}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title={pkg.isActive ? tc("inactive") : tc("active")}
                  >
                    {pkg.isActive ? (
                      <ToggleRight className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(pkg)}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {editId ? tc("edit") : t("add")}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditId(null);
                  setEditingPkg(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4" key={editId || "new"}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("name")}
                </label>
                <input name="name" required className="input-field" defaultValue={editingPkg?.name || ""} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("duration")}
                  </label>
                  <input
                    name="duration"
                    type="number"
                    min="0"
                    className="input-field"
                    dir="ltr"
                    defaultValue={editingPkg?.duration ?? ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("dataLimit")}
                  </label>
                  <input
                    name="dataLimit"
                    type="number"
                    min="0"
                    className="input-field"
                    dir="ltr"
                    defaultValue={editingPkg?.dataLimit ? Math.round(Number(editingPkg.dataLimit) / (1024 * 1024)) : ""}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("downloadSpeed")}
                  </label>
                  <input
                    name="downloadSpeed"
                    type="number"
                    min="0"
                    className="input-field"
                    dir="ltr"
                    defaultValue={editingPkg?.downloadSpeed ?? ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("uploadSpeed")}
                  </label>
                  <input
                    name="uploadSpeed"
                    type="number"
                    min="0"
                    className="input-field"
                    dir="ltr"
                    defaultValue={editingPkg?.uploadSpeed ?? ""}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("price")}
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="input-field"
                    dir="ltr"
                    defaultValue={editingPkg?.price || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("currency")}
                  </label>
                  <select name="currency" className="input-field" defaultValue={editingPkg?.currency || currency.code}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EGP">EGP (ج.م)</option>
                    <option value="SAR">SAR (ر.س)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="SDG">SDG (ج.س)</option>
                    <option value="IQD">IQD (د.ع)</option>
                    <option value="JOD">JOD (د.أ)</option>
                    <option value="KWD">KWD (د.ك)</option>
                    <option value="QAR">QAR (ر.ق)</option>
                    <option value="OMR">OMR (ر.ع)</option>
                    <option value="BHD">BHD (د.ب)</option>
                    <option value="TRY">TRY (₺)</option>
                    <option value="MAD">MAD (د.م)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? tc("loading") : tc("save")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                    setEditingPkg(null);
                  }}
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
