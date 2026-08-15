"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PasswordFieldProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  label: string;
  hint?: string;
}

export function PasswordField({ label, hint, id, className = "", ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative mt-2">
        <Input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          className={`h-12 rounded-xl bg-background/70 px-4 pr-12 text-base placeholder:text-ink-faint focus-visible:border-primary focus-visible:ring-primary/15 md:text-sm ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-0.5 top-0.5 flex size-11 cursor-pointer items-center justify-center rounded-[0.65rem] text-ink-muted transition-colors hover:bg-soft-nude hover:text-primary"
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-[1.125rem]" aria-hidden="true" /> : <Eye className="size-[1.125rem]" aria-hidden="true" />}
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs leading-5 text-ink-muted">{hint}</p>}
    </div>
  );
}
