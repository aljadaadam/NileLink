"use client";

import { useState, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, CreditCard } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import OnboardingTour from "@/components/dashboard/OnboardingTour";
import AIChatbot from "@/components/dashboard/AIChatbot";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("dashboard");
  const [subChecked, setSubChecked] = useState(false);
  const [subActive, setSubActive] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/subscription")
        .then((r) => r.json())
        .then((data) => {
          if (data.planChosen === false) {
            router.push("/choose-plan");
            return;
          }
          setSubActive(data.isActive === true);
          setSubChecked(true);
        })
        .catch(() => setSubChecked(true));
    }
  }, [status, router]);

  if (status === "loading" || (status === "authenticated" && !subChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const isBillingPage = pathname?.includes("/billing");

  return (
    <>
      {!subActive && (
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{t("trialExpiredBanner")}</p>
            </div>
            {!isBillingPage && (
              <button
                onClick={() => router.push(pathname?.replace(/\/manage-nl7x9k2p.*/, "/manage-nl7x9k2p/billing") || "/manage-nl7x9k2p/billing")}
                className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                {t("goToBilling")}
              </button>
            )}
          </div>
        </div>
      )}
      {children}
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SessionProvider>
      <AuthGuard>
        <div className="min-h-screen flex">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col min-w-0">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
            <OnboardingTour />
            <AIChatbot />
          </div>
        </div>
      </AuthGuard>
    </SessionProvider>
  );
}
