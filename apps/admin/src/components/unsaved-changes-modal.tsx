"use client";

import { AlertTriangle } from "lucide-react";

interface UnsavedChangesModalProps {
  open: boolean;
  onContinueEditing: () => void;
  onDiscardAndLeave: () => void;
}

export function UnsavedChangesModal({
  open,
  onContinueEditing,
  onDiscardAndLeave,
}: UnsavedChangesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Modifications non enregistrées</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Vous avez des modifications non sauvegardées dans ce formulaire.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Si vous quittez maintenant, toutes vos modifications récentes seront perdues.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onContinueEditing}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Continuer l&apos;édition
          </button>
          <button
            type="button"
            onClick={onDiscardAndLeave}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Quitter sans enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
