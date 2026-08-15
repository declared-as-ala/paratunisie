"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const DESKTOP_QUERY = "(min-width: 768px)";
const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

/**
 * Full-bleed hero background with cinematic video + floating product overlays.
 * Video is only mounted when viewport is desktop AND user hasn't requested
 * reduced motion — keeps mobile and reduced-motion users from fetching video bytes.
 */
export function HeroVisual() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia(DESKTOP_QUERY);
    const motionQuery = window.matchMedia(MOTION_QUERY);

    const update = () => setShowVideo(desktopQuery.matches && motionQuery.matches);
    update();

    desktopQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    return () => {
      desktopQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      {/* Base poster image */}
      <Image
        src="/assets/hero-cinematic-poster.webp"
        alt="Composition élégante de soins de beauté ParaTunisie : sérum, crème et soins premium dans une lumière chaleureuse"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Cinematic video layer */}
      {showVideo && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        >
          <source src="/assets/hero-cinematic.webm" type="video/webm" />
          <source src="/assets/hero-cinematic.mp4" type="video/mp4" />
        </video>
      )}

      {/* Gradient overlays for text readability + depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(43,35,38,0.65) 0%, rgba(43,35,38,0.2) 40%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(to top, rgba(43,35,38,0.4) 0%, transparent 30%)",
        }}
        aria-hidden="true"
      />

      {/* Floating decorative elements — premium depth */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Soft radial glow */}
        <div
          className="absolute -right-20 top-1/4 h-[500px] w-[500px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(200,164,107,0.4) 0%, transparent 70%)",
            animation: "heroFloat 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -left-10 bottom-1/3 h-[300px] w-[300px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(139,59,98,0.5) 0%, transparent 70%)",
            animation: "heroFloat 10s ease-in-out infinite reverse",
          }}
        />
        {/* Refined floating particles */}
        <div
          className="absolute left-[15%] top-[20%] size-1.5 rounded-full bg-brand-champagne/40"
          style={{ animation: "heroParticle 6s ease-in-out infinite" }}
        />
        <div
          className="absolute left-[70%] top-[30%] size-1 rounded-full bg-brand-blush/50"
          style={{ animation: "heroParticle 8s ease-in-out infinite 1s" }}
        />
        <div
          className="absolute left-[45%] top-[60%] size-1 rounded-full bg-brand-champagne/30"
          style={{ animation: "heroParticle 7s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute left-[80%] top-[65%] size-1.5 rounded-full bg-brand-dusty-rose/30"
          style={{ animation: "heroParticle 9s ease-in-out infinite 0.5s" }}
        />
      </div>
    </div>
  );
}
