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
  const [progress, setProgress] = useState(0);
  const [showBar, setShowBar] = useState(false);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const complete = useCallback(() => {
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    setProgress(100);
    setFading(false);
    setTimeout(() => {
      setShowBar(false);
      setProgress(0);
    }, 400);
  }, []);

  useEffect(() => {
    const handleStart = () => {
      setFading(true);
      setShowBar(true);
      setProgress(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setProgress(30));
      });
      slowTimerRef.current = setTimeout(() => setProgress(60), 800);
      safetyTimerRef.current = setTimeout(complete, 4000);
    };

    window.addEventListener("locale-switch-start", handleStart);
    return () => {
      window.removeEventListener("locale-switch-start", handleStart);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
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
    <>
      {showBar && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 rounded-r-full"
            style={{
              width: `${progress}%`,
              transition:
                progress === 100
                  ? "width 200ms ease-out"
                  : progress <= 30
                    ? "width 300ms ease-out"
                    : "width 8s ease-out",
              boxShadow:
                "0 0 10px rgba(59,130,246,0.5), 0 0 5px rgba(59,130,246,0.3)",
            }}
          />
        </div>
      )}

      <div
        style={{
          opacity: fading ? 0 : 1,
          transition: "opacity 200ms ease-in-out",
        }}
      >
        {children}
      </div>
    </>
  );
}
