"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { SessionProvider } from "next-auth/react";

function AdminLoginForm() {
  const locale = useLocale();
  const isAr = locale === "ar";
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
        setError(isAr ? "بيانات الدخول غير صحيحة" : "Invalid credentials");
        setLoading(false);
        return;
      }

      if (otpData.status === "OTP_REQUIRED") {
        sessionStorage.setItem("_nl_login", JSON.stringify({ email, password, redirect: "admin" }));
        setLoading(false);
        router.push(`/${locale}/auth/verify-login`);
        return;
      }

      // Trusted device — sign in directly
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(isAr ? "بيانات الدخول غير صحيحة" : "Invalid credentials");
        setLoading(false);
        return;
      }

      // Verify user is admin
      const checkRes = await fetch("/api/admin/stats");
      if (checkRes.status === 403) {
        setError(isAr ? "ليس لديك صلاحية الدخول" : "Access denied. Admin only.");
        setLoading(false);
        return;
      }

      router.push(`/${locale}/nileadmin-p8x2k`);
    } catch {
      setError(isAr ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-3 py-6 sm:p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMyAxLjM0MyAzIDNzLTEuMzQzIDMtMyAzLTMtMS4zNDMtMy0zIDEuMzQzLTMgMy0zeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 shadow-lg shadow-red-600/30 mb-4">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">NileLink</h1>
          <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-red-600/20 border border-red-500/30">
            <span className="text-xs font-semibold text-red-400 tracking-wider uppercase">
              SUPER ADMIN
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 sm:p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white text-center">
            {isAr ? "تسجيل دخول المشرف" : "Admin Sign In"}
          </h2>
          <p className="text-slate-400 text-sm text-center mt-1">
            {isAr ? "الوصول مقيد للمُشرفين فقط" : "Restricted access — admins only"}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {isAr ? "البريد الإلكتروني" : "Email"}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full ps-10 pe-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 transition-all"
                  placeholder="admin@nilelink.net"
                  dir="ltr"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {isAr ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full ps-10 pe-10 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 transition-all"
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20 hover:shadow-red-600/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isAr ? "جارٍ الدخول..." : "Signing in..."}
                </span>
              ) : (
                isAr ? "دخول" : "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-slate-600">
          NileLink © {new Date().getFullYear()} — {isAr ? "لوحة الإدارة" : "Admin Panel"}
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <SessionProvider>
      <AdminLoginForm />
    </SessionProvider>
  );
}
