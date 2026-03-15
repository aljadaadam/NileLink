import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: "primary" | "accent" | "emerald" | "red";
}

const colorMap = {
  primary: {
    bg: "bg-primary-50",
    icon: "text-primary-600",
  },
  accent: {
    bg: "bg-accent-50",
    icon: "text-accent-600",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
  },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <div className="stat-card">
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          colors.bg
        )}
      >
        <Icon className={cn("w-6 h-6", colors.icon)} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {trend && (
          <p className="text-xs text-emerald-600 font-medium mt-0.5">
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
