import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, RTL_LOCALES, type Locale } from "@/i18n/routing";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";

const SITE_URL = "https://nilelink.net";

const LOCALE_META: Record<string, { title: string; description: string; ogLocale: string }> = {
  en: {
    title: "NileLink — MikroTik Hotspot Management Platform",
    description: "The easiest MikroTik hotspot management platform. Generate WiFi vouchers, manage users & packages, and control routers from one dashboard. Full reseller system with one-click setup.",
    ogLocale: "en_US",
  },
  ar: {
    title: "NileLink — منصة إدارة هوت سبوت مايكروتك",
    description: "أسهل ربط للمايكروتيك. أنشئ أكواد واي فاي، أدِر المستخدمين والباقات، وتحكم بالراوترات من لوحة تحكم واحدة. نظام وكلاء متكامل وإعداد تلقائي بضغطة واحدة.",
    ogLocale: "ar_EG",
  },
  tr: {
    title: "NileLink — MikroTik Hotspot Yönetim Platformu",
    description: "En kolay MikroTik hotspot yönetim platformu. WiFi kodları oluşturun, kullanıcıları ve paketleri yönetin, router'ları tek bir panelden kontrol edin.",
    ogLocale: "tr_TR",
  },
  fr: {
    title: "NileLink — Plateforme de Gestion Hotspot MikroTik",
    description: "La plateforme de gestion hotspot MikroTik la plus simple. Générez des codes WiFi, gérez utilisateurs et forfaits, contrôlez les routeurs depuis un seul tableau de bord.",
    ogLocale: "fr_FR",
  },
  es: {
    title: "NileLink — Plataforma de Gestión Hotspot MikroTik",
    description: "La plataforma de gestión hotspot MikroTik más fácil. Genere códigos WiFi, gestione usuarios y paquetes, controle routers desde un solo panel.",
    ogLocale: "es_ES",
  },
  fa: {
    title: "NileLink — پلتفرم مدیریت هات‌اسپات میکروتیک",
    description: "ساده‌ترین پلتفرم مدیریت هات‌اسپات میکروتیک. کدهای WiFi تولید کنید، کاربران و بسته‌ها را مدیریت و روترها را از یک داشبورد کنترل کنید.",
    ogLocale: "fa_IR",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const meta = LOCALE_META[locale] || LOCALE_META.en;
  const { title, description } = meta;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: meta.ogLocale,
      alternateLocale: Object.values(LOCALE_META)
        .map((m) => m.ogLocale)
        .filter((l) => l !== meta.ogLocale),
      url: `${SITE_URL}/${locale}`,
      siteName: "NileLink",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${SITE_URL}/${loc}`])
      ),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = RTL_LOCALES.includes(locale as Locale) ? "rtl" : "ltr";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NileLink",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: (LOCALE_META[locale] || LOCALE_META.en).description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free trial available",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "500",
    },
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NileLink",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@nilelink.net",
      contactType: "customer service",
    },
  };

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');function apply(){var t=localStorage.getItem('theme');if(t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches)){d.classList.add('dark')}else{d.classList.remove('dark')}}apply();window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',function(){var t=localStorage.getItem('theme');if(!t||t==='system'){apply()}});window.__setTheme=function(v){localStorage.setItem('theme',v);apply()}}catch(e){}})();`,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cairo:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="canonical" href={`${SITE_URL}/${locale}`} />
        {routing.locales.map((loc) => (
          <link key={loc} rel="alternate" hrefLang={loc} href={`${SITE_URL}/${loc}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster
            position={dir === "rtl" ? "top-left" : "top-right"}
            richColors
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
