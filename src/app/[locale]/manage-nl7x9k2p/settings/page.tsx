"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          company: formData.get("company") || undefined,
          phone: formData.get("phone") || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("saved"));
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingPassword(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.get("currentPassword"),
          newPassword: formData.get("newPassword"),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed");
        return;
      }
      toast.success(t("saved"));
      e.currentTarget.reset();
    } catch {
      toast.error("Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <button onClick={() => setShowHelp(!showHelp)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      {showHelp && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-primary-800 leading-relaxed">
          {t("helpDesc")}
        </div>
      )}

      {/* Profile */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {t("profile")}
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("name")}
            </label>
            <input
              name="name"
              defaultValue={session?.user?.name || ""}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("email")}
            </label>
            <input
              value={session?.user?.email || ""}
              disabled
              className="input-field bg-gray-50 text-slate-400"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("company")}
            </label>
            <input name="company" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("phone")}
            </label>
            <input name="phone" type="tel" className="input-field" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("language")}
            </label>
            <LanguageSwitcher />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" />
            {saving ? tc("loading") : tc("save")}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {t("changePassword")}
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("currentPassword")}
            </label>
            <input
              name="currentPassword"
              type="password"
              required
              className="input-field"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("newPassword")}
            </label>
            <input
              name="newPassword"
              type="password"
              required
              minLength={6}
              className="input-field"
              dir="ltr"
            />
          </div>
          <button type="submit" disabled={savingPassword} className="btn-primary">
            <Save className="w-4 h-4" />
            {savingPassword ? tc("loading") : t("changePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}
