"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useState, useEffect, useRef } from "react";
import { Wifi, Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { signIn } from "next-auth/react";

function VerifyLoginContent() {
  const t = useTranslations("auth.verifyLogin");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirectTarget, setRedirectTarget] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("_nl_login");
    if (stored) {
      try {
        const { email: e, password: p, redirect: r } = JSON.parse(stored);
        setEmail(e || "");
        setPassword(p || "");
        setRedirectTarget(r || "");
      } catch { /* ignore */ }
    }
  }, []);

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
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
      const digits = pasted.split("");
      setCode(digits);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  }

  async function handleVerify(fullCode?: string) {
    const codeStr = fullCode || code.join("");
    if (codeStr.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      // Step 1: Verify the OTP
      const res = await fetch("/api/auth/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeStr }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(t("invalidCode"));
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      // Step 2: Sign in with NextAuth
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("loginFailed"));
        setLoading(false);
        return;
      }

      setSuccess(true);
      sessionStorage.removeItem("_nl_login");
      const dest = redirectTarget === "admin" ? "/nileadmin-p8x2k" : "/manage-nl7x9k2p";
      setTimeout(() => router.push(dest), 1500);
    } catch {
      setError(t("invalidCode"));
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await fetch("/api/auth/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      setCooldown(60);
    } catch {
      // ignore
    } finally {
      setResending(false);
    }
  }

  if (!email || !password) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-slate-50 to-accent-50 flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <p className="text-slate-500">{t("noData")}</p>
          <Link href="/auth/login" className="btn-primary mt-4 inline-block">
            {t("goLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-slate-50 to-accent-50 flex items-center justify-center px-3 py-6 sm:p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">NileLink</span>
          </Link>
        </div>

        <div className="card !p-4 sm:!p-6 text-center">
          {success ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{t("successTitle")}</h1>
              <p className="mt-2 text-slate-500">{t("successMessage")}</p>
              <div className="mt-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary-500 mx-auto" />
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
              <p className="mt-2 text-slate-500">{t("subtitle")}</p>
              <p className="mt-1 text-sm font-medium text-primary-600" dir="ltr">
                {maskEmail(email)}
              </p>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="mt-6 flex justify-center gap-2" dir="ltr" onPaste={handlePaste}>
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
                    disabled={loading}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all disabled:opacity-50"
                  />
                ))}
              </div>

              <button
                onClick={() => handleVerify()}
                disabled={loading || code.join("").length !== 6}
                className="btn-primary w-full mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("verifying")}
                  </span>
                ) : t("verify")}
              </button>

              <button
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 disabled:text-slate-400 disabled:cursor-not-allowed mx-auto"
              >
                <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
                {cooldown > 0 ? t("resendCooldown", { seconds: cooldown }) : t("resend")}
              </button>

              <p className="mt-4 text-xs text-slate-400">{t("trustNote")}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}${"*".repeat(Math.min(local.length - 2, 6))}@${domain}`;
}

export default function VerifyLoginPage() {
  return <VerifyLoginContent />;
}
