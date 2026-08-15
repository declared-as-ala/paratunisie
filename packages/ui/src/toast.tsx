"use client"

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
} from "react"
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react"

import { cn } from "./cn"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={16} className="shrink-0 text-success" />,
  error: <XCircle size={16} className="shrink-0 text-danger" />,
  warning: <AlertTriangle size={16} className="shrink-0 text-warning" />,
  info: <Info size={16} className="shrink-0 text-info" />,
}

const accents: Record<ToastType, string> = {
  success: "border-l-success",
  error: "border-l-danger",
  warning: "border-l-warning",
  info: "border-l-info",
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (type: ToastType, message: string) => {
      const id = `toast-${++counterRef.current}`
      setToasts((prev) => [...prev, { id, type, message }])
      window.setTimeout(() => remove(id), 4000)
    },
    [remove]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed right-4 bottom-4 z-[100] flex flex-col-reverse gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex max-w-[22rem] items-center gap-2 rounded-lg border border-border bg-surface-alt p-2.5 text-sm font-medium text-ink shadow-lg",
              "border-l-[3px]",
              "animate-[pt-toast-in_0.25s_cubic-bezier(0.16,1,0.3,1)]",
              accents[t.type]
            )}
          >
            {icons[t.type]}
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="shrink-0 rounded p-0.5 text-ink-faint transition-colors hover:bg-soft-nude"
              aria-label="Fermer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
