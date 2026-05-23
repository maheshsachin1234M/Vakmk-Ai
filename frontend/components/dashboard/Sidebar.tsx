"use client";

import {
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/Logo";
import { useAuth } from "@/hooks/useAuth";
import { cn, initials } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/search", label: "Semantic Search", icon: Search },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-white/[0.06] bg-black/30 backdrop-blur-xl">
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/dashboard" className="block">
          <Logo size={34} withWordmark />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {nav.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-white/[0.06] text-foreground border border-white/[0.08]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4",
                  active ? "text-brand-fuchsia" : "text-muted-foreground",
                )}
              />
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-fuchsia animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/[0.06]">
        {user && (
          <div className="glass rounded-xl p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-semibold">
              {initials(user.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.full_name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
