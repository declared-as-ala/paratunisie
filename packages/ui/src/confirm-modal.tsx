"use client"

import * as React from "react"
import { AlertTriangle } from "lucide-react"

import { cn } from "./cn"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "./dialog"

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning" | "success" | "default"
  onConfirm: () => void
  onCancel: () => void
}

const iconClasses: Record<NonNullable<ConfirmModalProps["variant"]>, string> = {
  danger: "bg-danger-bg text-danger",
  warning: "bg-warning-bg text-warning",
  success: "bg-success-bg text-success",
  default: "",
}

const confirmButtonClasses: Record<NonNullable<ConfirmModalProps["variant"]>, string> = {
  danger: "bg-danger text-white hover:opacity-90",
  warning: "bg-warning text-white hover:opacity-90",
  success: "bg-success text-white hover:opacity-90",
  default: "bg-primary text-white hover:bg-primary-hover",
}

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel()
      }}
    >
      <DialogContent showCloseButton={false} className="max-w-sm">
        <div className="flex items-start gap-3">
          {variant !== "default" && (
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                iconClasses[variant]
              )}
            >
              <AlertTriangle size={18} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-soft-nude"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-semibold text-white transition-colors",
              confirmButtonClasses[variant]
            )}
          >
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ConfirmModal }
