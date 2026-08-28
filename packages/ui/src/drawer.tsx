"use client"

import * as React from "react"
import { Dialog as DrawerPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

interface DrawerProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

function Drawer({ open, title, description, onClose, children, footer }: DrawerProps) {
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <DrawerPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Backdrop
          data-slot="drawer-overlay"
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-[var(--duration-standard)] data-starting-style:opacity-0 data-ending-style:opacity-0"
        />
        <DrawerPrimitive.Popup
          data-slot="drawer-panel"
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[40rem] flex-col overflow-hidden border-l border-border bg-surface-alt shadow-xl outline-none transition duration-[var(--duration-large)] ease-[var(--ease-drawer)] data-starting-style:translate-x-full data-ending-style:translate-x-full"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
            <div className="min-w-0">
              <DrawerPrimitive.Title
                data-slot="drawer-title"
                className="truncate text-base font-semibold text-ink"
              >
                {title}
              </DrawerPrimitive.Title>
              {description && (
                <DrawerPrimitive.Description
                  data-slot="drawer-description"
                  className="mt-0.5 truncate text-xs text-ink-muted"
                >
                  {description}
                </DrawerPrimitive.Description>
              )}
            </div>
            <DrawerPrimitive.Close
              data-slot="drawer-close"
              aria-label="Fermer"
              className="ml-3 shrink-0 rounded-md p-1.5 text-ink-muted transition-colors hover:bg-soft-nude"
            >
              <XIcon size={18} />
            </DrawerPrimitive.Close>
          </div>

          {/* Body */}
          <div data-slot="drawer-body" className="flex-1 overflow-y-auto px-6 py-5">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              data-slot="drawer-footer"
              className="flex shrink-0 justify-end gap-2 border-t border-border bg-background px-6 py-3"
            >
              {footer}
            </div>
          )}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  )
}

export { Drawer }
