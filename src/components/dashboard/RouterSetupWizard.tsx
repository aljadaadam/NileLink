"use client";

import { useState } from "react";
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

  // Step 3 state
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<{ routerOsVersion?: string; boardName?: string } | null>(null);

  async function handleStep1Next() {
    if (!host.trim() || !routerName.trim()) return;
    if (PRIVATE_IP_REGEX.test(host.trim())) {
      toast.error("Private/internal IP addresses are not allowed");
      return;
    }

    // Create the router first
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

      // Now fetch the setup script
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

      // Update router with the actual credentials from script
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

  async function handleVerify() {
    if (!routerId) return;
    setVerifying(true);
    setVerified(null);
    setDeviceInfo(null);

    try {
      const res = await fetch(`/api/routers/${routerId}/test`, { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setVerified(true);
        if (data.routerOsVersion || data.boardName) {
          setDeviceInfo({
            routerOsVersion: data.routerOsVersion,
            boardName: data.boardName,
          });
        }
      } else {
        setVerified(false);
      }
    } catch {
      setVerified(false);
    } finally {
      setVerifying(false);
    }
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
                </>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep(0)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  {tc("back")}
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!script}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {tc("next")}
                  {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* ──── Step 3: Verify Connection ──── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {t("wizard.step3Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("wizard.step3Desc")}</p>
              </div>

              <div className="flex flex-col items-center py-6">
                {verified === null && !verifying && (
                  <button
                    onClick={handleVerify}
                    className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 text-base"
                  >
                    <Shield className="w-5 h-5" />
                    {t("wizard.verifyConnection")}
                  </button>
                )}

                {verifying && (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-[3px] border-primary-100" />
                      <div className="absolute inset-0 w-16 h-16 rounded-full border-[3px] border-primary-500 border-t-transparent animate-spin" />
                    </div>
                    <p className="text-sm text-slate-500 animate-pulse">{t("wizard.verifying")}</p>
                  </div>
                )}

                {verified === true && (
                  <div className="w-full space-y-4">
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                      </div>
                      <p className="text-lg font-bold text-emerald-700">{t("wizard.connectionSuccess")}</p>
                    </div>

                    {/* Device Info */}
                    {deviceInfo && (deviceInfo.routerOsVersion || deviceInfo.boardName) && (
                      <div className="bg-slate-50 rounded-xl p-4">
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
                )}

                {verified === false && (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-sm font-medium text-red-700 text-center max-w-xs">
                      {t("wizard.connectionFailed")}
                    </p>
                    <button
                      onClick={handleVerify}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm mt-2"
                    >
                      {t("wizard.retry")}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  {tc("back")}
                </button>
                <button
                  onClick={onComplete}
                  disabled={!verified}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25 text-sm"
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
