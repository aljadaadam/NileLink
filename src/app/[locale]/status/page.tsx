"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { Search, Wifi, Clock, Database, Zap, ArrowDown, ArrowUp, Loader2, AlertCircle, CheckCircle, Ban, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusData {
  found: boolean;
  type?: "voucher" | "active";
  status?: string;
  package?: string;
  packageAr?: string;
  dataUsedMB?: number;
  dataLimitMB?: number | null;
  dataPercent?: number | null;
  minutesRemaining?: number | null;
  totalMinutes?: number | null;
  uploadSpeed?: number | null;
  downloadSpeed?: number | null;
  expiresAt?: string | null;
  sessionActive?: boolean;
  connectedSince?: string | null;
}

export default function StatusPage() {
  const t = useTranslations("statusPortal");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StatusData | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(`/api/hotspot/status?code=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData({ found: false });
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  function formatBytes(mb: number) {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(1)} MB`;
  }

  function formatTime(minutes: number) {
    if (minutes >= 1440) {
      const days = Math.floor(minutes / 1440);
      const hrs = Math.floor((minutes % 1440) / 60);
      return `${days}${isAr ? " يوم" : "d"} ${hrs}${isAr ? " ساعة" : "h"}`;
    }
    if (minutes >= 60) {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hrs}${isAr ? " ساعة" : "h"} ${mins}${isAr ? " دقيقة" : "m"}`;
    }
    return `${minutes} ${isAr ? "دقيقة" : "min"}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-lg mx-auto px-6 py-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm mb-5">
            <Wifi className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-primary-100 text-sm mt-2">{t("subtitle")}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 -mt-6">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
          <label className="text-sm font-semibold text-slate-700 mb-2 block">{t("enterCode")}</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t("codePlaceholder")}
                className="w-full ps-10 pe-4 py-3 border-2 border-gray-200 rounded-xl text-center font-mono tracking-[0.2em] text-slate-800 font-bold focus:border-primary-500 focus:ring-0 outline-none transition-colors"
                dir="ltr"
                maxLength={50}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {t("check")}
            </button>
          </div>
        </form>

        {/* Results */}
        {searched && data && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {!data.found ? (
              // Not found
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-red-400" />
                </div>
                <p className="text-slate-700 font-semibold">{t("notFound")}</p>
                <p className="text-sm text-slate-400 mt-1">{t("notFoundHint")}</p>
              </div>
            ) : data.type === "voucher" ? (
              // Unused voucher
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={cn(
                  "p-5 text-center",
                  data.status === "UNUSED"
                    ? "bg-gradient-to-r from-sky-500 to-cyan-600 text-white"
                    : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                )}>
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                    {data.status === "UNUSED" ? <Ticket className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
                  </div>
                  <p className="font-bold text-lg">
                    {data.status === "UNUSED" ? t("readyToUse") : t("codeExpired")}
                  </p>
                </div>
                <div className="p-5 space-y-3">
                  <InfoRow label={t("package")} value={isAr && data.packageAr ? data.packageAr : (data.package || "—")} />
                  {data.totalMinutes && <InfoRow label={t("duration")} value={formatTime(data.totalMinutes)} />}
                  {data.dataLimitMB && <InfoRow label={t("dataLimit")} value={formatBytes(data.dataLimitMB)} />}
                  {data.downloadSpeed && <InfoRow label={t("speed")} value={`↓${data.downloadSpeed} / ↑${data.uploadSpeed || 0} Kbps`} />}
                  {data.expiresAt && <InfoRow label={t("validUntil")} value={new Date(data.expiresAt).toLocaleDateString(isAr ? "ar" : "en")} />}
                </div>
              </div>
            ) : (
              // Active usage
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Status bar */}
                <div className={cn(
                  "p-5 text-center",
                  data.status === "ACTIVE"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                    : "bg-gradient-to-r from-slate-400 to-slate-500 text-white"
                )}>
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                    {data.status === "ACTIVE" ? <CheckCircle className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
                  </div>
                  <p className="font-bold text-lg">
                    {data.status === "ACTIVE" ? t("connected") : t("sessionEnded")}
                  </p>
                  {data.sessionActive && data.connectedSince && (
                    <p className="text-sm text-white/80 mt-1">
                      {t("connectedSince")} {new Date(data.connectedSince).toLocaleTimeString(isAr ? "ar" : "en")}
                    </p>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  {/* Package */}
                  <InfoRow label={t("package")} value={isAr && data.packageAr ? data.packageAr : (data.package || "—")} />

                  {/* Data Usage */}
                  {data.dataUsedMB !== undefined && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Database className="w-4 h-4" /> {t("dataUsage")}
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatBytes(data.dataUsedMB)}
                          {data.dataLimitMB ? ` / ${formatBytes(data.dataLimitMB)}` : ""}
                        </span>
                      </div>
                      {data.dataPercent !== null && data.dataPercent !== undefined && (
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              data.dataPercent >= 90 ? "bg-red-500" : data.dataPercent >= 70 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${data.dataPercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Time Remaining */}
                  {data.minutesRemaining !== null && data.minutesRemaining !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> {t("timeRemaining")}
                      </span>
                      <span className={cn(
                        "font-bold",
                        data.minutesRemaining <= 10 ? "text-red-600" : data.minutesRemaining <= 30 ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {formatTime(data.minutesRemaining)}
                      </span>
                    </div>
                  )}

                  {/* Speed */}
                  {(data.downloadSpeed || data.uploadSpeed) && (
                    <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <ArrowDown className="w-4 h-4 text-emerald-500" />
                        <span className="text-slate-600">{data.downloadSpeed || 0} Kbps</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <ArrowUp className="w-4 h-4 text-sky-500" />
                        <span className="text-slate-600">{data.uploadSpeed || 0} Kbps</span>
                      </div>
                    </div>
                  )}

                  {/* Expires */}
                  {data.expiresAt && (
                    <InfoRow
                      label={t("expiresAt")}
                      value={new Date(data.expiresAt).toLocaleString(isAr ? "ar" : "en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-xs text-slate-400">Powered by <span className="font-bold text-primary-600">NileLink</span></p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}
