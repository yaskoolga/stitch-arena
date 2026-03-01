"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CalculatorPage() {
  const t = useTranslations('calculator');
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [count, setCount] = useState("14");
  const [coverage, setCoverage] = useState("70");

  const widthNum = Number(width) || 0;
  const heightNum = Number(height) || 0;
  const countNum = Number(count) || 14;
  const coveragePct = Number(coverage) || 70;

  const totalStitches = widthNum * heightNum;
  const fabricWidthCm = widthNum > 0 ? ((widthNum / countNum) * 2.54 + 5).toFixed(1) : "—";
  const fabricHeightCm = heightNum > 0 ? ((heightNum / countNum) * 2.54 + 5).toFixed(1) : "—";

  const skeinsPerColor = totalStitches > 0
    ? Math.ceil((totalStitches * (coveragePct / 100) * 0.02) / 8)
    : 0;

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card className="rounded-2xl bg-primary/5 border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-primary">{t('patternDimensions')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">{t('width')}</Label>
              <Input id="width" type="number" min={1} value={width} onChange={(e) => setWidth(e.target.value)} placeholder={t('widthPlaceholder')} className="rounded-full" />
            </div>
            <div>
              <Label htmlFor="height">{t('height')}</Label>
              <Input id="height" type="number" min={1} value={height} onChange={(e) => setHeight(e.target.value)} placeholder={t('heightPlaceholder')} className="rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="count">{t('fabricCount')}</Label>
              <Input id="count" type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} className="rounded-full" />
            </div>
            <div>
              <Label htmlFor="coverage">{t('coverage')}</Label>
              <Input id="coverage" type="number" min={1} max={100} value={coverage} onChange={(e) => setCoverage(e.target.value)} className="rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {totalStitches > 0 && (
        <Card className="mt-6 rounded-2xl bg-success/5 border-success/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-success">{t('results')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between p-3 rounded-xl bg-background/60">
              <span className="text-muted-foreground">{t('totalStitches')}</span>
              <span className="font-semibold text-success">{totalStitches.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-background/60">
              <span className="text-muted-foreground">{t('fabricSize')}</span>
              <span className="font-semibold">{fabricWidthCm} x {fabricHeightCm} cm</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-background/60">
              <span className="text-muted-foreground">{t('estSkeins')}</span>
              <span className="font-semibold">{skeinsPerColor}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-3 p-3 rounded-xl bg-warning/5 border border-warning/10">
              ℹ️ {t('disclaimer')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
