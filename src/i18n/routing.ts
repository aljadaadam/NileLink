import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar", "tr", "fr", "es", "fa"] as const;
export type Locale = (typeof locales)[number];

export const RTL_LOCALES: Locale[] = ["ar", "fa"];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  tr: "Türkçe",
  fr: "Français",
  es: "Español",
  fa: "فارسی",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  ar: "🇸🇦",
  tr: "🇹🇷",
  fr: "🇫🇷",
  es: "🇪🇸",
  fa: "🇮🇷",
};

// Map country codes to locale
export const COUNTRY_LOCALE_MAP: Record<string, Locale> = {
  // Arabic
  SA: "ar", AE: "ar", EG: "ar", IQ: "ar", JO: "ar", KW: "ar",
  BH: "ar", OM: "ar", QA: "ar", LB: "ar", SY: "ar", YE: "ar",
  LY: "ar", TN: "ar", DZ: "ar", MA: "ar", SD: "ar", PS: "ar",
  // Turkish
  TR: "tr",
  // French
  FR: "fr", SN: "fr", CI: "fr", CM: "fr", CD: "fr", MG: "fr",
  ML: "fr", BF: "fr", NE: "fr", TD: "fr", GN: "fr", RW: "fr",
  BE: "fr", CH: "fr", CA: "fr", HT: "fr",
  // Spanish
  ES: "es", MX: "es", CO: "es", AR: "es", PE: "es", VE: "es",
  CL: "es", EC: "es", GT: "es", CU: "es", BO: "es", DO: "es",
  HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es",
  UY: "es",
  // Persian
  IR: "fa", AF: "fa", TJ: "fa",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localeDetection: true,
  localePrefix: "always",
});
