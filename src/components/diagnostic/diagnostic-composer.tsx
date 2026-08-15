"use client";

import { useState, useRef, FormEvent } from "react";
import { Send, Paperclip, Loader2, Image as ImageIcon } from "lucide-react";

interface DiagnosticComposerProps {
  onSendMessage: (text: string) => void;
  onSendPhoto: (file: File) => void;
  disabled?: boolean;
  isUploadingPhoto?: boolean;
}

export function DiagnosticComposer({ onSendMessage, onSendPhoto, disabled, isUploadingPhoto }: DiagnosticComposerProps) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendPhoto(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    // A plain flow item, not `sticky` — its parent (diagnostic-chat.tsx) is
    // a bounded flex column with the message list as the only flex-1/
    // scrollable child, so this already stays pinned to the card's bottom
    // without needing its own scrolling-ancestor-relative positioning.
    <div className="shrink-0 border-t border-border/70 bg-white/90 p-3 backdrop-blur-md pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:p-4">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-center gap-2">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploadingPhoto}
        />

        {/* Attachment Button — 44px minimum touch target (CLAUDE.md §5) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploadingPhoto}
          title="Ajouter une photo pour analyse visuelle cosmétique"
          aria-label="Ajouter une photo pour analyse visuelle cosmétique"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-soft-nude/40 text-ink-muted transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
        >
          {isUploadingPhoto ? <Loader2 className="size-4 animate-spin text-primary" /> : <Paperclip className="size-4" />}
        </button>

        {/* Input Bar */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Décrivez votre peau, vos besoins ou posez une question..."
          disabled={disabled}
          className="h-11 min-w-0 flex-1 rounded-xl border border-border/80 bg-white px-4 text-sm text-ink placeholder:text-ink-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
        />

        {/* Send Button — 44px minimum touch target */}
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          aria-label="Envoyer"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
