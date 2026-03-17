import type { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "USER" | "ADMIN";
    };
  }
}

export interface StatsData {
  totalRouters: number;
  onlineRouters: number;
  activeUsers: number;
  totalVouchers: number;
  usedVouchers: number;
  revenueByCurrency: { currency: string; amount: number }[];
  peakHours: { hour: number; sessions: number }[];
  dailyUsage: { day: string; count: number }[];
  unusedVouchers: number;
  avgVouchersPerDay: number;
  daysUntilEmpty: number | null;
}

export interface RouterFormData {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface PackageFormData {
  name: string;
  nameAr?: string;
  duration?: number;
  dataLimit?: number;
  uploadSpeed?: number;
  downloadSpeed?: number;
  price: number;
  currency: string;
}

export interface VoucherGenerateData {
  packageId: string;
  count: number;
  expiresAt?: string;
}

export interface HotspotUserFormData {
  username: string;
  password: string;
  routerId: string;
  packageName?: string;
  expiresAt?: string;
}
