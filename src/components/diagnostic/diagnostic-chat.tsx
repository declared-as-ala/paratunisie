"use client";

import { useEffect, useState, useRef } from "react";
import { Sparkles, RefreshCw, Loader2, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { ChatMessage, MessageData } from "./chat-message";
import { DiagnosticComposer } from "./diagnostic-composer";
import { ProfileSummary } from "./profile-summary";
import {
  createDiagnosticChatSession,
  fetchDiagnosticChatSession,
  sendDiagnosticChatMessage,
  uploadDiagnosticChatPhoto,
  resetDiagnosticChatSession,
} from "@/lib/api/client";

export function DiagnosticChat() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [redFlag, setRedFlag] = useState(false);
  const [redFlagReason, setRedFlagReason] = useState<string | null>(null);
  const [showMobileProfile, setShowMobileProfile] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Exact available height below the sticky site header, measured live
  // rather than guessed — a static calc() estimate left a small residual
  // gap (the real <header> height varies by breakpoint: the announcement
  // bar alone is h-8 on mobile vs h-9 from sm:), which is exactly the kind
  // of few-px mismatch that produces an unwanted whole-page scrollbar on
  // desktop. Re-measured on resize so it stays exact across breakpoints.
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);

  useEffect(() => {
    function measure() {
      const header = document.querySelector("header");
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      setAvailableHeight(window.innerHeight - headerHeight);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Initialize or restore session
  useEffect(() => {
    async function init() {
      const storedToken = localStorage.getItem("paratunisie_diag_chat_token");
      if (storedToken) {
        try {
          const res = await fetchDiagnosticChatSession(storedToken);
          if (res && res.sessionToken) {
            setSessionToken(res.sessionToken);
            setMessages(res.messages || []);
            setProfile(res.profile || null);
            setLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem("paratunisie_diag_chat_token");
        }
      }

      // Create new chat session
      try {
        const created = await createDiagnosticChatSession("SKIN");
        if (created && created.sessionToken) {
          localStorage.setItem("paratunisie_diag_chat_token", created.sessionToken);
          setSessionToken(created.sessionToken);
          setMessages(created.messages || []);
          setProfile(created.profile || null);
        }
      } catch (err) {
        console.error("Failed to create chat session:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // Auto-scroll to bottom when messages update — scrolls only the message
  // list's own scrollTop directly, never scrollIntoView(). scrollIntoView
  // walks up every scrollable ancestor (including the page itself) trying
  // to bring the target fully into view, which is what caused the whole
  // page to jump/scroll on send instead of just the chat panel.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const handleSendMessage = async (text: string) => {
    if (!sessionToken || sending) return;

    // Optimistic user message append
    const userMsg: MessageData = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await sendDiagnosticChatMessage(sessionToken, text);
      if (res && res.message) {
        setMessages((prev) => [...prev, res.message]);
        if (res.profile) setProfile(res.profile);
        if (res.redFlag) {
          setRedFlag(true);
          setRedFlagReason(res.redFlagReason);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleSendPhoto = async (file: File) => {
    if (!sessionToken || uploadingPhoto) return;

    setUploadingPhoto(true);
    try {
      const res = await uploadDiagnosticChatPhoto(sessionToken, file);
      if (res && res.message) {
        setMessages((prev) => [...prev, res.message]);
        if (res.profile) setProfile(res.profile);
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleResetSession = async () => {
    if (!sessionToken) return;
    setLoading(true);
    try {
      const res = await resetDiagnosticChatSession(sessionToken);
      if (res && res.sessionToken) {
        setMessages(res.messages || []);
        setProfile(res.profile || null);
        setRedFlag(false);
        setRedFlagReason(null);
      }
    } catch (err) {
      console.error("Error resetting session:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-3 text-sm font-medium text-ink-muted">Connexion au conseiller beauté IA ParaTunisie...</p>
      </div>
    );
  }

  return (
    // Fills exactly the viewport space below the real (measured) site
    // header, on every screen size — never taller, so the page itself
    // never scrolls; only the message list inside does. Falls back to a
    // calc() estimate for the one frame before the resize-observer effect
    // above has measured the real header (avoids a layout flash).
    <div
      className="mx-auto flex max-w-6xl flex-col px-3 py-3 sm:px-6 sm:py-4 lg:px-8 h-[calc(100dvh-7rem)]"
      style={availableHeight !== null ? { height: `${availableHeight}px` } : undefined}
    >
      {/* Header Bar */}
      <div className="mb-3 flex shrink-0 items-center justify-between rounded-2xl border border-border/80 bg-white p-3 shadow-sm sm:mb-4 sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Sparkles className="size-5 text-brand-champagne" />
          </div>
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-1.5 font-serif text-base font-bold text-primary sm:text-lg">
              <span className="truncate">Conseiller beauté ParaTunisie</span>
              <span className="shrink-0 rounded-full border border-brand-champagne/40 bg-brand-champagne/20 px-2 py-0.5 text-[0.65rem] font-sans font-semibold text-primary">
                IA 24/7
              </span>
            </h1>
            <p className="truncate text-xs text-ink-muted">Consultation en direct • Catalogue réels PostgreSQL</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Mobile Profile Toggle */}
          <button
            onClick={() => setShowMobileProfile(!showMobileProfile)}
            className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-soft-nude/30 text-ink-muted transition-colors hover:text-primary md:hidden"
            title="Voir le profil"
            aria-label="Voir le profil"
          >
            <SlidersHorizontal className="size-4" />
          </button>

          {/* Reset Button */}
          <button
            onClick={handleResetSession}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-border bg-white px-3 text-xs font-semibold text-ink-muted transition-all hover:border-primary/40 hover:text-primary active:scale-95"
          >
            <RefreshCw className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">Nouveau diagnostic</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid — fills all remaining vertical space */}
      <div className="grid min-h-0 flex-1 gap-6 md:grid-cols-12">
        {/* Chat Stream Column */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-soft-nude/20 shadow-sm md:col-span-8">
          {/* Scrollable Message List — the ONLY scrollable element in this
              card; the page itself never scrolls when a message arrives. */}
          <div ref={scrollContainerRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {messages.map((msg, index) => (
              <div key={msg.id}>
                <ChatMessage
                  message={msg}
                  onQuickReplyClick={handleSendMessage}
                  redFlag={redFlag}
                  redFlagReason={redFlagReason}
                />

                {/* Visual Starter Cards — rendered right below initial greeting message */}
                {index === 0 && messages.length === 1 && (
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    <button
                      onClick={() => handleSendMessage("Construire ma routine")}
                      className="group flex flex-col items-start rounded-2xl border border-border/80 bg-white p-3.5 text-left shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
                    >
                      <span className="font-semibold text-xs text-primary flex items-center gap-1.5">
                        ✨ Construire ma routine
                      </span>
                      <span className="mt-1 text-[0.75rem] text-ink-muted leading-snug">
                        Un accompagnement personnalisé étape par étape.
                      </span>
                    </button>

                    <button
                      onClick={() => handleSendMessage("Analyser ma peau")}
                      className="group flex flex-col items-start rounded-2xl border border-border/80 bg-white p-3.5 text-left shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
                    >
                      <span className="font-semibold text-xs text-primary flex items-center gap-1.5">
                        📷 Analyser ma peau
                      </span>
                      <span className="mt-1 text-[0.75rem] text-ink-muted leading-snug">
                        Ajoutez une photo pour compléter l'analyse.
                      </span>
                    </button>

                    <button
                      onClick={() => handleSendMessage("Trouver un produit")}
                      className="group flex flex-col items-start rounded-2xl border border-border/80 bg-white p-3.5 text-left shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
                    >
                      <span className="font-semibold text-xs text-primary flex items-center gap-1.5">
                        🔎 Trouver un produit
                      </span>
                      <span className="mt-1 text-[0.75rem] text-ink-muted leading-snug">
                        Décrivez simplement ce que vous recherchez.
                      </span>
                    </button>

                    <button
                      onClick={() => handleSendMessage("Comparer des produits")}
                      className="group flex flex-col items-start rounded-2xl border border-border/80 bg-white p-3.5 text-left shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
                    >
                      <span className="font-semibold text-xs text-primary flex items-center gap-1.5">
                        ⚖️ Comparer des produits
                      </span>
                      <span className="mt-1 text-[0.75rem] text-ink-muted leading-snug">
                        Comparez les options disponibles.
                      </span>
                    </button>

                    <button
                      onClick={() => handleSendMessage("Adapter ma routine à mon budget")}
                      className="group flex flex-col items-start rounded-2xl border border-border/80 bg-white p-3.5 text-left shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
                    >
                      <span className="font-semibold text-xs text-primary flex items-center gap-1.5">
                        💰 Respecter mon budget
                      </span>
                      <span className="mt-1 text-[0.75rem] text-ink-muted leading-snug">
                        Trouvez les meilleures options selon votre budget.
                      </span>
                    </button>

                    <button
                      onClick={() => handleSendMessage("Conseils cheveux")}
                      className="group flex flex-col items-start rounded-2xl border border-border/80 bg-white p-3.5 text-left shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
                    >
                      <span className="font-semibold text-xs text-primary flex items-center gap-1.5">
                        💆 Conseils cheveux
                      </span>
                      <span className="mt-1 text-[0.75rem] text-ink-muted leading-snug">
                        Construisez votre routine capillaire.
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Sending Indicator */}
            {sending && (
              <div className="flex max-w-fit items-center gap-2 rounded-2xl border border-border/50 bg-white/80 p-3 text-xs font-medium text-primary animate-pulse">
                <Loader2 className="size-4 animate-spin text-primary" />
                Le conseiller analyse votre demande et consulte le catalogue ParaTunisie...
              </div>
            )}
          </div>

          {/* Composer — a normal flex item pinned to the card's bottom by
              flexbox itself (the message list above is flex-1), not by
              `sticky`, which had no correct scrolling ancestor to stick
              within here and could detach toward the page instead. */}
          <div className="shrink-0">
            <DiagnosticComposer
              onSendMessage={handleSendMessage}
              onSendPhoto={handleSendPhoto}
              disabled={sending || uploadingPhoto}
              isUploadingPhoto={uploadingPhoto}
            />
          </div>
        </div>

        {/* Desktop Profile Summary Column */}
        <div className="hidden min-h-0 overflow-y-auto md:block md:col-span-4">
          <ProfileSummary profile={profile} onReset={handleResetSession} />
        </div>
      </div>

      {/* Mobile Profile Summary Drawer / Modal */}
      {showMobileProfile && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50 p-4 md:hidden"
          onClick={(e) => e.target === e.currentTarget && setShowMobileProfile(false)}
        >
          <div className="max-h-[80dvh] w-full overflow-y-auto rounded-2xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-sm text-primary">Votre Profil Beauté</h3>
              <button
                onClick={() => setShowMobileProfile(false)}
                aria-label="Fermer"
                className="flex size-9 items-center justify-center rounded-full text-ink-muted hover:bg-soft-nude/60 hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-3">
              <ProfileSummary profile={profile} onReset={handleResetSession} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
