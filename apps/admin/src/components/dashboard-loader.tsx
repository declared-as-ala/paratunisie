"use client";

import Image from "next/image";
import { useState } from "react";

interface DashboardLoaderProps {
  label?: string;
  className?: string;
}

export function DashboardLoader({
  label = "Chargement du tableau de bord...",
  className = "",
}: DashboardLoaderProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      role="status"
      aria-label={label}
      className={`flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 transition-all duration-300 ${className}`}
    >
      <div className="relative flex items-center justify-center mb-6">
        {/* Soft Glowing Ring Animation */}
        <div
          className="absolute -inset-4 rounded-full bg-primary/10 blur-xl animate-pulse motion-reduce:animate-none"
          aria-hidden="true"
        />

        {/* Outer Rotating/Pulse Accent Border */}
        <div
          className="absolute -inset-2 rounded-2xl border border-primary/20 bg-primary/5 animate-pulse motion-reduce:animate-none"
          aria-hidden="true"
        />

        {/* Logo Container */}
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-alt border border-border p-3 shadow-md transition-transform motion-reduce:transform-none">
          {!imgError ? (
            <Image
              src="/assets/logo.png"
              alt="ParaTunisie"
              width={64}
              height={64}
              className="object-contain animate-pulse motion-reduce:animate-none"
              onError={() => setImgError(true)}
              priority
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="text-lg font-black tracking-tight text-primary">PT</span>
              <span className="text-[0.625rem] font-bold uppercase tracking-widest text-ink-muted">ParaTunisie</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading Text & Status Dots */}
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
        <span>{label}</span>
        <span className="flex items-center gap-1" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce motion-reduce:animate-none [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce motion-reduce:animate-none [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce motion-reduce:animate-none" />
        </span>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
