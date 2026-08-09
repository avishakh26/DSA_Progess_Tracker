import Link from "next/link";
import { Code2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[var(--primary)] shadow-[0_6px_24px_-6px_rgba(59,130,246,0.8)]">
          <Code2 className="size-5 text-white" suppressHydrationWarning />
        </span>
        <span className="text-2xl font-semibold tracking-tight text-gradient">
          DSA Journey
        </span>
      </Link>
      {children}
      <p className="mt-8 max-w-sm text-center text-xs text-[var(--subtle)]">
        Track your Data Structures, Algorithms and Competitive Programming
        progress — phases, problems, notes and streaks.
      </p>
    </div>
  );
}
