"use client";

import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface EligibilityBannerProps {
  tenure: number;
  currentStreak: number;
  tenureRequired: number;
  streakRequired: number;
}

export function EligibilityBanner({
  tenure,
  currentStreak,
  tenureRequired,
  streakRequired,
}: EligibilityBannerProps) {
  const t = useTranslations("challenges.eligibility");

  const tenureProgress = Math.min((tenure / tenureRequired) * 100, 100);
  const streakProgress = Math.min((currentStreak / streakRequired) * 100, 100);

  return (
    <Alert className="rounded-2xl bg-warning/5 border-warning/10">
      <Info className="h-4 w-4 text-warning" />
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription className="text-foreground">
        <p className="mb-4">{t("description")}</p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between gap-4 text-sm mb-2">
              <span>{t("tenure")}:</span>
              <span className="font-medium">
                {tenure} / {tenureRequired} {t("days")}
              </span>
            </div>
            <Progress value={tenureProgress} className="rounded-full" />
          </div>

          <div>
            <div className="flex justify-between gap-4 text-sm mb-2">
              <span>{t("streak")}:</span>
              <span className="font-medium">
                {currentStreak} / {streakRequired} {t("days")}
              </span>
            </div>
            <Progress value={streakProgress} className="rounded-full" />
          </div>
        </div>

        <p className="mt-4 text-sm">{t("encouragement")}</p>
      </AlertDescription>
    </Alert>
  );
}
