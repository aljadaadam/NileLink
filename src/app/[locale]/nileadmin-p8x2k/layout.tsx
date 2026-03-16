"use client";

import { useState, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/layout/Header";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname.includes("/nileadmin-p8x2k/login");

  useEffect(() => {
    if (isLoginPage) return;
    if (status === "unauthenticated") {
      router.push(pathname.replace(/\/nileadmin-p8x2k.*/, "/nileadmin-p8x2k/login"));
    } else if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.push("/manage-nl7x9k2p");
    }
  }, [status, session, router, isLoginPage, pathname]);

  if (isLoginPage) return <>{children}</>;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if ((session?.user as any)?.role !== "ADMIN") return null;

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname.includes("/nileadmin-p8x2k/login");

  if (isLoginPage) {
    return (
      <SessionProvider>
        <AdminGuard>{children}</AdminGuard>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <AdminGuard>
        <div className="min-h-screen flex">
          <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col min-w-0">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50/50">
              {children}
            </main>
          </div>
        </div>
      </AdminGuard>
    </SessionProvider>
  );
}
