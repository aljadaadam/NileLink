import { Link } from "@/i18n/navigation";
import {
  Wifi,
  Router,
  Ticket,
  Users,
  Layout,
  BarChart3,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import PricingSection from "@/components/landing/PricingSection";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const features = [
    { key: "router", icon: Router },
    { key: "voucher", icon: Ticket },
    { key: "users", icon: Users },
    { key: "customLogin", icon: Layout },
    { key: "packages", icon: Wifi },
    { key: "dashboard", icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              {t("hero.title")}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="btn-primary text-base py-3 px-8"
              >
                {t("hero.cta")}
                <Arrow className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/login"
                className="btn-secondary text-base py-3 px-8"
              >
                {t("hero.login")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 dark:text-white">
            {t("features.title")}
          </h2>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="group p-6 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-primary-200 
                  hover:shadow-lg hover:shadow-primary-100/50 dark:hover:shadow-primary-900/20 transition-all duration-300
                  dark:bg-slate-800/50"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 group-hover:bg-primary-100 
                  flex items-center justify-center transition-colors">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t(`features.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {locale === "ar"
              ? "ابدأ بإدارة شبكاتك الآن"
              : "Start Managing Your Networks Today"}
          </h2>
          <p className="mt-4 text-primary-100 text-lg">
            {locale === "ar"
              ? "انضم لمنصة NileLink وتحكم بشبكات الواي فاي من أي مكان"
              : "Join NileLink and control your WiFi networks from anywhere"}
          </p>
          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center gap-2 bg-white text-primary-700 
              font-semibold py-3 px-8 rounded-xl hover:bg-primary-50 transition-colors"
          >
            {t("hero.cta")}
            <Arrow className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">NileLink</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} NileLink. {t("footer.rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}
