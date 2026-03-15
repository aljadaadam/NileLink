"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FileCode, Loader2, Save, RotateCcw, Eye } from "lucide-react";
import { toast } from "sonner";

interface RouterOption {
  id: string;
  name: string;
  loginPageHtml: string | null;
  loginPageCss: string | null;
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WiFi Login</title>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>WiFi Hotspot</h1>
      <p>Enter your voucher code to connect</p>
    </div>
    <form method="post" action="$(link-login-only)">
      <input type="hidden" name="dst" value="$(link-orig)" />
      <input type="text" name="username" placeholder="Voucher Code" required />
      <input type="hidden" name="password" value="" />
      <button type="submit">Connect</button>
    </form>
    <p class="footer">Powered by NileLink</p>
  </div>
</body>
</html>`;

const DEFAULT_CSS = `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: system-ui, sans-serif;
  background: linear-gradient(135deg, #0891b2, #0e7490);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.container {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
}
.logo h1 { color: #0e7490; font-size: 24px; }
.logo p { color: #64748b; margin-top: 8px; font-size: 14px; }
form { margin-top: 24px; }
input[type="text"] {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  text-align: center;
  letter-spacing: 2px;
  outline: none;
  transition: border-color 0.2s;
}
input[type="text"]:focus { border-color: #0891b2; }
button {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  background: #0891b2;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover { background: #0e7490; }
.footer { margin-top: 24px; color: #94a3b8; font-size: 12px; }`;

export default function LoginPagesPage() {
  const t = useTranslations("loginPages");
  const tc = useTranslations("common");
  const [routers, setRouters] = useState<RouterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRouter, setSelectedRouter] = useState<string>("");
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/routers")
      .then((r) => r.json())
      .then((data) => {
        setRouters(data);
        if (data.length > 0) {
          setSelectedRouter(data[0].id);
          setHtml(data[0].loginPageHtml || DEFAULT_HTML);
          setCss(data[0].loginPageCss || DEFAULT_CSS);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function handleRouterChange(id: string) {
    setSelectedRouter(id);
    const router = routers.find((r) => r.id === id);
    if (router) {
      setHtml(router.loginPageHtml || DEFAULT_HTML);
      setCss(router.loginPageCss || DEFAULT_CSS);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/routers/${selectedRouter}/login-page`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, css }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("saved"));
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setHtml(DEFAULT_HTML);
    setCss(DEFAULT_CSS);
  }

  function handlePreview() {
    const fullHtml = html.replace("</head>", `<style>${css}</style></head>`);
    const win = window.open("", "_blank");
    if (win) win.document.write(fullHtml);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("description")}</p>
        </div>
      </div>

      {routers.length === 0 ? (
        <div className="card text-center py-16">
          <FileCode className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="mt-4 text-slate-500">Add a router first to customize login pages.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Router Select */}
          <div className="card">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("router")}
                </label>
                <select
                  value={selectedRouter}
                  onChange={(e) => handleRouterChange(e.target.value)}
                  className="input-field w-64"
                >
                  {routers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePreview} className="btn-secondary">
                  <Eye className="w-4 h-4" />
                  {t("preview")}
                </button>
                <button onClick={handleReset} className="btn-secondary">
                  <RotateCcw className="w-4 h-4" />
                  {t("reset")}
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                  <Save className="w-4 h-4" />
                  {saving ? tc("loading") : tc("save")}
                </button>
              </div>
            </div>
          </div>

          {/* Editors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">HTML</h3>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="input-field font-mono text-sm h-80 resize-none"
                dir="ltr"
              />
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">CSS</h3>
              <textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                className="input-field font-mono text-sm h-80 resize-none"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
