"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocale } from "next-intl";

export default function LocaleTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const prevLocaleRef = useRef(locale);
  const [fading, setFading] = useState(false);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const complete = useCallback(() => {
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    setFading(false);
  }, []);

  useEffect(() => {
    const handleStart = () => {
      setFading(true);
      safetyTimerRef.current = setTimeout(complete, 4000);
    };

    window.addEventListener("locale-switch-start", handleStart);
    return () => {
      window.removeEventListener("locale-switch-start", handleStart);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, [complete]);

  useEffect(() => {
    if (prevLocaleRef.current !== locale) {
      prevLocaleRef.current = locale;
      complete();
    }
  }, [locale, complete]);

  return (
    <div
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 200ms ease-in-out",
      }}
    >
      {children}
    </div>
  );
}
