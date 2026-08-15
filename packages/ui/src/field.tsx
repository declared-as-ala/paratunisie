import * as React from "react"

import { cn } from "./cn"

interface FieldProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  htmlFor?: string
  className?: string
  children: React.ReactNode
}

function Field({
  label,
  required,
  hint,
  error,
  htmlFor,
  className,
  children,
}: FieldProps) {
  return (
    <div data-slot="field" className={cn("space-y-1", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-[0.75rem] font-medium text-ink"
      >
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[0.6875rem] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[0.6875rem] text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}

export { Field }
