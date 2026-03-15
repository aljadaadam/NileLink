"use client";

import { useState, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
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
          setSubActive(data.isActive === true);
          setSubChecked(true);
        })
        .catch(() => setSubChecked(true));
    }
  }, [status]);

  if (status === "loading" || (status === "authenticated" && !subChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  if (!subActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-slate-50 to-accent-50 p-4">
        <div className="max-w-md text-center bg-white rounded-2xl shadow-lg p-8">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Trial Expired</h2>
          <p className="text-slate-500 mb-6">Your free trial has ended. Please contact support to activate your subscription.</p>
          <button
            onClick={() => router.push("/")}
            className="btn-primary px-6"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
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
          </div>
        </div>
      </AuthGuard>
    </SessionProvider>
  );
}
