"use client";

import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Palette,
  Image,
  Type,
  Eye,
  Save,
  Loader2,
  Upload,
  X,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CardDesign {
  logo: string | null;
  backgroundImage: string | null;
  backgroundColor: string;
  gradientTo: string;
  borderColor: string;
  codeColor: string;
  brandText: string;
  brandColor: string;
  footerText: string;
  footerColor: string;
  showPrice: boolean;
  showPackage: boolean;
  showQr: boolean;
}

const DEFAULT_DESIGN: CardDesign = {
  logo: null,
  backgroundImage: null,
  backgroundColor: "#f0fdfa",
  gradientTo: "#ecfeff",
  borderColor: "#0891b2",
  codeColor: "#0e7490",
  brandText: "NileLink WiFi",
  brandColor: "#64748b",
  footerText: "",
  footerColor: "#94a3b8",
  showPrice: true,
  showPackage: true,
  showQr: true,
};

export default function CardDesignPage() {
  const t = useTranslations("cardDesign");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar" || locale === "fa";
  const [design, setDesign] = useState<CardDesign>(DEFAULT_DESIGN);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings/card-design")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.brandText !== undefined) {
          setDesign({
            logo: data.logo || null,
            backgroundImage: data.backgroundImage || null,
            backgroundColor: data.backgroundColor || "#f0fdfa",
            gradientTo: data.gradientTo || "#ecfeff",
            borderColor: data.borderColor || "#0891b2",
            codeColor: data.codeColor || "#0e7490",
            brandText: data.brandText || "NileLink WiFi",
            brandColor: data.brandColor || "#64748b",
            footerText: data.footerText || "",
            footerColor: data.footerColor || "#94a3b8",
            showPrice: data.showPrice !== false,
            showPackage: data.showPackage !== false,
            showQr: data.showQr !== false,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleImageUpload = useCallback(
    (field: "logo" | "backgroundImage") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid image");
        return;
      }
      if (file.size > 400_000) {
        toast.error("Max 400KB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setDesign((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    },
    []
  );

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/card-design", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(design),
      });
      if (!res.ok) throw new Error();
      toast.success(t("saved"));
    } catch {
      toast.error(tc("error"));
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setDesign(DEFAULT_DESIGN);
  }

  function updateField<K extends keyof CardDesign>(key: K, value: CardDesign[K]) {
    setDesign((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <HelpCircle className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-4 h-4" />
            {t("reset")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition disabled:opacity-50 shadow-lg shadow-primary-500/25"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {tc("save")}
          </button>
        </div>
      </div>

      {/* Help */}
      {showHelp && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-200">
          {t("helpDesc")}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Panel */}
        <div className="space-y-5">
          {/* Brand & Text Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
              <Type className="w-4 h-4 text-primary-500" />
              {t("textSection")}
            </h3>
            <div className="space-y-4">
              {/* Brand Text */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  {t("brandText")}
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={design.brandText}
                  onChange={(e) => updateField("brandText", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
              {/* Footer Text */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  {t("footerText")}
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={design.footerText}
                  onChange={(e) => updateField("footerText", e.target.value)}
                  placeholder={t("footerPlaceholder")}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder:text-slate-400"
                />
              </div>
              {/* Toggles */}
              <div className="flex flex-wrap gap-4">
                {(["showQr", "showPackage", "showPrice"] as const).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={design[key]}
                      onChange={(e) => updateField(key, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {t(key)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
              <Image className="w-4 h-4 text-primary-500" />
              {t("imagesSection")}
            </h3>
            <div className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  {t("logo")}
                </label>
                <div className="flex items-center gap-3">
                  {design.logo ? (
                    <div className="relative w-16 h-16 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white">
                      <img src={design.logo} alt="Logo" className="w-full h-full object-contain" />
                      <button
                        onClick={() => updateField("logo", null)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}
                  <button
                    onClick={() => logoRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm text-slate-500 hover:border-primary-400 hover:text-primary-500 transition"
                  >
                    <Upload className="w-4 h-4" />
                    {t("uploadLogo")}
                  </button>
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload("logo")}
                  />
                </div>
              </div>

              {/* Background Image Upload */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  {t("backgroundImage")}
                </label>
                <div className="flex items-center gap-3">
                  {design.backgroundImage ? (
                    <div className="relative w-20 h-14 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <img src={design.backgroundImage} alt="BG" className="w-full h-full object-cover" />
                      <button
                        onClick={() => updateField("backgroundImage", null)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}
                  <button
                    onClick={() => bgRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm text-slate-500 hover:border-primary-400 hover:text-primary-500 transition"
                  >
                    <Upload className="w-4 h-4" />
                    {t("uploadBg")}
                  </button>
                  <input
                    ref={bgRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload("backgroundImage")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Colors Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
              <Palette className="w-4 h-4 text-primary-500" />
              {t("colorsSection")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {([
                { key: "backgroundColor", label: t("bgColor") },
                { key: "gradientTo", label: t("gradientColor") },
                { key: "borderColor", label: t("borderColor") },
                { key: "codeColor", label: t("codeColor") },
                { key: "brandColor", label: t("brandTextColor") },
                { key: "footerColor", label: t("footerTextColor") },
              ] as const).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    {label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={design[key] as string}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 font-mono">{design[key]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
              <Eye className="w-4 h-4 text-primary-500" />
              {t("preview")}
            </h3>
            <div className="flex justify-center py-4">
              <div
                className="relative w-[340px] h-[210px] rounded-xl overflow-hidden flex items-center gap-3 p-3"
                style={{
                  border: `2px dashed ${design.borderColor}`,
                  background: design.backgroundImage
                    ? `url(${design.backgroundImage}) center/cover`
                    : `linear-gradient(135deg, ${design.backgroundColor} 0%, ${design.gradientTo} 100%)`,
                }}
              >
                {/* Overlay for background image readability */}
                {design.backgroundImage && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-black/40" />
                )}

                {/* QR Side */}
                {design.showQr && (
                  <div className="relative z-[1] flex-shrink-0 flex items-center justify-center">
                    <div
                      className="w-[110px] h-[110px] rounded-lg flex items-center justify-center"
                      style={{
                        background: `repeating-conic-gradient(${design.codeColor} 0% 25%, #fff 0% 50%) 50%/10px 10px`,
                      }}
                    >
                      <div className="w-[90px] h-[90px] bg-white/90 rounded flex items-center justify-center text-xs text-slate-400">
                        QR Code
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Side */}
                <div className="relative z-[1] flex-1 text-center space-y-1.5 min-w-0">
                  {/* Logo */}
                  {design.logo && (
                    <div className="flex justify-center mb-1">
                      <img
                        src={design.logo}
                        alt="Logo"
                        className="max-h-8 max-w-[80px] object-contain"
                      />
                    </div>
                  )}

                  {/* Brand */}
                  <div
                    className="text-[8px] uppercase tracking-[3px] font-bold"
                    style={{ color: design.brandColor }}
                  >
                    {design.brandText || "NileLink WiFi"}
                  </div>

                  {/* Code */}
                  <div
                    className="text-base font-black tracking-[3px] font-mono"
                    style={{ color: design.codeColor }}
                  >
                    A1B2C3D4
                  </div>

                  {/* Package */}
                  {design.showPackage && (
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      Basic Plan
                    </div>
                  )}

                  {/* Price */}
                  {design.showPrice && (
                    <div className="text-[10px] font-semibold text-slate-500">
                      10.00 USD
                    </div>
                  )}

                  {/* Footer */}
                  <div
                    className="text-[7px] tracking-wide mt-1"
                    style={{ color: design.footerColor }}
                  >
                    {design.footerText || "Scan QR or enter code to connect"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
