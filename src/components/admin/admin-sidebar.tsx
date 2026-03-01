"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Trophy,
  Flag,
  ScrollText,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/challenges", label: "Challenges", icon: Trophy },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/logs", label: "Audit Logs", icon: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-card p-4 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">StitchArena</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to Site */}
      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mt-4"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Site
      </Link>
    </aside>
  );
}
