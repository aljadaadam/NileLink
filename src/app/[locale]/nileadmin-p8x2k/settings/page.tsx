"use client";

import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Shield } from "lucide-react";

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
    </div>
  );
}
