"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

  const navItems = [
    { href: "/dashboard", label: t('dashboard') },
    { href: "/projects/new", label: t('projects') },
    { href: "/gallery", label: t('gallery') },
    { href: "/challenges", label: t('challenges') },
    { href: "/community", label: t('community') },
    { href: "/favorites", label: t('favorites') },
    { href: "/calculator", label: t('calculator') },
    { href: "/profile", label: t('profile') },
  ];

  if (!session) return null;

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="sm"
        className="fixed left-4 top-20 z-40 md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? tCommon('close') : "Menu"}
      </Button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-56 border-r bg-sidebar p-4 transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent",
                pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
