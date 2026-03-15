"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  Plus,
  Ticket,
  Trash2,
  Loader2,
  X,
  Printer,
  Copy,
  CheckCircle,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import QRCode from "qrcode";

interface VoucherItem {
  id: string;
  code: string;
  status: "UNUSED" | "ACTIVE" | "USED" | "EXPIRED";
  usedBy: string | null;
  usedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  package: { name: string; price: string; currency: string };
}

interface PackageOption {
  id: string;
  name: string;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function VouchersPage() {
  const t = useTranslations("vouchers");
  const tc = useTranslations("common");
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  async function loadData() {
    try {
      const [vRes, pRes] = await Promise.all([
        fetch("/api/vouchers"),
        fetch("/api/packages"),
      ]);
      setVouchers(await vRes.json());
      setPackages(await pRes.json());
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/vouchers/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: formData.get("packageId"),
          count: parseInt(formData.get("count") as string),
          expiresAt: formData.get("expiresAt") || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to generate vouchers");
        return;
      }
      const data = await res.json();
      setShowModal(false);
      loadData();
      toast.success(t("generated", { count: data.count }));
    } catch {
      toast.error("Failed to generate vouchers");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSelected() {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch("/api/vouchers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to delete");
        return;
      }
      setVouchers((prev) => prev.filter((v) => !selected.has(v.id)));
      setSelected(new Set());
    } catch {
      toast.error("Failed to delete");
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(tc("copied"));
    setTimeout(() => setCopiedCode(null), 2000);
  }

  async function printSelected() {
    const selectedVouchers = vouchers.filter((v) => selected.has(v.id));
    if (selectedVouchers.length === 0) return;

    // Generate QR codes for each voucher
    const voucherData = await Promise.all(
      selectedVouchers.map(async (v) => {
        const qrDataUrl = await QRCode.toDataURL(v.code, {
          width: 120,
          margin: 1,
          color: { dark: "#0e7490", light: "#ffffff" },
        });
        return { code: v.code, qr: qrDataUrl, pkg: v.package };
      })
    );

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>NileLink Vouchers</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 20px; background: #fff; }
        .grid { display: flex; flex-wrap: wrap; gap: 12px; }
        .voucher { border: 2px dashed #0891b2; padding: 16px; width: 260px;
          text-align: center; border-radius: 12px; background: #f0fdfa; }
        .qr { margin: 8px auto; }
        .code { font-size: 22px; font-weight: bold; letter-spacing: 3px; color: #0e7490;
          font-family: 'Courier New', monospace; margin: 8px 0; }
        .pkg { font-size: 13px; color: #334155; font-weight: 600; margin-top: 4px; }
        .price { font-size: 12px; color: #64748b; margin-top: 2px; }
        .label { font-size: 11px; color: #94a3b8; margin-top: 6px; }
        @media print { body { padding: 0; } .voucher { break-inside: avoid; } }
      </style></head><body>
      <div class="grid">
      ${voucherData.map((v) => `
        <div class="voucher">
          <img class="qr" src="${v.qr}" width="120" height="120" />
          <div class="code">${escapeHtml(v.code)}</div>
          <div class="pkg">${escapeHtml(v.pkg.name)}</div>
          <div class="price">${escapeHtml(v.pkg.price)} ${escapeHtml(v.pkg.currency)}</div>
          <div class="label">NileLink WiFi Voucher</div>
        </div>
      `).join("")}
      </div>
      <script>window.print();<\/script>
      </body></html>
    `);
    win.document.close();
  }

  const statusBadge = {
    UNUSED: "badge-info",
    ACTIVE: "badge-success",
    USED: "badge-gray",
    EXPIRED: "badge-danger",
  };

  const statusLabel = {
    UNUSED: t("unused"),
    ACTIVE: tc("active"),
    USED: t("used"),
    EXPIRED: t("expired"),
  };

  const filtered =
    filterStatus === "ALL"
      ? vouchers
      : vouchers.filter((v) => v.status === filterStatus);

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <>
              <button onClick={printSelected} className="btn-secondary text-sm">
                <Printer className="w-4 h-4" />
                {t("printSelected")} ({selected.size})
              </button>
              <button
                onClick={handleDeleteSelected}
                className="btn-danger text-sm"
              >
                <Trash2 className="w-4 h-4" />
                {tc("delete")} ({selected.size})
              </button>
            </>
          )}
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            {t("generate")}
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["ALL", "UNUSED", "ACTIVE", "USED", "EXPIRED"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              filterStatus === s
                ? "bg-primary-600 text-white"
                : "bg-white text-slate-600 hover:bg-gray-50 border border-gray-200"
            )}
          >
            {s === "ALL" ? tc("all") : statusLabel[s as keyof typeof statusLabel]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="mt-4 text-slate-500">{t("empty")}</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/50">
                  <th className="p-3 text-start">
                    <input
                      type="checkbox"
                      checked={selected.size === paginated.length && paginated.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected(new Set(paginated.map((v) => v.id)));
                        } else {
                          setSelected(new Set());
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="p-3 text-start text-sm font-medium text-slate-500">
                    {t("code")}
                  </th>
                  <th className="p-3 text-start text-sm font-medium text-slate-500">
                    {t("package")}
                  </th>
                  <th className="p-3 text-start text-sm font-medium text-slate-500">
                    {t("status")}
                  </th>
                  <th className="p-3 text-start text-sm font-medium text-slate-500">
                    {t("usedBy")}
                  </th>
                  <th className="p-3 text-start text-sm font-medium text-slate-500">
                    {t("createdAt")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.has(voucher.id)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(voucher.id);
                          else next.delete(voucher.id);
                          setSelected(next);
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono font-semibold text-slate-900" dir="ltr">
                          {voucher.code}
                        </code>
                        <button
                          onClick={() => copyCode(voucher.code)}
                          className="text-slate-300 hover:text-primary-600"
                        >
                          {copiedCode === voucher.code ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-slate-600">
                      {voucher.package.name}
                    </td>
                    <td className="p-3">
                      <span className={statusBadge[voucher.status]}>
                        {statusLabel[voucher.status]}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-slate-500">
                      {voucher.usedBy || "—"}
                    </td>
                    <td className="p-3 text-sm text-slate-500">
                      {new Date(voucher.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-sm text-slate-500">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length}
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

      {/* Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {t("generate")}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("package")}
                </label>
                <select name="packageId" required className="input-field">
                  <option value="">{t("package")}</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("count")}
                </label>
                <input
                  name="count"
                  type="number"
                  min="1"
                  max="500"
                  defaultValue={10}
                  required
                  className="input-field"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("expiry")}
                </label>
                <input name="expiresAt" type="date" className="input-field" dir="ltr" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? tc("loading") : t("generate")}
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
