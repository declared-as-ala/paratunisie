"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { resolveMediaUrl } from "@/lib/api-client";

interface MediaUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  altText?: string;
  onAltTextChange?: (alt: string) => void;
  aspectRatio?: "square" | "banner" | "wide";
  hint?: string;
  accept?: string;
  maxSizeMb?: number;
}

export function MediaUploader({
  label,
  value,
  onChange,
  altText = "",
  onAltTextChange,
  aspectRatio = "square",
  hint = "PNG, JPG, WebP jusqu'à 5MB",
  accept = "image/png, image/jpeg, image/webp, image/svg+xml",
  maxSizeMb = 5,
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`Le fichier dépasse la taille maximale autorisée (${maxSizeMb} MB)`);
        return;
      }

      setError(null);
      setUploading(true);

      // Simulate object URL / MinIO upload
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        onChange(resultUrl);
        setUploading(false);
      };
      reader.onerror = () => {
        setError("Erreur lors de la lecture du fichier");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    },
    [maxSizeMb, onChange]
  );

  const handleRemove = useCallback(() => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  const aspectClasses = {
    square: "h-32 w-32",
    banner: "h-32 w-full",
    wide: "h-40 w-full",
  }[aspectRatio];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        {value && (
          <span className="inline-flex items-center gap-1 text-[0.625rem] font-bold text-emerald-600">
            <CheckCircle2 size={12} /> Image active
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={accept}
        className="hidden"
      />

      {value ? (
        <div className="space-y-2">
          <div
            className={`relative rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs group flex items-center justify-center ${aspectClasses}`}
          >
            <Image src={resolveMediaUrl(value)} alt={altText || label} fill unoptimized className="object-contain p-1" />
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition-colors text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <RefreshCw size={14} /> Changer
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <X size={14} /> Supprimer
              </button>
            </div>
          </div>

          {onAltTextChange && (
            <div>
              <input
                type="text"
                value={altText}
                onChange={(e) => onAltTextChange(e.target.value)}
                placeholder="Texte alternatif (Alt description image)..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
              />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed border-slate-200 hover:border-[#E11D48] bg-slate-50/50 hover:bg-rose-50/30 transition-all cursor-pointer flex flex-col items-center justify-center p-4 text-center ${aspectClasses}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw size={20} className="animate-spin text-[#E11D48]" />
              <span className="text-xs font-bold text-slate-600">Téléversement...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-9 w-9 rounded-xl bg-rose-100 text-[#E11D48] flex items-center justify-center">
                <Upload size={18} />
              </div>
              <span className="text-xs font-bold text-slate-800">Cliquer pour choisir un fichier</span>
              <span className="text-[0.625rem] text-slate-400 font-medium">{hint}</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[0.6875rem] text-rose-600 font-medium flex items-center gap-1 mt-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
