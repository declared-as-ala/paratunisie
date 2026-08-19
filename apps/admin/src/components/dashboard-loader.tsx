"use client";

import Image from "next/image";
import { useState } from "react";

interface DashboardLoaderProps {
  label?: string;
  sublabel?: string;
  className?: string;
}

export function DashboardLoader({
  label = "Chargement de votre espace",
  sublabel = "Préparation des données du tableau de bord",
  className = "",
}: DashboardLoaderProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative flex min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center py-16 px-4 select-none ${className}`}
    >
      {/* Background Soft Subtle Radial Glow */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="h-[420px] w-[420px] rounded-full blur-3xl opacity-60"
          style={{
            background: "radial-gradient(circle at center, rgba(123, 47, 82, 0.07) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Clean Logo Display (140-160px width, clean without thick square box) */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Subtle Soft Burgundy Glow behind logo */}
          <div
            className="absolute h-20 w-44 rounded-full bg-primary/10 blur-2xl animate-pulse motion-reduce:animate-none"
            aria-hidden="true"
          />

          {!imgError ? (
            <div className="relative h-12 w-36 sm:h-14 sm:w-44 transition-all duration-300">
              <Image
                src="/assets/logo.png"
                alt="ParaTunisie"
                fill
                sizes="(max-width: 640px) 144px, 176px"
                className="object-contain"
                onError={() => setImgError(true)}
                priority
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-xs font-black tracking-tight text-white shadow-sm">
                PT
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-bold tracking-tight text-ink">ParaTunisie</span>
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.2em] text-accent">Admin</span>
              </div>
            </div>
          )}
        </div>

        {/* Refined Thin Indeterminate Loading Line (192px width, 3px height) */}
        <div className="mb-5 h-[3px] w-48 sm:w-56 overflow-hidden rounded-full bg-border/40 p-0 relative">
          <div
            className="absolute inset-y-0 w-1/2 rounded-full bg-primary animate-dashboard-shimmer motion-reduce:animate-none"
          />
        </div>

        {/* Typography Hierarchy */}
        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-ink">
          {label}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm font-medium text-ink-muted">
          {sublabel}
        </p>
      </div>

      <span className="sr-only">{label}. {sublabel}</span>
    </div>
  );
}
