"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { Wifi, Mail, Lock, User, Building2, Phone, Eye, EyeOff, ChevronDown } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+249", country: "SD", flag: "🇸🇩", name: "Sudan" },
  { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "+20", country: "EG", flag: "🇪🇬", name: "Egypt" },
  { code: "+964", country: "IQ", flag: "🇮🇶", name: "Iraq" },
  { code: "+962", country: "JO", flag: "🇯🇴", name: "Jordan" },
  { code: "+965", country: "KW", flag: "🇰🇼", name: "Kuwait" },
  { code: "+973", country: "BH", flag: "🇧🇭", name: "Bahrain" },
  { code: "+968", country: "OM", flag: "🇴🇲", name: "Oman" },
  { code: "+974", country: "QA", flag: "🇶🇦", name: "Qatar" },
  { code: "+961", country: "LB", flag: "🇱🇧", name: "Lebanon" },
  { code: "+963", country: "SY", flag: "🇸🇾", name: "Syria" },
  { code: "+967", country: "YE", flag: "🇾🇪", name: "Yemen" },
  { code: "+218", country: "LY", flag: "🇱🇾", name: "Libya" },
  { code: "+216", country: "TN", flag: "🇹🇳", name: "Tunisia" },
  { code: "+213", country: "DZ", flag: "🇩🇿", name: "Algeria" },
  { code: "+212", country: "MA", flag: "🇲🇦", name: "Morocco" },
  { code: "+970", country: "PS", flag: "🇵🇸", name: "Palestine" },
  { code: "+90", country: "TR", flag: "🇹🇷", name: "Turkey" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "UK" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "USA" },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+92", country: "PK", flag: "🇵🇰", name: "Pakistan" },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "+254", country: "KE", flag: "🇰🇪", name: "Kenya" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
];

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+249");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch("/api/geo")
      .then((r) => r.json())
      .then((data) => {
        if (data.country) {
          const match = COUNTRY_CODES.find((c) => c.country === data.country);
          if (match) setCountryCode(match.code);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      setLoading(false);
      return;
    }

    const phoneNumber = formData.get("phone") as string;
    const fullPhone = phoneNumber ? `${countryCode}${phoneNumber}` : undefined;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password,
          company: formData.get("company") || undefined,
          phone: fullPhone,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      router.push("/auth/login");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-slate-50 to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">NileLink</span>
          </Link>
        </div>

        {/* Card */}
        <div className="card">
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="mt-1 text-slate-500">{t("subtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("name")}
              </label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="name"
                  type="text"
                  required
                  className="input-field ps-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("email")}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  required
                  className="input-field ps-10"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="input-field ps-10 pe-10"
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("confirmPassword")}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="input-field ps-10 pe-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("company")}
              </label>
              <div className="relative">
                <Building2 className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input name="company" type="text" className="input-field ps-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("phone")}
              </label>
              <div className="flex gap-2" dir="ltr">
                {/* Country Code Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="input-field flex items-center gap-1.5 px-3 min-w-[110px] h-full"
                  >
                    <span className="text-lg">{selectedCountry?.flag}</span>
                    <span className="text-sm font-medium text-slate-700">{countryCode}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {showDropdown && (
                    <div className="absolute top-full mt-1 start-0 w-64 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                      {COUNTRY_CODES.map((c) => (
                        <button
                          key={c.country}
                          type="button"
                          onClick={() => {
                            setCountryCode(c.code);
                            setShowDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors ${
                            c.code === countryCode ? "bg-primary-50 text-primary-700" : "text-slate-700"
                          }`}
                        >
                          <span className="text-lg">{c.flag}</span>
                          <span className="font-medium">{c.name}</span>
                          <span className="ms-auto text-slate-400">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Phone Number */}
                <input
                  name="phone"
                  type="tel"
                  required
                  className="input-field flex-1"
                  placeholder="123456789"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? t("submit") + "..." : t("submit")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t("hasAccount")}{" "}
            <Link
              href="/auth/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {t("login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
