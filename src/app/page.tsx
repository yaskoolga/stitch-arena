"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2, Users, BookOpen, Sparkles } from "lucide-react";

export default function Home() {
  const t = useTranslations('landing');

  const features = [
    { icon: BookOpen, key: "track" as const, color: "primary" as const },
    { icon: Sparkles, key: "ai" as const, color: "success" as const },
    { icon: BarChart2, key: "stats" as const, color: "info" as const },
    { icon: Users, key: "community" as const, color: "warning" as const },
  ];

  const colorClasses = {
    primary: "bg-primary/5 border-primary/10 text-primary",
    success: "bg-success/5 border-success/10 text-success",
    info: "bg-info/5 border-info/10 text-info",
    warning: "bg-warning/5 border-warning/10 text-warning",
  };

  return (
    <div className="flex flex-col items-center py-10 sm:py-20 text-center px-4">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-4 max-w-lg text-base sm:text-lg text-muted-foreground">
        {t('subtitle')}
      </p>
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        <Link href="/register" className="w-full sm:w-auto">
          <Button size="lg" className="rounded-full w-full sm:w-auto">{t('getStarted')}</Button>
        </Link>
        <Link href="/login" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="rounded-full w-full sm:w-auto">{t('signIn')}</Button>
        </Link>
      </div>

      <div className="mt-12 sm:mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-5xl">
        {features.map(({ icon: Icon, key, color }) => (
          <Card key={key} className={`text-left rounded-2xl shadow-sm transition-all hover:shadow-md ${colorClasses[color]}`}>
            <CardContent className="pt-6">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full mb-3 ${colorClasses[color]}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base text-foreground">{t(`features.${key}.title`)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(`features.${key}.description`)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
