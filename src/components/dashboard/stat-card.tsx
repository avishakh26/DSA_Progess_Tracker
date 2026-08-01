import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "#3b82f6",
  className,
  children,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accent?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card hover className={cn("relative overflow-hidden p-4", className)}>
      {/* Accent wash in the top-right corner */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-10 size-28 rounded-full opacity-[0.16] blur-2xl"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-[var(--muted)] uppercase">
          {label}
        </p>
        {Icon && (
          <Icon className="size-4 shrink-0" style={{ color: accent }} />
        )}
      </div>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 tabular-nums">
        {value}
      </p>

      {sub && <p className="mt-0.5 text-xs text-[var(--subtle)]">{sub}</p>}
      {children && <div className="mt-3">{children}</div>}
    </Card>
  );
}
