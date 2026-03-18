"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Terminal,
  CheckCircle,
  Loader2,
  Copy,
  Rocket,
  X,
  Cpu,
  Wifi,
  HelpCircle,
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

  // Script state
  const [routerId, setRouterId] = useState<string | null>(null);
  const [script, setScript] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

  // Auto-polling & verification
  const [pollCount, setPollCount] = useState(0);
  const [verified, setVerified] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{ routerOsVersion?: string; boardName?: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingActive = useRef(false);

  const phase: "input" | "script" | "success" = verified ? "success" : script ? "script" : "input";

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
    if (phase === "script" && routerId && !verified) {
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
    setScriptLoading(true);
    try {
      // Auto-name
      const routersRes = await fetch("/api/routers");
      const existingRouters = await routersRes.json();
      const autoName = `Router ${(existingRouters?.length || 0) + 1}`;

      // Create router with pending host — phonehome will auto-detect it
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

      // Generate setup script
      const scriptRes = await fetch(`/api/routers/${router.id}/setup-script`);
      if (!scriptRes.ok) {
        toast.error(t("wizard.createFailed"));
        return;
      }

      const scriptData = await scriptRes.json();
      setScript(scriptData.script);

      // Update with real credentials
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
      setScriptLoading(false);
    }
  }

  function copyScript() {
    navigator.clipboard.writeText(script);
    setScriptCopied(true);
    toast.success(t("wizard.scriptCopied"));
    setTimeout(() => setScriptCopied(false), 3000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-10 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-6">

          {/* ──── Phase: Input (zero fields — just a big button) ──── */}
          {phase === "input" && (
            <div className="flex flex-col items-center text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
                <Terminal className="w-8 h-8 text-primary-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {t("wizard.step1Title")}
                </h2>
                <p className="text-sm text-slate-500">{t("wizard.step1Desc")}</p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={scriptLoading}
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/20 text-lg"
              >
                {scriptLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("wizard.generatingScript")}
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    {t("wizard.generateBtn")}
                  </>
                )}
              </button>

              {/* Tiny tooltip for Cloud DNS */}
              <div className="group relative inline-flex items-center gap-1.5 text-xs text-slate-400 cursor-help">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{t("wizard.cloudDnsTip")}</span>
                <div className="absolute bottom-full start-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-10 leading-relaxed">
                  {t("wizard.cloudDnsTooltip")}
                  <code className="block mt-1 text-emerald-400 text-[10px]" dir="ltr">xxxx.sn.mynetname.net</code>
                  <div className="absolute top-full start-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                </div>
              </div>
            </div>
          )}

          {/* ──── Phase: Script ──── */}
          {phase === "script" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {t("wizard.step2Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("wizard.scriptInstruction")}</p>
              </div>

              <button
                onClick={copyScript}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-base transition-all",
                  scriptCopied
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/25"
                )}
              >
                {scriptCopied ? (
                  <><CheckCircle className="w-5 h-5" />{t("wizard.scriptCopied")}</>
                ) : (
                  <><Copy className="w-5 h-5" />{t("wizard.copyScript")}</>
                )}
              </button>

              <div className="bg-slate-900 rounded-xl p-4 max-h-48 overflow-y-auto">
                <pre className="text-[11px] text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed" dir="ltr">
                  {script}
                </pre>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                <div className="relative shrink-0">
                  <Wifi className="w-5 h-5 text-primary-400" />
                  <span className="absolute -top-0.5 -end-0.5 w-2 h-2 bg-primary-500 rounded-full animate-ping" />
                  <span className="absolute -top-0.5 -end-0.5 w-2 h-2 bg-primary-500 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{t("wizard.autoCheckTitle")}</p>
                  <p className="text-xs text-slate-400">
                    {t("wizard.autoCheckDesc")}
                    {pollCount > 0 && (
                      <span className="ms-1 text-slate-300">({t("wizard.attempt")} #{pollCount})</span>
                    )}
                  </p>
                </div>
                <Loader2 className="w-4 h-4 animate-spin text-primary-400 shrink-0" />
              </div>
            </div>
          )}

          {/* ──── Phase: Success ──── */}
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
