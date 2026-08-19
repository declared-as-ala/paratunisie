"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductGallery({ image, alt }: { image: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(image || "/assets/product-tube.webp");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setImgSrc(image || "/assets/product-tube.webp");
  }, [image]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="group relative flex aspect-square w-full max-h-[320px] sm:max-h-[420px] lg:max-h-[560px] items-center justify-center overflow-hidden rounded-2xl bg-white p-4 sm:p-6 border border-border/80 shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none cursor-zoom-in"
        aria-label={`Agrandir l'image : ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={alt}
          className="max-h-full max-w-full object-contain transition-transform duration-[var(--duration-large)] ease-[var(--ease-out-standard)] group-hover:scale-105"
          onError={() => setImgSrc("/assets/product-tube.webp")}
        />
        <span className="absolute end-3 bottom-3 sm:end-4 sm:bottom-4 flex size-9 sm:size-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs text-ink shadow-sm border border-border/60">
          <ZoomIn className="size-4 sm:size-5" aria-hidden />
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={alt}
        className="m-auto max-h-[90dvh] max-w-[90dvw] rounded-2xl bg-white p-6 backdrop:bg-ink/60 backdrop:backdrop-blur-[2px] open:animate-in open:fade-in open:zoom-in-95 border border-border shadow-2xl"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="relative flex aspect-square w-[min(90dvw,640px)] max-w-full items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            onError={() => setImgSrc("/assets/product-tube.webp")}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon-lg"
          aria-label="Fermer l'aperçu"
          onClick={() => dialogRef.current?.close()}
          className="absolute end-4 top-4 rounded-full"
        >
          <X />
        </Button>
      </dialog>
    </div>
  );
}
