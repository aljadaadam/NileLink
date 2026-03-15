"use client";

import { Menu } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useSession } from "next-auth/react";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-100 flex items-center justify-between px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ms-2 text-slate-500 hover:text-slate-700"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        {session?.user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700">
                {session.user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700">
              {session.user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
