"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  CheckCircle,
  Loader2,
  Copy,
  Rocket,
  X,
  Cpu,
  Wifi,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SetupWizardProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function RouterSetupWizard({ onComplete, onClose }: SetupWizardProps) {
  const t = useTranslations("routers");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [routerId, setRouterId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [oneliner, setOneliner] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  const [showScript, setShowScript] = useState(false);

  const [pollCount, setPollCount] = useState(0);
  const [verified, setVerified] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{ routerOsVersion?: string; boardName?: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingActive = useRef(false);

  const phase: "generate" | "token" | "success" = verified ? "success" : apiKey ? "token" : "generate";

  // Auto-generate on mount
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pollOnce = useCallback(async () => {
    if (!routerId || pollingActive.current || verified) return;
    pollingActive.current = true;
    try {
      const res = await fetch(`/api/routers/${routerId}/test`, { method: "POST" });
      const data = await res.json();
      setPollCount((c) => c + 1);
      if (data.success) {
        setVerified(true);
        if (data.routerOsVersion || data.boardName) {
          setDeviceInfo({ routerOsVersion: data.routerOsVersion, boardName: data.boardName });
        }
        toast.success(t("wizard.connectionSuccess"));
      }
    } catch {
      setPollCount((c) => c + 1);
    } finally {
      pollingActive.current = false;
    }
  }, [routerId, verified, t]);

  useEffect(() => {
    if (phase === "token" && routerId && !verified) {
      pollRef.current = setInterval(pollOnce, 5000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [phase, routerId, verified, pollOnce]);

  useEffect(() => {
    if (verified) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [verified, onComplete]);

  async function handleGenerate() {
    setLoading(true);
    try {
      const routersRes = await fetch("/api/routers");
      const existingRouters = await routersRes.json();
      const autoName = `Router ${(existingRouters?.length || 0) + 1}`;

      const res = await fetch("/api/routers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: autoName,
          host: "pending",
          port: 8728,
          username: "nilelink_user",
          password: "placeholder_temp",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || t("wizard.createFailed"));
        return;
      }

      const router = await res.json();
      setRouterId(router.id);
      setApiKey(router.apiKey);

      const scriptRes = await fetch(`/api/routers/${router.id}/setup-script`);
      if (!scriptRes.ok) {
        toast.error(t("wizard.createFailed"));
        return;
      }

      const scriptData = await scriptRes.json();
      setOneliner(scriptData.oneliner);

      await fetch(`/api/routers/${router.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: autoName,
          host: "pending",
          port: 8728,
          username: scriptData.credentials.username,
          password: scriptData.credentials.password,
        }),
      });
    } catch {
      toast.error(t("wizard.createFailed"));
    } finally {
      setLoading(false);
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(apiKey);
    setKeyCopied(true);
    toast.success(t("wizard.keyCopied"));
    setTimeout(() => setKeyCopied(false), 3000);
  }

  function copyOneliner() {
    navigator.clipboard.writeText(oneliner);
    setScriptCopied(true);
    toast.success(t("wizard.scriptCopied"));
    setTimeout(() => setScriptCopied(false), 3000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 end-3 z-10 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">

          {/* ──── Loading ──── */}
          {phase === "generate" && (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-3" />
              <p className="text-sm text-slate-500">{t("wizard.generatingScript")}</p>
            </div>
          )}

          {/* ──── Token Display ──── */}
          {phase === "token" && (
            <div className="space-y-5">
              {/* Title */}
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-900">{t("wizard.tokenTitle")}</h2>
                <p className="text-sm text-slate-500 mt-1">{t("wizard.tokenDesc")}</p>
              </div>

              {/* API Key Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <code className="text-lg font-mono font-bold text-primary-700 truncate" dir="ltr">
                    {apiKey}
                  </code>
                  <button
                    onClick={copyKey}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      keyCopied
                        ? "bg-emerald-500 text-white"
                        : "bg-primary-600 text-white hover:bg-primary-700"
                    )}
                  >
                    {keyCopied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {keyCopied ? t("wizard.keyCopied") : t("wizard.copyKey")}
                  </button>
                </div>
              </div>

              {/* Waiting indicator */}
              <div className="flex items-center gap-3 bg-primary-50 rounded-xl px-4 py-3">
                <div className="relative shrink-0">
                  <Wifi className="w-5 h-5 text-primary-400" />
                  <span className="absolute -top-0.5 -end-0.5 w-2 h-2 bg-primary-500 rounded-full animate-ping" />
                  <span className="absolute -top-0.5 -end-0.5 w-2 h-2 bg-primary-500 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-800">{t("wizard.autoCheckTitle")}</p>
                  <p className="text-xs text-primary-500">
                    {t("wizard.autoCheckDesc")}
                    {pollCount > 0 && (
                      <span className="ms-1 opacity-60">#{pollCount}</span>
                    )}
                  </p>
                </div>
                <Loader2 className="w-4 h-4 animate-spin text-primary-400 shrink-0" />
              </div>

              {/* One-liner expandable */}
              <div>
                <button
                  onClick={() => setShowScript(!showScript)}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronDown className={cn("w-3 h-3 transition-transform", showScript && "rotate-180")} />
                  {t("wizard.showScript")}
                </button>
                {showScript && (
                  <div className="mt-2 relative">
                    <div className="bg-slate-900 rounded-lg p-3 max-h-24 overflow-y-auto">
                      <pre className="text-[10px] text-emerald-400 font-mono whitespace-pre-wrap break-all leading-relaxed" dir="ltr">
                        {oneliner}
                      </pre>
                    </div>
                    <button
                      onClick={copyOneliner}
                      className={cn(
                        "absolute top-2 end-2 p-1.5 rounded-md text-xs transition-all",
                        scriptCopied ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"
                      )}
                    >
                      {scriptCopied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Help link */}
              <div className="text-center pt-1">
                <a
                  href={`/${locale}/manage-nl7x9k2p/routers#guide`}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-primary-600 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t("wizard.helpLink")}
                </a>
              </div>
            </div>
          )}

          {/* ──── Success ──── */}
          {phase === "success" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center py-8">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-emerald-700 mb-1">
                  {t("wizard.connectionSuccess")}
                </h3>
                <p className="text-sm text-slate-500">{t("wizard.autoRedirect")}</p>

                {deviceInfo && (deviceInfo.routerOsVersion || deviceInfo.boardName) && (
                  <div className="bg-slate-50 rounded-xl p-4 mt-6 w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Cpu className="w-4 h-4 text-slate-500" />
                      <p className="text-sm font-semibold text-slate-700">{t("wizard.detectedInfo")}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {deviceInfo.routerOsVersion && (
                        <div className="bg-white rounded-lg px-3 py-2 border border-slate-200">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("wizard.routerOs")}</p>
                          <p className="text-sm font-medium text-slate-800" dir="ltr">{deviceInfo.routerOsVersion}</p>
                        </div>
                      )}
                      {deviceInfo.boardName && (
                        <div className="bg-white rounded-lg px-3 py-2 border border-slate-200">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("wizard.boardName")}</p>
                          <p className="text-sm font-medium text-slate-800" dir="ltr">{deviceInfo.boardName}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={onComplete}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-500/25 text-sm"
                >
                  <Rocket className="w-4 h-4" />
                  {t("wizard.goToDashboard")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
