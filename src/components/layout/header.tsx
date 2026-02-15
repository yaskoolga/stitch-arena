"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/ui/logo";

export function Header() {
  const { data: session } = useSession();
  const t = useTranslations('nav');

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={session ? "/dashboard" : "/"} className="flex items-center transition-opacity hover:opacity-80">
          <Logo size={40} showText={true} />
        </Link>

        <nav className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">{t('dashboard')}</Button>
              </Link>
              <Link href="/projects/new">
                <Button variant="ghost">{t('projects')}</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{session.user?.name || session.user?.email}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">{t('profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">{t('login')}</Button>
              </Link>
              <Link href="/register">
                <Button>{t('register')}</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
