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
    { href: "/gallery", label: t('gallery') },
    { href: "/challenges", label: t('challenges') },
    { href: "/calculator", label: t('calculator') },
  ];

  if (!session) return null;

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="sm"
        className="fixed left-4 top-20 z-40 md:hidden rounded-full shadow-sm"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="sidebar-navigation"
        aria-label={open ? tCommon('close') + " menu" : "Open menu"}
      >
        {open ? tCommon('close') : "Menu"}
      </Button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar-navigation"
        className={cn(
          "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-56 border-r bg-sidebar p-4 transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-modal={open ? "true" : undefined}
        role={open ? "dialog" : undefined}
        aria-label="Main navigation"
      >
        <nav className="space-y-1.5" aria-label="Main navigation menu">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-2xl px-4 py-2.5 text-sm font-medium transition-all",
                pathname === item.href
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
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
