"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function Home() {
  const t = useTranslations('landing');

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        {t('subtitle')}
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/register">
          <Button size="lg">{t('getStarted')}</Button>
        </Link>
        <Link href="/login">
          <Button size="lg" variant="outline">{t('signIn')}</Button>
        </Link>
      </div>
    </div>
  );
}
