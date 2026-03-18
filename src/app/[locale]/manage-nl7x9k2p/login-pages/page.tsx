"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import {
  Loader2,
  Save,
  Eye,
  Upload,
  X,
  Check,
  Palette,
  Type,
  Image as ImageIcon,
  Code,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  LOGIN_TEMPLATES,
  generateTemplateHTML,
} from "@/lib/login-templates";

interface RouterOption {
  id: string;
  name: string;
  loginPageHtml: string | null;
  loginPageCss: string | null;
  loginPageTemplate: string | null;
  loginPageTitle: string | null;
  loginPageLogo: string | null;
}

export default function LoginPagesPage() {
  const t = useTranslations("loginPages");
  const tc = useTranslations("common");

  const [routers, setRouters] = useState<RouterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRouter, setSelectedRouter] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [businessName, setBusinessName] = useState("");
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customHtml, setCustomHtml] = useState("");
  const [customCss, setCustomCss] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    fetch("/api/routers")
      .then((r) => r.json())
      .then((data) => {
        setRouters(data);
        if (data.length > 0) {
          setSelectedRouter(data[0].id);
          loadRouterSettings(data[0]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function loadRouterSettings(router: RouterOption) {
    setSelectedTemplate(router.loginPageTemplate || "modern");
    setBusinessName(router.loginPageTitle || "");
    setLogoBase64(router.loginPageLogo || null);
    setCustomHtml(router.loginPageHtml || "");
    setCustomCss(router.loginPageCss || "");
  }

  function handleRouterChange(id: string) {
    setSelectedRouter(id);
    const router = routers.find((r) => r.id === id);
    if (router) loadRouterSettings(router);
    setShowAdvanced(false);
    setHasUnsavedChanges(false);
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512000) {
      toast.error(t("logoTooLarge"));
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error(t("logoInvalidType"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setLogoBase64(reader.result as string); setHasUnsavedChanges(true); };
    reader.readAsDataURL(file);
  }

  function handlePreview() {
    let fullHtml: string;
    if (showAdvanced && customHtml) {
      fullHtml = customHtml.replace(
        "</head>",
        `<style>${customCss}</style></head>`
      );
    } else {
      const { html, css } = generateTemplateHTML(
        selectedTemplate,
        businessName,
        logoBase64
      );
      fullHtml = html.replace("</head>", `<style>${css}</style></head>`);
    }
    const win = window.open("", "_blank");
    if (win) win.document.write(fullHtml);
  }

  async function handleSave() {
    if (!selectedRouter) return;
    setSaving(true);
    try {
      const { html, css } = showAdvanced
        ? { html: customHtml, css: customCss }
        : generateTemplateHTML(selectedTemplate, businessName, logoBase64);

      const res = await fetch(
        `/api/routers/${selectedRouter}/login-page`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            html,
            css,
            template: selectedTemplate,
            title: businessName,
            logo: logoBase64,
          }),
        }
      );
      if (!res.ok) throw new Error();
      toast.success(t("saved"));
      setHasUnsavedChanges(false);

      // Update local state
      setRouters((prev) =>
        prev.map((r) =>
          r.id === selectedRouter
            ? {
                ...r,
                loginPageHtml: html,
                loginPageCss: css,
                loginPageTemplate: selectedTemplate,
                loginPageTitle: businessName,
                loginPageLogo: logoBase64,
              }
            : r
        )
      );
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("title")}</h1>
            <button onClick={() => setShowHelp(!showHelp)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-600 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-1">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePreview} className="btn-secondary">
            <Eye className="w-4 h-4" />
            {t("preview")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedRouter}
            className="btn-primary"
          >
            <Save className="w-4 h-4" />
            {saving ? tc("loading") : tc("save")}
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-800 rounded-xl p-4 text-sm text-primary-800 dark:text-primary-300 leading-relaxed">
          {t("helpDesc")}
        </div>
      )}

      {routers.length === 0 ? (
        <div className="card bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 py-3 px-4">
          <p className="text-sm text-amber-700 dark:text-amber-300">{t("noRouters")}</p>
        </div>
      ) : (
        <div className="card">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t("router")}
          </label>
          <select
            value={selectedRouter}
            onChange={(e) => handleRouterChange(e.target.value)}
            className="input-field w-full max-w-xs"
          >
            {routers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvanced(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !showAdvanced
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Palette className="w-4 h-4" />
              {t("templates")}
            </button>
            <button
              onClick={() => {
                if (!showAdvanced) {
                  const { html, css } = generateTemplateHTML(
                    selectedTemplate,
                    businessName,
                    logoBase64
                  );
                  setCustomHtml(html);
                  setCustomCss(css);
                }
                setShowAdvanced(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showAdvanced
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Code className="w-4 h-4" />
              {t("advancedEditor")}
            </button>
          </div>

          {!showAdvanced ? (
            <>
              {/* Template Gallery */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t("chooseTemplate")}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {LOGIN_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => { setSelectedTemplate(tmpl.id); setHasUnsavedChanges(true); }}
                      className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedTemplate === tmpl.id
                        ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800 scale-[1.02]"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {/* Template Preview Card */}
                      <div
                        className="h-36 relative flex items-center justify-center"
                        style={{ background: tmpl.colors.bg }}
                      >
                        <div
                          className="w-24 h-20 rounded-lg shadow-lg flex flex-col items-center justify-center gap-1 p-2"
                          style={{ background: tmpl.colors.card }}
                        >
                          <div
                            className="w-6 h-1 rounded"
                            style={{ background: tmpl.colors.accent }}
                          />
                          <div className="w-14 h-2 bg-slate-200 rounded mt-1" />
                          <div
                            className="w-12 h-3 rounded mt-1"
                            style={{ background: tmpl.colors.accent }}
                          />
                        </div>
                        {selectedTemplate === tmpl.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {tmpl.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {tmpl.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Business Name */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    {t("businessName")}
                  </h3>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => { setBusinessName(e.target.value); setHasUnsavedChanges(true); }}
                    placeholder={t("businessNamePlaceholder")}
                    className="input-field w-full"
                    maxLength={100}
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    {t("businessNameHint")}
                  </p>
                </div>

                {/* Logo Upload */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {t("logoUpload")}
                  </h3>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {logoBase64 ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={logoBase64}
                        alt="Logo"
                        className="w-16 h-16 object-contain rounded-lg border border-slate-200"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="btn-secondary text-xs"
                        >
                          <Upload className="w-3 h-3" />
                          {t("changeLogo")}
                        </button>
                        <button
                          onClick={() => setLogoBase64(null)}
                          className="btn-secondary text-xs text-red-500"
                        >
                          <X className="w-3 h-3" />
                          {t("removeLogo")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm text-slate-500 mt-2">
                        {t("uploadLogoHint")}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {t("logoMaxSize")}
                      </p>
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Advanced Code Editor */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  HTML
                </h3>
                <textarea
                  value={customHtml}
                  onChange={(e) => { setCustomHtml(e.target.value); setHasUnsavedChanges(true); }}
                  className="input-field font-mono text-sm h-80 resize-none"
                  dir="ltr"
                />
              </div>
              <div className="card">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  CSS
                </h3>
                <textarea
                  value={customCss}
                  onChange={(e) => { setCustomCss(e.target.value); setHasUnsavedChanges(true); }}
                  className="input-field font-mono text-sm h-80 resize-none"
                  dir="ltr"
                />
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
