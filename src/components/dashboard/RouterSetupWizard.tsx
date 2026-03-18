"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Globe,
  Terminal,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  ChevronRight,
  ChevronLeft,
  Rocket,
  X,
  Shield,
  Cpu,
  Info,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SetupWizardProps {
  onComplete: () => void;
  onClose: () => void;
}

const PRIVATE_IP_REGEX = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.|169\.254\.|localhost|::1|fc|fd|fe80)/i;

export default function RouterSetupWizard({ onComplete, onClose }: SetupWizardProps) {
  const t = useTranslations("routers");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [step, setStep] = useState(0);

  // Step 1 state
  const [host, setHost] = useState("");
  const [port, setPort] = useState(8728);
  const [routerName, setRouterName] = useState("");

  // Step 2 state
  const [routerId, setRouterId] = useState<string | null>(null);
  const [script, setScript] = useState("");
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

  // Auto-polling & verification state
  const [pollCount, setPollCount] = useState(0);
  const [verified, setVerified] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{ routerOsVersion?: string; boardName?: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingActive = useRef(false);

  // Auto-poll: try to connect every 5s while on step 2
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
        // Auto-advance to success step
        setStep(2);
        toast.success(t("wizard.connectionSuccess"));
      }
    } catch {
      setPollCount((c) => c + 1);
    } finally {
      pollingActive.current = false;
    }
  }, [routerId, verified, t]);

  useEffect(() => {
    if (step === 1 && script && routerId && !verified) {
      // Start polling every 5 seconds
      pollRef.current = setInterval(pollOnce, 5000);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
    // Clear if step changes
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step, script, routerId, verified, pollOnce]);

  // Auto-navigate to dashboard 3s after success
  useEffect(() => {
    if (step === 2 && verified) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, verified, onComplete]);

  async function handleStep1Next() {
    if (!host.trim() || !routerName.trim()) return;
    if (PRIVATE_IP_REGEX.test(host.trim())) {
      toast.error("Private/internal IP addresses are not allowed");
      return;
    }

    try {
      const res = await fetch("/api/routers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: routerName.trim(),
          host: host.trim(),
          port,
          username: "nilelink_user",
          password: "placeholder_temp",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Failed to create router");
        return;
      }

      const router = await res.json();
      setRouterId(router.id);

      setScriptLoading(true);
      setStep(1);

      const scriptRes = await fetch(`/api/routers/${router.id}/setup-script`);
      if (!scriptRes.ok) {
        toast.error("Failed to generate script");
        return;
      }

      const scriptData = await scriptRes.json();
      setScript(scriptData.script);
      setCredentials(scriptData.credentials);

      await fetch(`/api/routers/${router.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: routerName.trim(),
          host: host.trim(),
          port,
          username: scriptData.credentials.username,
          password: scriptData.credentials.password,
        }),
      });
    } catch {
      toast.error("Failed to create router");
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

  const steps = [
    { icon: Globe, title: t("wizard.step1Title") },
    { icon: Terminal, title: t("wizard.step2Title") },
    { icon: Shield, title: t("wizard.step3Title") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-10 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Stepper Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5 text-white">
          <h2 className="text-lg font-bold mb-1">{t("quickSetup")}</h2>
          <p className="text-sm text-primary-100">{t("quickSetupDesc")}</p>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
                      isActive
                        ? "bg-white text-primary-700 shadow-lg"
                        : isDone
                        ? "bg-primary-500 text-white"
                        : "bg-primary-500/40 text-primary-200"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 rounded-full transition-colors",
                        isDone ? "bg-primary-300" : "bg-primary-500/30"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {/* ──── Step 1: Router Address ──── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {t("wizard.step1Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("wizard.step1Desc")}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("wizard.routerNameLabel")}
                </label>
                <input
                  type="text"
                  value={routerName}
                  onChange={(e) => setRouterName(e.target.value)}
                  placeholder={t("wizard.routerNamePlaceholder")}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t("wizard.hostLabel")}
                  </label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder={t("wizard.hostPlaceholder")}
                    className="input-field"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t("wizard.portLabel")}
                  </label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value) || 8728)}
                    className="input-field"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Cloud DNS Hint */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-blue-800 leading-relaxed">
                    <p className="font-semibold mb-1">{t("wizard.cloudDnsTitle")}</p>
                    <p>{t("wizard.cloudDnsDesc")}</p>
                    <code className="inline-block mt-1 bg-blue-100 px-2 py-0.5 rounded text-[11px] font-mono" dir="ltr">
                      xxxx.sn.mynetname.net
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleStep1Next}
                  disabled={!host.trim() || !routerName.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {tc("next")}
                  {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* ──── Step 2: Setup Script ──── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {t("wizard.step2Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("wizard.step2Desc")}</p>
              </div>

              {scriptLoading ? (
                <div className="flex items-center justify-center py-12 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                  <span className="text-sm text-slate-500">{t("wizard.generatingScript")}</span>
                </div>
              ) : (
                <>
                  <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    {t("wizard.scriptReady")}
                  </div>

                  {/* Script box */}
                  <div className="relative group">
                    <div className="bg-slate-900 rounded-xl p-4 max-h-64 overflow-y-auto">
                      <pre
                        className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed"
                        dir="ltr"
                      >
                        {script}
                      </pre>
                    </div>
                    <button
                      onClick={copyScript}
                      className={cn(
                        "absolute top-3 end-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        scriptCopied
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                      )}
                    >
                      {scriptCopied ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t("wizard.scriptCopied")}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          {t("wizard.copyScript")}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Credentials */}
                  {credentials && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Info className="w-4 h-4 text-amber-600 shrink-0" />
                        <p className="text-sm font-medium text-amber-800">
                          {t("wizard.credentialsNote")}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg px-3 py-2">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("username")}</p>
                          <p className="text-sm font-mono font-medium text-slate-800" dir="ltr">
                            {credentials.username}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg px-3 py-2">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("password")}</p>
                          <p className="text-sm font-mono font-medium text-slate-800 break-all" dir="ltr">
                            {credentials.password}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Auto-polling indicator */}
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
                          <span className="ms-1 text-slate-300">
                            ({t("wizard.attempt")} #{pollCount})
                          </span>
                        )}
                      </p>
                    </div>
                    <Loader2 className="w-4 h-4 animate-spin text-primary-400 shrink-0" />
                  </div>
                </>
              )}

              <div className="flex items-center justify-start pt-2">
                <button
                  onClick={() => setStep(0)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  {tc("back")}
                </button>
              </div>
            </div>
          )}

          {/* ──── Step 3: Connection Success (auto-reached) ──── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex flex-col items-center py-8">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-emerald-700 mb-1">
                  {t("wizard.connectionSuccess")}
                </h3>
                <p className="text-sm text-slate-500">{t("wizard.autoRedirect")}</p>

                {/* Device Info */}
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

              <div className="flex justify-center pt-2">
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
