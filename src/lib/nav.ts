import {
  BarChart3,
  BookMarked,
  CalendarRange,
  LayoutDashboard,
  Route,
  Settings,
  Star,
  StickyNote,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown as a small count pill in the sidebar when non-zero. */
  countKey?: "revision" | "favorites";
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "DSA Roadmap", icon: Route },
  { href: "/goals", label: "Monthly Goals", icon: CalendarRange },
  { href: "/rating", label: "Codeforces Rating", icon: TrendingUp },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/revision", label: "Revision Needed", icon: BookMarked, countKey: "revision" },
  { href: "/favorites", label: "Favorites", icon: Star, countKey: "favorites" },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/settings", label: "Settings", icon: Settings },
];
