"use client";

import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Ticket,
  Trash2,
  Loader2,
  X,
  Printer,
  Copy,
  CheckCircle,
  Search,
  Package,
  Clock,
  Ban,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Hash,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Wifi } from "lucide-react";

interface RouterOption {
  id: string;
  name: string;
  apiKey: string;
}

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
  const locale = useLocale();
  const isAr = locale === "ar";
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeVoucher, setActiveVoucher] = useState<VoucherItem | null>(null);
  const [activeQr, setActiveQr] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [routers, setRouters] = useState<RouterOption[]>([]);
  const [selectedRouter, setSelectedRouter] = useState<string>("");

  async function loadData() {
    try {
      const [vRes, pRes, rRes] = await Promise.all([
        fetch("/api/vouchers"),
        fetch("/api/packages"),
        fetch("/api/routers"),
      ]);
      setVouchers(await vRes.json());
      setPackages(await pRes.json());
      const routerData = await rRes.json();
      const mapped = routerData.map((r: { id: string; name: string; apiKey: string }) => ({
        id: r.id,
        name: r.name,
        apiKey: r.apiKey,
      }));
      setRouters(mapped);
      if (mapped.length === 1) setSelectedRouter(mapped[0].apiKey);
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
          expiryDays: formData.get("expiryDays") ? parseInt(formData.get("expiryDays") as string) : undefined,
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

  async function handleDeleteVoucher(voucher: VoucherItem) {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch("/api/vouchers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [voucher.id] }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to delete");
        return;
      }
      setVouchers((prev) => prev.filter((v) => v.id !== voucher.id));
      setActiveVoucher(null);
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(t("deleteConfirm"))) return;
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/vouchers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to delete");
        return;
      }
      setVouchers((prev) => prev.filter((v) => !selectedIds.has(v.id)));
      setSelectedIds(new Set());
    } catch {
      toast.error("Failed to delete");
    } finally {
      setBulkDeleting(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const pageIds = paginated.map((v) => v.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  async function handleBulkPrint() {
    const selected = vouchers.filter((v) => selectedIds.has(v.id));
    if (selected.length === 0) return;

    const qrPromises = selected.map((v) => generateQr(v.code));
    const qrs = await Promise.all(qrPromises);

    const cards = selected.map((v, i) => `
      <div class="voucher">
        <div class="brand">NileLink WiFi</div>
        <img class="qr" src="${qrs[i]}" width="140" height="140" />
        <hr class="divider" />
        <div class="code">${escapeHtml(v.code)}</div>
        <div class="pkg">${escapeHtml(v.package.name)}</div>
        <div class="price">${escapeHtml(v.package.price)} ${escapeHtml(v.package.currency)}</div>
        <div class="footer">${selectedRouter ? 'Scan QR to auto-connect' : 'Scan QR or enter code to connect'}</div>
      </div>
    `).join("");

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>NileLink Vouchers</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #fff; width: 80mm; margin: 0 auto; }
        .voucher { border: 2px dashed #0891b2; padding: 16px 20px; margin: 8px;
          text-align: center; border-radius: 12px;
          background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%);
          break-inside: avoid; page-break-inside: avoid; }
        .brand { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 5px;
          margin-bottom: 10px; font-weight: 700; }
        .qr { margin: 8px auto; display: block; }
        .divider { border: none; border-top: 1.5px dashed #94a3b8; margin: 12px 0; }
        .code { font-size: 22px; font-weight: 900; letter-spacing: 5px; color: #0e7490;
          font-family: 'Courier New', monospace; margin: 8px 0; }
        .pkg { font-size: 13px; color: #334155; font-weight: 700; margin-top: 4px; }
        .price { font-size: 12px; color: #64748b; margin-top: 3px; font-weight: 600; }
        .footer { font-size: 9px; color: #94a3b8; margin-top: 10px; letter-spacing: 0.5px; }
        @media print { body { width: 80mm; } .voucher { box-shadow: none; } }
      </style></head><body>
      ${cards}
      <script>
        var imgs = document.querySelectorAll('.qr');
        var loaded = 0;
        function checkPrint() { loaded++; if (loaded >= imgs.length) window.print(); }
        imgs.forEach(function(img) {
          if (img.complete) checkPrint();
          else img.onload = checkPrint;
        });
      <\/script>
      </body></html>
    `);
    win.document.close();
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(tc("copied"));
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function getQrContent(code: string): string {
    if (selectedRouter) {
      const base = typeof window !== "undefined" ? window.location.origin : "https://nilelink.net";
      return `${base}/api/hotspot/login/${selectedRouter}?code=${encodeURIComponent(code)}`;
    }
    return code;
  }

  async function generateQr(code: string): Promise<string> {
    return QRCode.toDataURL(getQrContent(code), {
      width: 200,
      margin: 1,
      color: { dark: "#0e7490", light: "#ffffff" },
    });
  }

  async function openVoucherModal(voucher: VoucherItem) {
    setActiveVoucher(voucher);
    setActiveQr(null);
    const qr = await generateQr(voucher.code);
    setActiveQr(qr);
  }

  async function printVoucher(voucher: VoucherItem) {
    const qr = activeQr || await generateQr(voucher.code);

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>NileLink Voucher</title>
      <style>
        @page { size: 80mm 120mm; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #fff;
          width: 80mm; margin: 0 auto; }
        .voucher { border: 2px dashed #0891b2; padding: 16px 20px; margin: 8px;
          text-align: center; border-radius: 12px;
          background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%); }
        .brand { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 5px;
          margin-bottom: 10px; font-weight: 700; }
        .qr { margin: 8px auto; display: block; }
        .divider { border: none; border-top: 1.5px dashed #94a3b8; margin: 12px 0; }
        .code { font-size: 22px; font-weight: 900; letter-spacing: 5px; color: #0e7490;
          font-family: 'Courier New', monospace; margin: 8px 0; }
        .pkg { font-size: 13px; color: #334155; font-weight: 700; margin-top: 4px; }
        .price { font-size: 12px; color: #64748b; margin-top: 3px; font-weight: 600; }
        .footer { font-size: 9px; color: #94a3b8; margin-top: 10px; letter-spacing: 0.5px; }
        @media print {
          body { width: 80mm; }
          .voucher { break-inside: avoid; box-shadow: none; }
        }
      </style></head><body>
      <div class="voucher">
        <div class="brand">NileLink WiFi</div>
        <img class="qr" src="${qr}" width="140" height="140" />
        <hr class="divider" />
        <div class="code">${escapeHtml(voucher.code)}</div>
        <div class="pkg">${escapeHtml(voucher.package.name)}</div>
        <div class="price">${escapeHtml(voucher.package.price)} ${escapeHtml(voucher.package.currency)}</div>
        <div class="footer">${selectedRouter ? 'Scan QR to auto-connect' : 'Scan QR or enter code to connect'}</div>
      </div>
      <script>
        var img = document.querySelector('.qr');
        if (img.complete) { window.print(); }
        else { img.onload = function() { window.print(); }; }
      <\/script>
      </body></html>
    `);
    win.document.close();
  }

  const statusConfig = {
    UNUSED: { label: t("unused"), badge: "bg-sky-50 text-sky-700 ring-sky-600/20", icon: Ticket, color: "text-sky-600" },
    ACTIVE: { label: tc("active"), badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", icon: Zap, color: "text-emerald-600" },
    USED: { label: t("used"), badge: "bg-slate-100 text-slate-600 ring-slate-500/20", icon: CheckCircle, color: "text-slate-500" },
    EXPIRED: { label: t("expired"), badge: "bg-red-50 text-red-700 ring-red-600/20", icon: Ban, color: "text-red-600" },
  };

  // Stats
  const stats = useMemo(() => ({
    total: vouchers.length,
    unused: vouchers.filter((v) => v.status === "UNUSED").length,
    active: vouchers.filter((v) => v.status === "ACTIVE").length,
    used: vouchers.filter((v) => v.status === "USED").length,
    expired: vouchers.filter((v) => v.status === "EXPIRED").length,
  }), [vouchers]);

  const filtered = useMemo(() => {
    let result = filterStatus === "ALL"
      ? vouchers
      : vouchers.filter((v) => v.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.code.toLowerCase().includes(q) ||
          v.package.name.toLowerCase().includes(q) ||
          (v.usedBy && v.usedBy.toLowerCase().includes(q))
      );
    }
    return result;
  }, [vouchers, filterStatus, searchQuery]);

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-[3px] border-primary-100" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-[3px] border-primary-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-slate-400 animate-pulse">{tc("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl text-white shadow-lg shadow-primary-500/25">
              <Ticket className="w-5 h-5" />
            </div>
            {t("title")}
            <button onClick={() => setShowHelp(!showHelp)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {stats.total} {t("title")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary group shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            {t("generate")}
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-primary-800 leading-relaxed">
          {t("helpDesc")}
        </div>
      )}

      {/* Router Selector for Smart QR */}
      {routers.length > 0 && (
        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Wifi className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500">{t("qrRouter")}</p>
            <select
              value={selectedRouter}
              onChange={(e) => setSelectedRouter(e.target.value)}
              className="mt-0.5 text-sm font-medium text-slate-800 bg-transparent border-none p-0 focus:ring-0 cursor-pointer w-full"
            >
              <option value="">{t("qrCodeOnly")}</option>
              {routers.map((r) => (
                <option key={r.id} value={r.apiKey}>{r.name}</option>
              ))}
            </select>
          </div>
          {selectedRouter && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">
              {t("qrSmart")}
            </span>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { key: "UNUSED", count: stats.unused, icon: Ticket, gradient: "from-sky-500 to-cyan-600", bg: "bg-sky-50", ring: "ring-sky-100" },
          { key: "ACTIVE", count: stats.active, icon: Zap, gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
          { key: "USED", count: stats.used, icon: CheckCircle, gradient: "from-slate-400 to-slate-500", bg: "bg-slate-50", ring: "ring-slate-100" },
          { key: "EXPIRED", count: stats.expired, icon: Ban, gradient: "from-red-500 to-rose-600", bg: "bg-red-50", ring: "ring-red-100" },
        ] as const).map(({ key, count, icon: Icon, gradient, bg, ring }) => (
          <button
            key={key}
            onClick={() => { setFilterStatus(filterStatus === key ? "ALL" : key); setCurrentPage(1); }}
            className={cn(
              "relative overflow-hidden rounded-2xl p-4 text-start transition-all duration-200 ring-1 ring-inset",
              ring,
              filterStatus === key
                ? "bg-white shadow-md scale-[1.02]"
                : "bg-white/60 hover:bg-white hover:shadow-sm"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {statusConfig[key].label}
                </p>
              </div>
              <div className={cn("p-2.5 rounded-xl", bg)}>
                <Icon className={cn("w-5 h-5 bg-gradient-to-br bg-clip-text", statusConfig[key].color)} />
              </div>
            </div>
            {filterStatus === key && (
              <div className={cn("absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r", gradient)} />
            )}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder={tc("search")}
            className="input-field ps-10"
          />
        </div>
        <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
          {(["ALL", "UNUSED", "ACTIVE", "USED", "EXPIRED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                filterStatus === s
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              {s === "ALL" ? tc("all") : statusConfig[s as keyof typeof statusConfig]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-gray-200 bg-white/50 text-center py-20">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
          <div className="relative">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-4">
              <Ticket className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-slate-500 font-medium">{t("empty")}</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("generate")}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Bulk Action Bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-primary-50 border-b border-primary-100">
              <span className="text-sm font-semibold text-primary-700">
                {t("selected", { count: selectedIds.size })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white rounded-lg border border-gray-200 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5 inline-block me-1" />
                  {tc("cancel")}
                </button>
                <button
                  onClick={handleBulkPrint}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {t("printSelected")}
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {bulkDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {t("deleteSelected")}
                </button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={paginated.length > 0 && paginated.every((v) => selectedIds.has(v.id))}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4 text-start text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t("code")}
                  </th>
                  <th className="p-4 text-start text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t("package")}
                  </th>
                  <th className="p-4 text-start text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t("status")}
                  </th>
                  <th className="p-4 text-start text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t("usedBy")}
                  </th>
                  <th className="p-4 text-start text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t("createdAt")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((voucher) => {
                  const cfg = statusConfig[voucher.status];
                  return (
                    <tr
                      key={voucher.id}
                      onClick={() => openVoucherModal(voucher)}
                      className={cn(
                        "group transition-colors duration-150 hover:bg-slate-50/70 cursor-pointer",
                        selectedIds.has(voucher.id) && "bg-primary-50/40"
                      )}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(voucher.id)}
                          onChange={() => toggleSelect(voucher.id)}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-3 py-1.5 font-mono text-sm font-bold text-slate-800 tracking-wider w-fit" dir="ltr">
                          {voucher.code}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">{voucher.package.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ring-1 ring-inset",
                          cfg.badge
                        )}>
                          <cfg.icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {voucher.usedBy || (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-300" />
                          {new Date(voucher.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-slate-50/30">
              <span className="text-sm text-slate-500">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}{" "}
                <span className="text-slate-400">/ {filtered.length}</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-white hover:shadow-sm transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-8 h-8 text-sm rounded-lg transition-all font-medium",
                        currentPage === pageNum
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-500 hover:bg-white hover:shadow-sm"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-white hover:shadow-sm transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voucher Detail Modal */}
      {activeVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveVoucher(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header with QR */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-6 text-white text-center">
              {activeQr ? (
                <div className="mx-auto w-40 h-40 rounded-2xl bg-white p-2 shadow-lg mb-4">
                  <img src={activeQr} alt="QR" className="w-full h-full rounded-xl" />
                </div>
              ) : (
                <div className="mx-auto w-40 h-40 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 animate-spin text-white/60" />
                </div>
              )}
              <p className="font-mono text-xl font-bold tracking-[0.25em]" dir="ltr">{activeVoucher.code}</p>
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-3",
                "bg-white/20 text-white backdrop-blur-sm"
              )}>
                {(() => { const Ic = statusConfig[activeVoucher.status].icon; return <Ic className="w-3 h-3" />; })()}
                {statusConfig[activeVoucher.status].label}
              </span>
            </div>

            {/* Info */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <Package className="w-4 h-4" /> {t("package")}
                </span>
                <span className="text-sm font-semibold text-slate-800">{activeVoucher.package.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {t("createdAt")}
                </span>
                <span className="text-sm font-medium text-slate-700">{new Date(activeVoucher.createdAt).toLocaleDateString()}</span>
              </div>
              {activeVoucher.usedBy && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-slate-500">{t("usedBy")}</span>
                  <span className="text-sm font-medium text-slate-700">{activeVoucher.usedBy}</span>
                </div>
              )}
              {activeVoucher.expiresAt && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {t("expiry")}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{new Date(activeVoucher.expiresAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-5 pt-0 grid grid-cols-3 gap-2">
              <button
                onClick={() => { copyCode(activeVoucher.code); }}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                {copiedCode === activeVoucher.code ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-500 group-hover:text-primary-600 transition-colors" />
                )}
                <span className="text-xs font-medium text-slate-600">{tc("copy")}</span>
              </button>
              <button
                onClick={() => printVoucher(activeVoucher)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors group"
              >
                <Printer className="w-5 h-5 text-primary-600 group-hover:text-primary-700 transition-colors" />
                <span className="text-xs font-medium text-primary-700">{tc("print")}</span>
              </button>
              <button
                onClick={() => handleDeleteVoucher(activeVoucher)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors group"
              >
                <Trash2 className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
                <span className="text-xs font-medium text-red-600">{tc("delete")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{t("generate")}</h2>
                    <p className="text-primary-100 text-xs mt-0.5">{t("title")}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleGenerate} className="p-5 space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Package className="w-4 h-4 text-primary-500" />
                  {t("package")}
                </label>
                <select name="packageId" required className="input-field">
                  <option value="">{t("package")}</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Hash className="w-4 h-4 text-primary-500" />
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
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  {t("expiry")}
                </label>
                <input name="expiryDays" type="number" min="1" max="365" className="input-field" dir="ltr" placeholder={isAr ? "مثال: 30 يوم" : "e.g. 30 days"} />
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 shadow-lg shadow-primary-500/25"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
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
