"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Wifi, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Step 1: Check credentials + device trust
      const otpRes = await fetch("/api/auth/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok) {
        if (otpData.error === "EMAIL_NOT_VERIFIED") {
          setLoading(false);
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        setError(t("error"));
        setLoading(false);
        return;
      }

      if (otpData.status === "OTP_REQUIRED") {
        // New device — store credentials temporarily, redirect to OTP verification
        sessionStorage.setItem("_nl_login", JSON.stringify({ email, password }));
        setLoading(false);
        router.push("/auth/verify-login");
        return;
      }

      // Trusted device — sign in directly
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("error"));
        setLoading(false);
      } else {
        router.push("/manage-nl7x9k2p");
      }
    } catch {
      setError(t("error"));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-slate-50 to-accent-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-3 py-6 sm:p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">NileLink</span>
          </Link>
        </div>

        {/* Card */}
        <div className="card !p-4 sm:!p-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{t("subtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t("email")}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  required
                  className="input-field ps-10"
                  placeholder="admin@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="input-field ps-10 pe-10"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("submit")}
                </span>
              ) : t("submit")}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("noAccount")}{" "}
            <Link
              href="/auth/register"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {t("register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
