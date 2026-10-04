import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Compass,
  FolderKanban,
  BookImage,
  CalendarDays,
  Wallet,
  User,
  Users,
  FilePlus2,
  MessageSquare,
  ClipboardList,
  Sparkles,
  Briefcase,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  /** Shown directly in the mobile bottom bar; everything else goes under "More". */
  primary?: boolean;
}

export const hustlerNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/hustler", icon: LayoutDashboard, primary: true },
  { label: "Discover Work", href: "/work/hustler", icon: Compass, primary: true },
  { label: "My Projects", href: "/projects/hustler", icon: FolderKanban, primary: true },
  { label: "Portfolio", href: "/portfolio/hustler", icon: BookImage, primary: true },
  { label: "Calendar", href: "/calendar/hustler", icon: CalendarDays },
  { label: "Income", href: "/income/hustler", icon: Wallet },
  { label: "Hustle Wrapped", href: "/wrapped/hustler", icon: Sparkles },
  { label: "Profile", href: "/profile/hustler", icon: User },
];

export const ownerNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/owner", icon: LayoutDashboard, primary: true },
  { label: "Find Hustlers", href: "/find/owner", icon: Users, primary: true },
  { label: "Post a Project", href: "/jobs/owner/new", icon: FilePlus2, primary: true },
  { label: "Applications", href: "/applications/owner", icon: ClipboardList, primary: true },
  { label: "My Projects", href: "/jobs/owner", icon: Briefcase },
  { label: "Messages", href: "/dashboard/owner", icon: MessageSquare, disabled: true },
  { label: "Profile", href: "/profile/owner", icon: User },
];
