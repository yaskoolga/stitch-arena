"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2, Users, BookOpen, Sparkles } from "lucide-react";

export default function Home() {
  const t = useTranslations('landing');

  const features = [
    { icon: BookOpen, key: "track" as const },
    { icon: Sparkles, key: "ai" as const },
    { icon: BarChart2, key: "stats" as const },
    { icon: Users, key: "community" as const },
  ];

  return (
    <div className="flex flex-col items-center py-20 text-center">
      <h1 className="text-5xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-4 max-w-lg text-lg text-muted-foreground">
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

      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-5xl">
        {features.map(({ icon: Icon, key }) => (
          <Card key={key} className="text-left">
            <CardContent className="pt-6">
              <Icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-base">{t(`features.${key}.title`)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(`features.${key}.description`)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
