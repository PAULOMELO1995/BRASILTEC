import type { ReactNode } from "react";

type StatusVariant = "loading" | "success" | "error" | "empty" | "info";

const variantClass: Record<StatusVariant, string> = {
  loading: "border-border/60 bg-background/70 text-muted-foreground",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  error: "border-destructive/20 bg-destructive/10 text-destructive",
  empty: "border-border/60 bg-background/70 text-muted-foreground",
  info: "border-amber-500/30 bg-amber-500/10 text-amber-700",
};

export function StatusNotice({
  variant,
  message,
  title,
  className,
  actions,
}: {
  variant: StatusVariant;
  message: string;
  title?: string;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <article className={`rounded-2xl border px-4 py-3 text-sm ${variantClass[variant]} ${className ?? ""}`.trim()}>
      {title ? <p className="font-medium">{title}</p> : null}
      <p className={title ? "mt-1" : undefined}>{message}</p>
      {actions ? <div className="mt-3">{actions}</div> : null}
    </article>
  );
}
