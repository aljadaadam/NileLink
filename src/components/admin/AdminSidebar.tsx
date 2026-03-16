"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  X,
  Handshake,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "dashboard", label: "Dashboard", labelAr: "لوحة التحكم", href: "/nileadmin-p8x2k", icon: LayoutDashboard },
  { key: "users", label: "Users", labelAr: "المستخدمين", href: "/nileadmin-p8x2k/users", icon: Users },
  { key: "subscriptions", label: "Subscriptions", labelAr: "الاشتراكات", href: "/nileadmin-p8x2k/subscriptions", icon: CreditCard },
  { key: "partnership", label: "Partnership", labelAr: "الشراكة", href: "/nileadmin-p8x2k/partnership", icon: Handshake },
  { key: "settings", label: "Settings", labelAr: "الإعدادات", href: "/nileadmin-p8x2k/settings", icon: Settings },
] as const;

export default function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 z-50 h-screen w-64 bg-slate-900 border-e border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          open
            ? "translate-x-0"
            : isAr
            ? "translate-x-full"
            : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm">NileLink</span>
              <span className="block text-[10px] text-red-400 font-medium -mt-0.5">SUPER ADMIN</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.key === "dashboard"
                ? pathname === `/${locale}/nileadmin-p8x2k` || pathname === "/nileadmin-p8x2k"
                : pathname.startsWith(`/${locale}${item.href}`) || pathname.startsWith(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-600/20 text-red-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {isAr ? item.labelAr : item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800">
          <Link
            href="/manage-nl7x9k2p"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-1"
          >
            <LayoutDashboard className="w-5 h-5" />
            {isAr ? "لوحة المستخدم" : "User Panel"}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-600/20 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {isAr ? "تسجيل الخروج" : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
