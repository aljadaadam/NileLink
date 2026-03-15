import { NextResponse } from "next/server";
import { headers } from "next/headers";

const CURRENCY_MAP: Record<string, { code: string; symbol: string; rate: number }> = {
  // Middle East & North Africa
  SA: { code: "SAR", symbol: "ر.س", rate: 3.75 },
  AE: { code: "AED", symbol: "د.إ", rate: 3.67 },
  EG: { code: "EGP", symbol: "ج.م", rate: 50.0 },
  IQ: { code: "IQD", symbol: "د.ع", rate: 1310 },
  JO: { code: "JOD", symbol: "د.أ", rate: 0.71 },
  KW: { code: "KWD", symbol: "د.ك", rate: 0.31 },
  BH: { code: "BHD", symbol: "د.ب", rate: 0.38 },
  OM: { code: "OMR", symbol: "ر.ع", rate: 0.38 },
  QA: { code: "QAR", symbol: "ر.ق", rate: 3.64 },
  LB: { code: "LBP", symbol: "ل.ل", rate: 89500 },
  SY: { code: "SYP", symbol: "ل.س", rate: 13000 },
  YE: { code: "YER", symbol: "ر.ي", rate: 250 },
  LY: { code: "LYD", symbol: "د.ل", rate: 4.85 },
  TN: { code: "TND", symbol: "د.ت", rate: 3.12 },
  DZ: { code: "DZD", symbol: "د.ج", rate: 135 },
  MA: { code: "MAD", symbol: "د.م", rate: 10.0 },
  SD: { code: "SDG", symbol: "ج.س", rate: 601 },
  PS: { code: "ILS", symbol: "₪", rate: 3.6 },
  // Turkey
  TR: { code: "TRY", symbol: "₺", rate: 38.5 },
  // Europe
  GB: { code: "GBP", symbol: "£", rate: 0.79 },
  DE: { code: "EUR", symbol: "€", rate: 0.92 },
  FR: { code: "EUR", symbol: "€", rate: 0.92 },
  IT: { code: "EUR", symbol: "€", rate: 0.92 },
  ES: { code: "EUR", symbol: "€", rate: 0.92 },
  NL: { code: "EUR", symbol: "€", rate: 0.92 },
  // Asia
  IN: { code: "INR", symbol: "₹", rate: 83.5 },
  PK: { code: "PKR", symbol: "Rs", rate: 278 },
  MY: { code: "MYR", symbol: "RM", rate: 4.47 },
  ID: { code: "IDR", symbol: "Rp", rate: 15700 },
  // Africa
  NG: { code: "NGN", symbol: "₦", rate: 1550 },
  KE: { code: "KES", symbol: "KSh", rate: 153 },
  ZA: { code: "ZAR", symbol: "R", rate: 18.5 },
};

const DEFAULT_CURRENCY = { code: "USD", symbol: "$", rate: 1 };

export async function GET() {
  const hdrs = await headers();
  
  // Try common geo headers set by proxies/CDNs
  const country =
    hdrs.get("cf-ipcountry") ||
    hdrs.get("x-vercel-ip-country") ||
    hdrs.get("x-country-code") ||
    hdrs.get("geoip-country-code") ||
    null;

  const currency = country ? CURRENCY_MAP[country.toUpperCase()] || DEFAULT_CURRENCY : DEFAULT_CURRENCY;

  return NextResponse.json({
    country: country?.toUpperCase() || "US",
    currency,
  });
}
