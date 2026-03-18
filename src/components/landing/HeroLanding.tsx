"use client";

import { useEffect, useState, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Wifi,
  Router,
  Ticket,
  Users,
  Layout,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Shield,
  Zap,
  Globe,
  Clock,
  ChevronDown,
  CheckCircle,
  Star,
} from "lucide-react";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import PricingSection from "@/components/landing/PricingSection";

// ─── Intersection Observer Hook ─────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Animated Counter ───────────────────────────────────────
function Counter({ end, suffix = "", locale }: { end: number; suffix?: string; locale: string }) {
  const [val, setVal] = useState(0);
  const { ref, inView } = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(end / 40);
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(id); }
      else setVal(start);
    }, 30);
    return () => clearInterval(id);
  }, [inView, end]);
  return <span ref={ref}>{val.toLocaleString(locale)}{suffix}</span>;
}

export default function HeroLanding() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const features = [
    { key: "router", icon: Router, color: "from-cyan-500 to-blue-600" },
    { key: "voucher", icon: Ticket, color: "from-violet-500 to-purple-600" },
    { key: "users", icon: Users, color: "from-emerald-500 to-teal-600" },
    { key: "customLogin", icon: Layout, color: "from-orange-500 to-red-500" },
    { key: "packages", icon: Wifi, color: "from-pink-500 to-rose-600" },
    { key: "dashboard", icon: BarChart3, color: "from-amber-500 to-yellow-600" },
  ] as const;

  const stats = [
    { value: 99.9, suffix: "%", label: locale === "ar" ? "وقت التشغيل" : "Uptime" },
    { value: 500, suffix: "+", label: locale === "ar" ? "شبكة نشطة" : "Active Networks" },
    { value: 50000, suffix: "+", label: locale === "ar" ? "مستخدم يومي" : "Daily Users" },
    { value: 24, suffix: "/7", label: locale === "ar" ? "دعم مستمر" : "Support" },
  ];

  const howItWorks = [
    { icon: Router, title: locale === "ar" ? "اربط الراوتر" : "Connect Router", desc: locale === "ar" ? "أضف بيانات الاتصال بجهاز MikroTik" : "Add your MikroTik device credentials" },
    { icon: Wifi, title: locale === "ar" ? "أنشئ الباقات" : "Create Packages", desc: locale === "ar" ? "حدد المدة والسرعة والبيانات والسعر" : "Set duration, speed, data, and price" },
    { icon: Ticket, title: locale === "ar" ? "وزّع الأكواد" : "Distribute Codes", desc: locale === "ar" ? "أنشئ أكواد واطبعها لعملائك" : "Generate codes and print for customers" },
    { icon: BarChart3, title: locale === "ar" ? "تابع وأدِر" : "Monitor & Manage", desc: locale === "ar" ? "تابع كل شيء من لوحة التحكم" : "Track everything from your dashboard" },
  ];

  const whyUs = [
    { icon: Shield, title: locale === "ar" ? "أمان عالي" : "Secure", desc: locale === "ar" ? "تشفير كامل واتصال آمن بالراوترات" : "Full encryption and secure router connections" },
    { icon: Zap, title: locale === "ar" ? "سريع وخفيف" : "Lightning Fast", desc: locale === "ar" ? "استجابة فورية وأداء عالي" : "Instant response and high performance" },
    { icon: Globe, title: locale === "ar" ? "من أي مكان" : "Access Anywhere", desc: locale === "ar" ? "أدر شبكاتك من الجوال أو الكمبيوتر" : "Manage from mobile or desktop" },
    { icon: Clock, title: locale === "ar" ? "إعداد سريع" : "Quick Setup", desc: locale === "ar" ? "جاهز في أقل من 5 دقائق" : "Ready in under 5 minutes" },
  ];

  // Floating images/cards for hero
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const s1 = useInView();
  const s2 = useInView();
  const s3 = useInView();
  const s4 = useInView();
  const s5 = useInView();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
      {/* ═══ Navbar ═══ */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">NileLink</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/auth/login" className="btn-secondary text-sm py-2 px-4">
              {t("hero.login")}
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">
              {t("hero.cta")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
          {/* Gradient orbs */}
          <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-primary-300/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 end-1/3 w-80 h-80 bg-violet-300/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 end-1/4 w-64 h-64 bg-cyan-300/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        {/* Floating UI cards */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          {/* Card 1 — Dashboard preview */}
          <div
            className="absolute top-[15%] end-[8%] w-72 opacity-80 animate-float"
            style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)` }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">{locale === "ar" ? "لوحة التحكم" : "Dashboard"}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{locale === "ar" ? "المستخدمون" : "Users"}</span>
                  <span className="text-sm font-bold text-emerald-500">1,247</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{locale === "ar" ? "الإيرادات" : "Revenue"}</span>
                  <span className="text-sm font-bold text-amber-500">$3,842</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 — Router status */}
          <div
            className="absolute top-[55%] end-[5%] w-56 opacity-70 animate-float-delayed"
            style={{ transform: `translate(${mousePos.x * -0.2}px, ${mousePos.y * -0.2}px)` }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-3 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Router className="w-4 h-4 text-cyan-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Router-01</span>
                <span className="ms-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1">
                <div className="flex justify-between"><span>IP</span><span className="text-slate-600 dark:text-slate-300" dir="ltr">192.168.88.1</span></div>
                <div className="flex justify-between"><span>{locale === "ar" ? "متصل" : "Online"}</span><span className="text-emerald-500">✓</span></div>
              </div>
            </div>
          </div>

          {/* Card 3 — Voucher */}
          <div
            className="absolute top-[25%] start-[5%] w-48 opacity-70 animate-float-slow"
            style={{ transform: `translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)` }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-3 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-violet-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">{locale === "ar" ? "كود جديد" : "New Code"}</span>
              </div>
              <div className="font-mono text-lg text-center text-slate-800 dark:text-slate-200 tracking-widest py-1">XK7M-9PLQ</div>
              <div className="text-[10px] text-center text-slate-400 dark:text-slate-500">{locale === "ar" ? "ساعتين • 5 ميجا" : "2 hours • 5 Mbps"}</div>
            </div>
          </div>

          {/* Card 4 — Connection line */}
          <div
            className="absolute bottom-[25%] start-[8%] w-52 opacity-60 animate-float-delayed"
            style={{ transform: `translate(${mousePos.x * -0.25}px, ${mousePos.y * -0.25}px)` }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-3 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-pink-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">{locale === "ar" ? "مستخدمون متصلون" : "Connected Users"}</span>
              </div>
              <div className="flex gap-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-violet-400 flex items-center justify-center text-[8px] text-white font-bold">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 rounded-full px-4 py-1.5 text-sm text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-700 mb-8 animate-fade-in">
              <Zap className="w-4 h-4" />
              {locale === "ar" ? "منصة إدارة شبكات الواي فاي الأولى" : "The #1 WiFi Network Management Platform"}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight animate-fade-in-up">
              {t("hero.title")}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-white/70 leading-relaxed max-w-2xl mx-auto animate-fade-in-up-delay">
              {t("hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay2">
              <Link
                href="/auth/register"
                className="btn-primary text-base py-3 px-8 group"
              >
                {t("hero.cta")}
                <Arrow className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="btn-secondary text-base py-3 px-8"
              >
                {t("hero.login")}
              </Link>
            </div>

            {/* Scroll indicator */}
            <div className="mt-16 animate-bounce">
              <ChevronDown className="w-6 h-6 text-slate-300 mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Stats Bar ═══ */}
      <section ref={s1.ref} className="relative -mt-16 z-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-700 ${s1.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-cyan-500 bg-clip-text text-transparent">
                  <Counter end={s.value} suffix={s.suffix} locale={locale} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section ref={s2.ref} className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-700 ${s2.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="inline-block text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full px-4 py-1 mb-4">
              {locale === "ar" ? "المميزات" : "Features"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              {t("features.title")}
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ key, icon: Icon, color }, i) => (
              <div
                key={key}
                className={`group relative p-6 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-transparent bg-white dark:bg-slate-800 hover:bg-gradient-to-br hover:${color} transition-all duration-500 hover:shadow-xl hover:-translate-y-1 cursor-default ${s2.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: s2.inView ? `${i * 100}ms` : "0ms" }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="mt-2 text-slate-500 dark:text-white/70 group-hover:text-white/80 leading-relaxed transition-colors">
                  {t(`features.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section ref={s3.ref} className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-700 ${s3.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="inline-block text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full px-4 py-1 mb-4">
              {locale === "ar" ? "كيف يعمل" : "How It Works"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              {locale === "ar" ? "4 خطوات بسيطة للبدء" : "4 Simple Steps to Get Started"}
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-16 start-[12%] end-[12%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />
            {howItWorks.map((step, i) => (
              <div
                key={i}
                className={`relative text-center transition-all duration-700 ${s3.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{ transitionDelay: s3.inView ? `${i * 150}ms` : "0ms" }}
              >
                <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-primary-500/20 mb-6">
                  <step.icon className="w-9 h-9 text-white" />
                  <span className="absolute -top-2 -end-2 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-white/70">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Why NileLink ═══ */}
      <section ref={s4.ref} className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div className={`transition-all duration-700 ${s4.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
              <span className="inline-block text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full px-4 py-1 mb-4">
                {locale === "ar" ? "لماذا NileLink؟" : "Why NileLink?"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                {locale === "ar" ? "كل ما تحتاجه في منصة واحدة" : "Everything You Need in One Platform"}
              </h2>
              <p className="mt-4 text-slate-500 dark:text-white/70 leading-relaxed">
                {locale === "ar"
                  ? "NileLink يوفر لك أدوات إدارة شبكات الواي فاي الأكثر تقدماً. تحكم كامل من أي مكان، بأمان عالي وسرعة فائقة."
                  : "NileLink provides the most advanced WiFi network management tools. Full control from anywhere, with high security and blazing speed."}
              </p>
              <div className="mt-8 space-y-4">
                {whyUs.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 transition-all duration-500 ${s4.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
                    style={{ transitionDelay: s4.inView ? `${300 + i * 150}ms` : "0ms" }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-white/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual mockup */}
            <div className={`transition-all duration-700 delay-300 ${s4.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}>
              <div className="relative">
                {/* Main card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ms-2 text-xs text-slate-500">NileLink Dashboard</span>
                  </div>
                  {/* Fake dashboard */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: locale === "ar" ? "الراوترات" : "Routers", val: "5", color: "text-cyan-400" },
                      { label: locale === "ar" ? "المستخدمون" : "Users", val: "342", color: "text-emerald-400" },
                      { label: locale === "ar" ? "الأكواد" : "Codes", val: "1.2K", color: "text-violet-400" },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-800/80 rounded-xl p-3 text-center">
                        <div className={`text-xl font-bold ${item.color}`}>{item.val}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Fake chart */}
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-end gap-1.5 h-24 justify-between">
                      {[40, 65, 45, 80, 55, 90, 70, 60, 85, 50, 75, 95].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-primary-500 to-cyan-400 rounded-t-sm opacity-60 hover:opacity-100 transition-opacity"
                          style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[9px] text-slate-600">
                      <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -end-4 bg-emerald-500 text-white text-xs font-bold rounded-full px-3 py-1.5 shadow-lg shadow-emerald-500/30 animate-bounce-slow">
                  <CheckCircle className="w-3.5 h-3.5 inline me-1" />
                  {locale === "ar" ? "متصل" : "Online"}
                </div>

                {/* Floating notification */}
                <div className="absolute -bottom-4 -start-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-3 border border-gray-100 dark:border-slate-700 animate-float-slow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <Ticket className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">{locale === "ar" ? "كود جديد مُفعّل" : "New code activated"}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{locale === "ar" ? "قبل ثانية" : "Just now"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Testimonials / Trust ═══ */}
      <section ref={s5.ref} className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-700 ${s5.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="inline-block text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full px-4 py-1 mb-4">
              {locale === "ar" ? "ثقة العملاء" : "Trusted By"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              {locale === "ar" ? "ماذا يقول عملاؤنا" : "What Our Customers Say"}
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: locale === "ar" ? "أحمد محمد" : "Ahmed M.", role: locale === "ar" ? "مالك كافيه" : "Café Owner", text: locale === "ar" ? "NileLink غيّر طريقة إدارتي للشبكة بالكامل. أسهل منصة استخدمتها." : "NileLink completely changed how I manage my network. Easiest platform I've used." },
              { name: locale === "ar" ? "سارة علي" : "Sara A.", role: locale === "ar" ? "مديرة فندق" : "Hotel Manager", text: locale === "ar" ? "الأكواد والباقات سهّلت علينا توفير الواي فاي للنزلاء بشكل احترافي." : "Codes and packages made it easy to provide WiFi to guests professionally." },
              { name: locale === "ar" ? "خالد إبراهيم" : "Khalid I.", role: locale === "ar" ? "مزود إنترنت" : "ISP Provider", text: locale === "ar" ? "أدير أكثر من 20 راوتر من مكان واحد. توفير وقت وجهد كبير." : "I manage over 20 routers from one place. Saves a lot of time and effort." },
            ].map((review, i) => (
              <div
                key={i}
                className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all duration-500 ${s5.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: s5.inView ? `${i * 150}ms` : "0ms" }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-600 dark:text-white/70 leading-relaxed mb-4">&quot;{review.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{review.name}</div>
                    <div className="text-xs text-slate-400">{review.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <PricingSection />

      {/* ═══ CTA ═══ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {locale === "ar" ? "ابدأ بإدارة شبكاتك الآن" : "Start Managing Your Networks Today"}
          </h2>
          <p className="mt-4 text-primary-100 text-lg">
            {locale === "ar"
              ? "انضم لمنصة NileLink وتحكم بشبكات الواي فاي من أي مكان"
              : "Join NileLink and control your WiFi networks from anywhere"}
          </p>
          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center gap-2 bg-white text-primary-700 font-semibold py-3 px-8 rounded-xl hover:bg-primary-50 transition-colors"
          >
            {t("hero.cta")}
            <Arrow className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
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
