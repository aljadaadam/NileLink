"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Router,
  Package,
  Ticket,
  Users,
  FileCode,
  Settings,
  CreditCard,
  LogOut,
  Wifi,
  X,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "dashboard", href: "/manage-nl7x9k2p", icon: LayoutDashboard },
  { key: "routers", href: "/manage-nl7x9k2p/routers", icon: Router },
  { key: "packages", href: "/manage-nl7x9k2p/packages", icon: Package },
  { key: "vouchers", href: "/manage-nl7x9k2p/vouchers", icon: Ticket },
  { key: "users", href: "/manage-nl7x9k2p/users", icon: Users },
  { key: "loginPages", href: "/manage-nl7x9k2p/login-pages", icon: FileCode },
  { key: "billing", href: "/manage-nl7x9k2p/billing", icon: CreditCard },
  { key: "settings", href: "/manage-nl7x9k2p/settings", icon: Settings },
] as const;

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-e border-gray-100 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          open
            ? "translate-x-0"
            : locale === "ar"
            ? "translate-x-full"
            : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-slate-800">
          <Link
            href="/manage-nl7x9k2p"
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">NileLink</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map(({ key, href, icon: Icon }) => {
              const isActive =
                pathname === href ||
                (href !== "/manage-nl7x9k2p" && pathname.startsWith(href));
              return (
                <li key={key}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        isActive ? "text-primary-600" : "text-slate-400"
                      )}
                    />
                    {t(key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Language + Logout */}
        <div className="p-3 border-t border-gray-100 dark:border-slate-700 space-y-1">
          <div className="px-3 py-2">
            <LanguageSwitcher />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 text-slate-400" />
            {t("logout")}
          </button>
        </div>
      </aside>
    </>
  );
}
