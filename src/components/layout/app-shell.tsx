"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronsLeft,
  Code2,
  LogOut,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { withRetry } from "@/lib/action-retry";
import { NAV_ITEMS } from "@/lib/nav";
import { usePersistedFlag } from "@/lib/use-client-state";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GlobalSearch } from "@/components/search/global-search";

export type ShellCounts = { revision: number; favorites: number };

export function AppShell({
  children,
  user,
  counts,
}: {
  children: React.ReactNode;
  user: { name: string | null; email: string; image?: string | null };
  counts: ShellCounts;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = usePersistedFlag("dsa:sidebar-collapsed");
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

  const handleSignOut = () => {
    startSignOut(async () => {
      try {
        await withRetry(() => signOutAction());
      } catch {
        // Best-effort: even if every retry drops, still send the user to
        // /login — the session cookie is cleared server-side regardless.
      }
      router.replace("/login");
      router.refresh();
    });
  };

  const [drawerRoute, setDrawerRoute] = useState(pathname);
  if (drawerRoute !== pathname) {
    setDrawerRoute(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // When collapsed, the layout reserves 76px of padding.
  // When expanded, the layout reserves 256px of padding.
  const paddingWidth = collapsed ? 76 : 256;
  
  // The sidebar itself is 256px if expanded OR if hovered while collapsed.
  // It shrinks to 76px only when collapsed and NOT hovered.
  const isSidebarExpanded = !collapsed || isHovered;
  const sidebarWidth = isSidebarExpanded ? 256 : 76;

  return (
    <div
      className="flex min-h-dvh"
      style={{ "--sidebar-w": `${paddingWidth}px` } as React.CSSProperties}
    >
      {/* ── Sidebar (desktop) ─────────────────────────────── */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ width: sidebarWidth }}
        className="fixed inset-y-0 left-0 z-40 hidden shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-raised)]/50 backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex overflow-hidden"
      >
        <SidebarBody
          collapsed={!isSidebarExpanded}
          pathname={pathname}
          counts={counts}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </aside>

      {/* ── Sidebar (mobile drawer) ───────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-[var(--surface-raised)]/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--surface-raised)]/95 backdrop-blur-xl lg:hidden"
            >
              <SidebarBody
                collapsed={false}
                pathname={pathname}
                counts={counts}
                onToggle={() => setMobileOpen(false)}
                toggleIcon={<X className="size-4" />}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main column ───────────────────────────────────── */}
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-out lg:pl-[var(--sidebar-w)]">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-raised)]/60 px-4 backdrop-blur-xl sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]/40 px-3 text-sm text-[var(--subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--muted)] sm:max-w-md"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Search topics, problems, tags…</span>
            <kbd className="ml-auto hidden shrink-0 rounded border border-[var(--border)] bg-white/[0.05] px-1.5 py-0.5 font-mono text-[0.65rem] sm:inline">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-white/[0.06]">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name || user.email}
                      className="size-7 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">
                      {(user.name ?? user.email)[0]?.toUpperCase()}
                    </span>
                  )}
                  <span className="hidden max-w-32 truncate text-sm text-[var(--muted)] sm:block">
                    {user.name ?? user.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="p-0 text-rose-300 [&_svg]:text-rose-300"
                >
                  <button
                    type="button"
                    disabled={signingOut}
                    onClick={handleSignOut}
                    className="flex w-full cursor-pointer items-center gap-2 px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page body with a fade/slide transition per route */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="mx-auto w-full max-w-[92rem]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

function SidebarBody({
  collapsed,
  pathname,
  counts,
  onToggle,
  toggleIcon,
}: {
  collapsed: boolean;
  pathname: string;
  counts: ShellCounts;
  onToggle: () => void;
  toggleIcon?: React.ReactNode;
}) {
  return (
    <>
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-[var(--border)] px-3",
          collapsed ? "justify-center" : "justify-start gap-2.5",
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--primary)] shadow-[0_4px_16px_-4px_rgba(59,130,246,0.7)]">
            <Code2 className="size-4 text-white" suppressHydrationWarning />
          </span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap text-[0.95rem] font-semibold tracking-tight text-[var(--foreground)] overflow-hidden"
              >
                DSA Journey
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-auto"
            >
              <Button variant="ghost" size="icon-sm" onClick={onToggle} aria-label="Collapse sidebar">
                {toggleIcon ?? <ChevronsLeft />}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="no-scrollbar flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
        <TooltipProvider delayDuration={50}>
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const count = item.countKey ? counts[item.countKey] : 0;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors overflow-hidden",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-y-1 left-0 w-1 rounded-r-md bg-[var(--primary)]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <item.icon className="size-4 shrink-0" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {!collapsed && count > 0 && (
                    <motion.span
                      initial={{ opacity: 0, width: 0, scale: 0.8 }}
                      animate={{ opacity: 1, width: "auto", scale: 1 }}
                      exit={{ opacity: 0, width: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="ml-auto rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[0.7rem] text-[var(--muted)] whitespace-nowrap overflow-hidden"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12} className="flex items-center gap-2">
                    {item.label}
                    {count > 0 && (
                      <span className="rounded bg-[var(--muted)]/20 px-1.5 py-0.5 text-[0.6rem] font-semibold text-[var(--foreground)]">
                        {count}
                      </span>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </TooltipProvider>
      </nav>

      {collapsed && (
        <div className="border-t border-[var(--border)] p-2.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-full"
            aria-label="Expand sidebar"
          >
            <ChevronsLeft className="rotate-180" />
          </Button>
        </div>
      )}
    </>
  );
}
