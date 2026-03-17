"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useState, useRef, useEffect } from "react";
import { Wifi, Mail, Lock, Eye, EyeOff, Loader2, KeyRound, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";

type Step = "email" | "code" | "success";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgot");
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Step 1: Submit email
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("error"));
        return;
      }

      setStep("code");
      setCooldown(60);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  // Resend code
  async function handleResend() {
    if (cooldown > 0) return;
    setResending(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setCooldown(60);
    } catch {
      // ignore
    } finally {
      setResending(false);
    }
  }

  // OTP input handlers
  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  }

  // Step 2: Submit code + new password
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    const codeStr = code.join("");
    if (codeStr.length !== 6) return;

    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (newPassword.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: codeStr,
          newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error === "Invalid or expired code" ? t("invalidCode") : (data.error || t("error")));
        return;
      }

      setStep("success");
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-slate-50 to-accent-50 flex items-center justify-center px-3 py-6 sm:p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">NileLink</span>
          </Link>
        </div>

        <div className="card !p-4 sm:!p-6">
          {step === "success" ? (
            /* ─── Success ─── */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{t("successTitle")}</h2>
              <p className="text-slate-500 mt-2 text-sm">{t("successMessage")}</p>
            </div>
          ) : step === "email" ? (
            /* ─── Step 1: Enter Email ─── */
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{t("title")}</h1>
                  <p className="text-sm text-slate-500">{t("subtitle")}</p>
                </div>
              </div>

              <form onSubmit={handleSendCode} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t("email")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field ps-10"
                      placeholder="admin@example.com"
                      dir="ltr"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("sending")}
                    </span>
                  ) : t("sendCode")}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  {t("backToLogin")}
                </Link>
              </p>
            </>
          ) : (
            /* ─── Step 2: Enter Code + New Password ─── */
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{t("resetTitle")}</h1>
                  <p className="text-sm text-slate-500">{t("resetSubtitle")}</p>
                </div>
              </div>

              <form onSubmit={handleReset} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
                )}

                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("codeLabel")}
                  </label>
                  <div className="flex gap-2 justify-center" dir="ltr">
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={i === 0 ? handlePaste : undefined}
                        className="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors"
                      />
                    ))}
                  </div>
                  {/* Resend */}
                  <div className="text-center mt-3">
                    {cooldown > 0 ? (
                      <span className="text-xs text-slate-400">{t("resendCooldown", { seconds: cooldown })}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                        {t("resend")}
                      </button>
                    )}
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t("newPassword")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field ps-10 pe-10"
                      placeholder="••••••••"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t("confirmPassword")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field ps-10"
                      placeholder="••••••••"
                      dir="ltr"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || code.join("").length !== 6}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("resetting")}
                    </span>
                  ) : t("resetPassword")}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  {t("backToLogin")}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
