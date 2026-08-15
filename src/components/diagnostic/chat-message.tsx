"use client";

import { Sparkles, User, AlertTriangle, ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { DiagnosticProductCard } from "./diagnostic-product-card";
import { useCart } from "@/hooks/use-cart";

export interface MessageData {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  quickReplies?: string[];
  recommendation?: {
    type: "SINGLE_PRODUCT" | "ROUTINE";
    title: string;
    summary: string;
    products?: any[];
    routine?: {
      am?: any[];
      pm?: any[];
    };
  };
  createdAt?: string;
}

interface ChatMessageProps {
  message: MessageData;
  onQuickReplyClick: (reply: string) => void;
  redFlag?: boolean;
  redFlagReason?: string | null;
}

export function ChatMessage({ message, onQuickReplyClick, redFlag, redFlagReason }: ChatMessageProps) {
  const { addItem } = useCart();
  const [addedRoutine, setAddedRoutine] = useState(false);
  const isAssistant = message.role === "assistant";

  const handleAddFullRoutine = () => {
    const products = message.recommendation?.products || [];
    products.forEach((prod) => {
      addItem({
        id: prod.id,
        slug: prod.slug,
        name: prod.name,
        brand: prod.brandName || "",
        benefit: prod.description || "",
        size: "",
        priceMillimes: prod.priceMillimes,
        category: prod.categoryName || "",
        concerns: [],
        skinTypes: [],
        image: prod.image || "/assets/placeholder-product.webp",
        description: prod.description || "",
        benefits: [],
        usage: "",
        sizes: [],
        routineTime: ["AM", "PM"],
      });
    });

    setAddedRoutine(true);
    setTimeout(() => setAddedRoutine(false), 2500);
  };

  return (
    <div className={`flex flex-col gap-2 ${isAssistant ? "items-start" : "items-end"} mb-4`}>
      <div className={`flex gap-3 max-w-2xl ${isAssistant ? "flex-row" : "flex-row-reverse"}`}>
        {/* Avatar */}
        <div
          className={`size-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
            isAssistant ? "bg-primary text-white" : "bg-soft-nude text-ink border border-border"
          }`}
        >
          {isAssistant ? <Sparkles className="size-4 text-brand-champagne" /> : <User className="size-4 text-ink-muted" />}
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col gap-3 min-w-0">
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              isAssistant
                ? "bg-white border border-border/70 text-ink shadow-sm rounded-tl-sm"
                : "bg-primary text-white shadow-sm rounded-tr-sm"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Medical Red Flag Notice */}
          {redFlag && isAssistant && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm flex items-start gap-2.5">
              <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-950">Avis médical recommandé</h4>
                <p className="mt-1 leading-relaxed">{redFlagReason || "Les symptômes décrits nécessitent une évaluation médicale professionnelle avant toute routine cosmétique."}</p>
              </div>
            </div>
          )}

          {/* Embedded Product Recommendations */}
          {message.recommendation && message.recommendation.products && message.recommendation.products.length > 0 && (
            <div className="mt-1 flex flex-col gap-3">
              {message.recommendation.title && (
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-brand-gold" />
                    {message.recommendation.title}
                  </h4>

                  {message.recommendation.type === "ROUTINE" && message.recommendation.products.length > 1 && (
                    <button
                      onClick={handleAddFullRoutine}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                        addedRoutine
                          ? "bg-emerald-600 text-white"
                          : "bg-brand-champagne/20 text-primary border border-brand-champagne/40 hover:bg-brand-champagne/40 active:scale-95"
                      }`}
                    >
                      {addedRoutine ? (
                        <>
                          <Check className="size-3.5" />
                          Routine ajoutée
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="size-3.5" />
                          Ajouter toute la routine au panier
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-1">
                {message.recommendation.products.map((prod: any) => (
                  <DiagnosticProductCard key={prod.id} product={prod} onSelectAction={onQuickReplyClick} />
                ))}
              </div>
            </div>
          )}

          {/* Quick Replies Action Chips */}
          {message.quickReplies && message.quickReplies.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {message.quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => onQuickReplyClick(reply)}
                  className="rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary transition-all hover:border-primary hover:bg-primary hover:text-white active:scale-95 shadow-sm"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
