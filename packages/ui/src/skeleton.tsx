import * as React from "react"

import { cn } from "./cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-soft-nude", className)}
      {...props}
    />
  )
}

export { Skeleton }
