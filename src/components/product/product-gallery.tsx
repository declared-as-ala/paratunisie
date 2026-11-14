"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, X } from "lucide-react";

import Image from "next/image";

export function ProductGallery({ image, alt, badge }: { image: string; alt: string; badge?: string }) {
  const [imgSrc, setImgSrc] = useState(image || "/assets/product-unavailable.svg");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setImgSrc(image || "/assets/product-unavailable.svg");
  }, [image]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="group relative block aspect-square w-full overflow-hidden rounded-3xl bg-white ring-1 ring-border-strong/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-zoom-in"
        aria-label={`Agrandir l'image : ${alt}`}
      >
        <Image
          src={imgSrc}
          alt={alt}
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 620px"
          className="object-contain p-6 sm:p-10 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          onError={() => setImgSrc("/assets/product-unavailable.svg")}
        />
        <span className="absolute end-4 bottom-4 z-10 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-foreground shadow-sm ring-1 ring-border-strong/60">
          <ZoomIn className="size-4" aria-hidden />
          Agrandir
        </span>
      </button>
      {badge && (
        <span className="pointer-events-none absolute start-4 top-4 z-10 rounded-full bg-primary px-3 py-1.5 text-xs font-extrabold text-white shadow-sm">
          {badge}
        </span>
      )}

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
            onError={() => setImgSrc("/assets/product-unavailable.svg")}
          />
        </div>
        <button
          type="button"
          aria-label="Fermer l'aperçu"
          onClick={() => dialogRef.current?.close()}
          className="absolute end-4 top-4 flex size-11 items-center justify-center rounded-full bg-muted text-foreground hover:bg-primary-soft"
        >
          <X className="size-5" aria-hidden />
        </button>
      </dialog>
    </div>
  );
}
