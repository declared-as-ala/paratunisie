"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, RefreshCw, CheckCircle2, AlertCircle, Link as LinkIcon } from "lucide-react";
import { resolveMediaUrl, uploadMediaFile } from "@/lib/api-client";

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
  hint = "PNG, JPG, WebP jusqu'à 8MB",
  accept = "image/png, image/jpeg, image/webp, image/svg+xml",
  maxSizeMb = 8,
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`Le fichier dépasse la taille maximale autorisée (${maxSizeMb} MB)`);
        return;
      }

      setError(null);
      setUploading(true);

      try {
        const result = await uploadMediaFile(file);
        if (result?.url) {
          onChange(result.url);
        } else {
          throw new Error("URL de réponse invalide");
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors du téléversement du fichier");
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [maxSizeMb, onChange]
  );

  const handleRemove = useCallback(() => {
    onChange("");
    setCustomUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  const handleApplyUrl = useCallback(() => {
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setShowUrlInput(false);
      setError(null);
    }
  }, [customUrl, onChange]);

  const aspectClasses = {
    square: "h-36 w-36",
    banner: "h-36 w-full",
    wide: "h-44 w-full",
  }[aspectRatio];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {value && (
            <span className="inline-flex items-center gap-1 text-[0.625rem] font-bold text-emerald-600">
              <CheckCircle2 size={12} /> Image configurée
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowUrlInput((prev) => !prev)}
            className="text-[0.6875rem] text-primary hover:underline flex items-center gap-1 font-medium"
          >
            <LinkIcon size={12} /> {showUrlInput ? "Masquer URL" : "Lien direct URL"}
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={accept}
        className="hidden"
      />

      {showUrlInput && (
        <div className="flex gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://... ou /uploads/products/..."
            className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Appliquer
          </button>
        </div>
      )}

      {value ? (
        <div className="space-y-2">
          <div
            className={`relative rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs group flex items-center justify-center ${aspectClasses}`}
          >
            <Image
              src={resolveMediaUrl(value)}
              alt={altText || label}
              fill
              unoptimized
              className="object-contain p-2"
            />
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition-colors text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <RefreshCw size={14} className={uploading ? "animate-spin" : ""} /> {uploading ? "Envoi..." : "Remplacer"}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <X size={14} /> Retirer
              </button>
            </div>
          </div>

          <div className="text-[0.625rem] text-slate-400 truncate max-w-full font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200">
            {value}
          </div>

          {onAltTextChange && (
            <div>
              <input
                type="text"
                value={altText}
                onChange={(e) => onAltTextChange(e.target.value)}
                placeholder="Texte alternatif (Alt description image)..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed border-slate-200 hover:border-primary bg-slate-50/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center p-4 text-center ${aspectClasses}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-primary" />
              <span className="text-xs font-bold text-slate-700">Téléversement de la photo...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Upload size={20} />
              </div>
              <span className="text-xs font-bold text-slate-800">Cliquer pour téléverser une photo</span>
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
