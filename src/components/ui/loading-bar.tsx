import { cn } from "@/lib/utils"

const LOADING_BAR_GREEN = "hsl(142, 76%, 36%)" // green-600

type LoadingBarProps = {
  /** Inline: compact bar; full: full-width top bar */
  variant?: "inline" | "full"
  /** Height in pixels (inline default 4, full default 3) */
  className?: string
}

export function LoadingBar({ variant = "inline", className }: LoadingBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Chargement"
      className={cn(
        "overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
        variant === "full" && "fixed top-0 left-0 right-0 z-[9999] h-1",
        variant === "inline" && "h-1 min-w-[80px]",
        className
      )}
    >
      <div
        className="loading-bar-indeterminate h-full rounded-full"
        style={{ background: LOADING_BAR_GREEN }}
      />
    </div>
  )
}

/** Small inline bar for buttons (replaces spinner in buttons) */
export function LoadingBarButton({ className }: { className?: string }) {
  return (
    <LoadingBar variant="inline" className={cn("h-0.5 min-w-[20px] flex-1 max-w-12", className)} />
  )
}
