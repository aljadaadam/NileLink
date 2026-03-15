"use client";

import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Settings, Shield, Globe, Server } from "lucide-react";

export default function AdminSettingsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isAr ? "إعدادات المنصة" : "Platform Settings"}
        </h1>
        <p className="text-slate-500 mt-1">
          {isAr ? "تكوين إعدادات المنصة العامة" : "Configure global platform settings"}
        </p>
      </div>

      {/* Admin Info */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">
              {isAr ? "معلومات الأدمن" : "Admin Info"}
            </h2>
            <p className="text-sm text-slate-500">
              {isAr ? "الحساب المسجل دخوله حالياً" : "Currently logged in account"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-slate-400 text-xs">{isAr ? "الاسم" : "Name"}</label>
            <p className="font-medium text-slate-900">{session?.user?.name}</p>
          </div>
          <div>
            <label className="text-slate-400 text-xs">{isAr ? "البريد" : "Email"}</label>
            <p className="font-medium text-slate-900" dir="ltr">{session?.user?.email}</p>
          </div>
          <div>
            <label className="text-slate-400 text-xs">{isAr ? "الدور" : "Role"}</label>
            <p className="font-medium text-red-600">ADMIN</p>
          </div>
        </div>
      </div>

      {/* Platform Info */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">
              {isAr ? "معلومات المنصة" : "Platform Info"}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-slate-400 text-xs">{isAr ? "اسم المنصة" : "Platform Name"}</label>
            <p className="font-medium text-slate-900">NileLink</p>
          </div>
          <div>
            <label className="text-slate-400 text-xs">{isAr ? "النطاق" : "Domain"}</label>
            <p className="font-medium text-slate-900" dir="ltr">nilelink.net</p>
          </div>
          <div>
            <label className="text-slate-400 text-xs">{isAr ? "الإصدار" : "Version"}</label>
            <p className="font-medium text-slate-900">1.0.0</p>
          </div>
          <div>
            <label className="text-slate-400 text-xs">{isAr ? "اللغات" : "Languages"}</label>
            <p className="font-medium text-slate-900">{isAr ? "العربية، الإنجليزية" : "Arabic, English"}</p>
          </div>
        </div>
      </div>

      {/* Server Info */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Server className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">
              {isAr ? "معلومات السيرفر" : "Server Info"}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-slate-400 text-xs">{isAr ? "البيئة" : "Environment"}</label>
            <p className="font-medium text-slate-900">Production</p>
          </div>
          <div>
            <label className="text-slate-400 text-xs">{isAr ? "الفريمورك" : "Framework"}</label>
            <p className="font-medium text-slate-900">Next.js 15</p>
          </div>
          <div>
            <label className="text-slate-400 text-xs">{isAr ? "قاعدة البيانات" : "Database"}</label>
            <p className="font-medium text-slate-900">PostgreSQL 14</p>
          </div>
          <div>
            <label className="text-slate-400 text-xs">{isAr ? "الاستضافة" : "Hosting"}</label>
            <p className="font-medium text-slate-900">PM2 + Nginx</p>
          </div>
        </div>
      </div>
    </div>
  );
}
