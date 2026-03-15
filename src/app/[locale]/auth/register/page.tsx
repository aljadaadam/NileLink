"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useState, useEffect, useRef } from "react";
import { Wifi, Mail, Lock, User, Building2, Phone, Eye, EyeOff, ChevronDown, Loader2 } from "lucide-react";

const COUNTRY_CODES = [
  // Arab countries
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
  { code: "+222", country: "MR", flag: "🇲🇷", name: "Mauritania" },
  { code: "+253", country: "DJ", flag: "🇩🇯", name: "Djibouti" },
  { code: "+252", country: "SO", flag: "🇸🇴", name: "Somalia" },
  { code: "+269", country: "KM", flag: "🇰🇲", name: "Comoros" },
  // Europe
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "+351", country: "PT", flag: "🇵🇹", name: "Portugal" },
  { code: "+31", country: "NL", flag: "🇳🇱", name: "Netherlands" },
  { code: "+32", country: "BE", flag: "🇧🇪", name: "Belgium" },
  { code: "+41", country: "CH", flag: "🇨🇭", name: "Switzerland" },
  { code: "+43", country: "AT", flag: "🇦🇹", name: "Austria" },
  { code: "+46", country: "SE", flag: "🇸🇪", name: "Sweden" },
  { code: "+47", country: "NO", flag: "🇳🇴", name: "Norway" },
  { code: "+45", country: "DK", flag: "🇩🇰", name: "Denmark" },
  { code: "+358", country: "FI", flag: "🇫🇮", name: "Finland" },
  { code: "+48", country: "PL", flag: "🇵🇱", name: "Poland" },
  { code: "+30", country: "GR", flag: "🇬🇷", name: "Greece" },
  { code: "+420", country: "CZ", flag: "🇨🇿", name: "Czech Republic" },
  { code: "+36", country: "HU", flag: "🇭🇺", name: "Hungary" },
  { code: "+40", country: "RO", flag: "🇷🇴", name: "Romania" },
  { code: "+380", country: "UA", flag: "🇺🇦", name: "Ukraine" },
  { code: "+353", country: "IE", flag: "🇮🇪", name: "Ireland" },
  { code: "+354", country: "IS", flag: "🇮🇸", name: "Iceland" },
  { code: "+421", country: "SK", flag: "🇸🇰", name: "Slovakia" },
  { code: "+386", country: "SI", flag: "🇸🇮", name: "Slovenia" },
  { code: "+385", country: "HR", flag: "🇭🇷", name: "Croatia" },
  { code: "+381", country: "RS", flag: "🇷🇸", name: "Serbia" },
  { code: "+359", country: "BG", flag: "🇧🇬", name: "Bulgaria" },
  { code: "+370", country: "LT", flag: "🇱🇹", name: "Lithuania" },
  { code: "+371", country: "LV", flag: "🇱🇻", name: "Latvia" },
  { code: "+372", country: "EE", flag: "🇪🇪", name: "Estonia" },
  { code: "+356", country: "MT", flag: "🇲🇹", name: "Malta" },
  { code: "+357", country: "CY", flag: "🇨🇾", name: "Cyprus" },
  { code: "+352", country: "LU", flag: "🇱🇺", name: "Luxembourg" },
  { code: "+355", country: "AL", flag: "🇦🇱", name: "Albania" },
  { code: "+382", country: "ME", flag: "🇲🇪", name: "Montenegro" },
  { code: "+389", country: "MK", flag: "🇲🇰", name: "North Macedonia" },
  { code: "+387", country: "BA", flag: "🇧🇦", name: "Bosnia" },
  { code: "+373", country: "MD", flag: "🇲🇩", name: "Moldova" },
  { code: "+375", country: "BY", flag: "🇧🇾", name: "Belarus" },
  // Turkey & Central Asia
  { code: "+90", country: "TR", flag: "🇹🇷", name: "Turkey" },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "+994", country: "AZ", flag: "🇦🇿", name: "Azerbaijan" },
  { code: "+995", country: "GE", flag: "🇬🇪", name: "Georgia" },
  { code: "+374", country: "AM", flag: "🇦🇲", name: "Armenia" },
  { code: "+998", country: "UZ", flag: "🇺🇿", name: "Uzbekistan" },
  { code: "+993", country: "TM", flag: "🇹🇲", name: "Turkmenistan" },
  { code: "+996", country: "KG", flag: "🇰🇬", name: "Kyrgyzstan" },
  { code: "+992", country: "TJ", flag: "🇹🇯", name: "Tajikistan" },
  // Americas
  { code: "+1", country: "US", flag: "🇺🇸", name: "USA" },
  { code: "+1", country: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "+57", country: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "+51", country: "PE", flag: "🇵🇪", name: "Peru" },
  { code: "+58", country: "VE", flag: "🇻🇪", name: "Venezuela" },
  { code: "+593", country: "EC", flag: "🇪🇨", name: "Ecuador" },
  { code: "+591", country: "BO", flag: "🇧🇴", name: "Bolivia" },
  { code: "+595", country: "PY", flag: "🇵🇾", name: "Paraguay" },
  { code: "+598", country: "UY", flag: "🇺🇾", name: "Uruguay" },
  { code: "+507", country: "PA", flag: "🇵🇦", name: "Panama" },
  { code: "+506", country: "CR", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+502", country: "GT", flag: "🇬🇹", name: "Guatemala" },
  { code: "+53", country: "CU", flag: "🇨🇺", name: "Cuba" },
  { code: "+1809", country: "DO", flag: "🇩🇴", name: "Dominican Republic" },
  { code: "+503", country: "SV", flag: "🇸🇻", name: "El Salvador" },
  { code: "+504", country: "HN", flag: "🇭🇳", name: "Honduras" },
  { code: "+505", country: "NI", flag: "🇳🇮", name: "Nicaragua" },
  { code: "+509", country: "HT", flag: "🇭🇹", name: "Haiti" },
  { code: "+1876", country: "JM", flag: "🇯🇲", name: "Jamaica" },
  { code: "+1868", country: "TT", flag: "🇹🇹", name: "Trinidad & Tobago" },
  // South Asia
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+92", country: "PK", flag: "🇵🇰", name: "Pakistan" },
  { code: "+880", country: "BD", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+94", country: "LK", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+977", country: "NP", flag: "🇳🇵", name: "Nepal" },
  { code: "+93", country: "AF", flag: "🇦🇫", name: "Afghanistan" },
  { code: "+960", country: "MV", flag: "🇲🇻", name: "Maldives" },
  // East & Southeast Asia
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "+63", country: "PH", flag: "🇵🇭", name: "Philippines" },
  { code: "+66", country: "TH", flag: "🇹🇭", name: "Thailand" },
  { code: "+84", country: "VN", flag: "🇻🇳", name: "Vietnam" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "+95", country: "MM", flag: "🇲🇲", name: "Myanmar" },
  { code: "+855", country: "KH", flag: "🇰🇭", name: "Cambodia" },
  { code: "+856", country: "LA", flag: "🇱🇦", name: "Laos" },
  { code: "+886", country: "TW", flag: "🇹🇼", name: "Taiwan" },
  { code: "+852", country: "HK", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+853", country: "MO", flag: "🇲🇴", name: "Macau" },
  { code: "+976", country: "MN", flag: "🇲🇳", name: "Mongolia" },
  { code: "+673", country: "BN", flag: "🇧🇳", name: "Brunei" },
  { code: "+670", country: "TL", flag: "🇹🇱", name: "Timor-Leste" },
  // Iran
  { code: "+98", country: "IR", flag: "🇮🇷", name: "Iran" },
  // Africa
  { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "+254", country: "KE", flag: "🇰🇪", name: "Kenya" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "+233", country: "GH", flag: "🇬🇭", name: "Ghana" },
  { code: "+237", country: "CM", flag: "🇨🇲", name: "Cameroon" },
  { code: "+225", country: "CI", flag: "🇨🇮", name: "Côte d'Ivoire" },
  { code: "+255", country: "TZ", flag: "🇹🇿", name: "Tanzania" },
  { code: "+256", country: "UG", flag: "🇺🇬", name: "Uganda" },
  { code: "+251", country: "ET", flag: "🇪🇹", name: "Ethiopia" },
  { code: "+250", country: "RW", flag: "🇷🇼", name: "Rwanda" },
  { code: "+221", country: "SN", flag: "🇸🇳", name: "Senegal" },
  { code: "+243", country: "CD", flag: "🇨🇩", name: "DR Congo" },
  { code: "+242", country: "CG", flag: "🇨🇬", name: "Congo" },
  { code: "+258", country: "MZ", flag: "🇲🇿", name: "Mozambique" },
  { code: "+263", country: "ZW", flag: "🇿🇼", name: "Zimbabwe" },
  { code: "+260", country: "ZM", flag: "🇿🇲", name: "Zambia" },
  { code: "+244", country: "AO", flag: "🇦🇴", name: "Angola" },
  { code: "+261", country: "MG", flag: "🇲🇬", name: "Madagascar" },
  { code: "+235", country: "TD", flag: "🇹🇩", name: "Chad" },
  { code: "+227", country: "NE", flag: "🇳🇪", name: "Niger" },
  { code: "+223", country: "ML", flag: "🇲🇱", name: "Mali" },
  { code: "+226", country: "BF", flag: "🇧🇫", name: "Burkina Faso" },
  { code: "+228", country: "TG", flag: "🇹🇬", name: "Togo" },
  { code: "+229", country: "BJ", flag: "🇧🇯", name: "Benin" },
  { code: "+224", country: "GN", flag: "🇬🇳", name: "Guinea" },
  { code: "+232", country: "SL", flag: "🇸🇱", name: "Sierra Leone" },
  { code: "+231", country: "LR", flag: "🇱🇷", name: "Liberia" },
  { code: "+241", country: "GA", flag: "🇬🇦", name: "Gabon" },
  { code: "+240", country: "GQ", flag: "🇬🇶", name: "Equatorial Guinea" },
  { code: "+257", country: "BI", flag: "🇧🇮", name: "Burundi" },
  { code: "+291", country: "ER", flag: "🇪🇷", name: "Eritrea" },
  { code: "+264", country: "NA", flag: "🇳🇦", name: "Namibia" },
  { code: "+267", country: "BW", flag: "🇧🇼", name: "Botswana" },
  { code: "+266", country: "LS", flag: "🇱🇸", name: "Lesotho" },
  { code: "+268", country: "SZ", flag: "🇸🇿", name: "Eswatini" },
  { code: "+265", country: "MW", flag: "🇲🇼", name: "Malawi" },
  { code: "+230", country: "MU", flag: "🇲🇺", name: "Mauritius" },
  { code: "+236", country: "CF", flag: "🇨🇫", name: "Central African Republic" },
  { code: "+239", country: "ST", flag: "🇸🇹", name: "São Tomé & Príncipe" },
  { code: "+238", country: "CV", flag: "🇨🇻", name: "Cape Verde" },
  { code: "+220", country: "GM", flag: "🇬🇲", name: "Gambia" },
  { code: "+245", country: "GW", flag: "🇬🇼", name: "Guinea-Bissau" },
  // Oceania
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+64", country: "NZ", flag: "🇳🇿", name: "New Zealand" },
  { code: "+675", country: "PG", flag: "🇵🇬", name: "Papua New Guinea" },
  { code: "+679", country: "FJ", flag: "🇫🇯", name: "Fiji" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

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

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      const email = formData.get("email") as string;
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
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
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => { setShowDropdown(!showDropdown); setSearchQuery(""); }}
                    className="input-field flex items-center gap-1.5 px-3 min-w-[110px] h-full"
                  >
                    <span className="text-lg">{selectedCountry?.flag}</span>
                    <span className="text-sm font-medium text-slate-700">{countryCode}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {showDropdown && (
                    <div className="absolute top-full mt-1 start-0 w-64 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                      <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search..."
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-400"
                          autoFocus
                        />
                      </div>
                      {COUNTRY_CODES.filter((c) =>
                        searchQuery
                          ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.code.includes(searchQuery) ||
                            c.country.toLowerCase().includes(searchQuery.toLowerCase())
                          : true
                      ).map((c) => (
                        <button
                          key={c.country}
                          type="button"
                          onClick={() => {
                            setCountryCode(c.code);
                            setShowDropdown(false);
                            setSearchQuery("");
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
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("submit")}
                </span>
              ) : t("submit")}
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
