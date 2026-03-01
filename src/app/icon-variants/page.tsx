"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Activity, Target, Zap, TrendingUp, ArrowUp } from "lucide-react";

export default function IconVariantsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">🎨 Выбор стиля иконок</h1>
        <p className="mt-2 text-muted-foreground">
          Сравни все варианты и выбери что нравится
        </p>
      </div>

      {/* Вариант 1: Без фона */}
      <section className="space-y-3">
        <div className="border-l-4 border-primary pl-3">
          <h2 className="text-xl font-bold">1. Без фона (минималистично)</h2>
          <p className="text-sm text-muted-foreground">
            Просто цветная иконка, самый компактный вариант
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* Primary */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Total Stitches</p>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <h3 className="text-xl font-bold text-foreground">12,450</h3>
                    <span className="flex items-center gap-0.5 text-xs font-medium text-success">
                      <ArrowUp className="h-3 w-3" />
                      12%
                    </span>
                  </div>
                </div>
                <Activity className="h-5 w-5 text-primary flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          {/* Success */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Projects</p>
                  <div className="mt-0.5">
                    <h3 className="text-xl font-bold text-foreground">8</h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">4 in progress</p>
                </div>
                <Target className="h-5 w-5 text-success flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Avg Speed</p>
                  <div className="mt-0.5">
                    <h3 className="text-xl font-bold text-foreground">234</h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">per day</p>
                </div>
                <Zap className="h-5 w-5 text-info flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Streak</p>
                  <div className="mt-0.5">
                    <h3 className="text-xl font-bold text-foreground">12</h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">days</p>
                </div>
                <TrendingUp className="h-5 w-5 text-warning flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Вариант 2: С круглым фоном */}
      <section className="space-y-3">
        <div className="border-l-4 border-primary pl-3">
          <h2 className="text-xl font-bold">2. С круглым фоном (как сейчас)</h2>
          <p className="text-sm text-muted-foreground">
            Иконка в цветном кружочке
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Total Stitches</p>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <h3 className="text-xl font-bold text-foreground">12,450</h3>
                    <span className="flex items-center gap-0.5 text-xs font-medium text-success">
                      <ArrowUp className="h-3 w-3" />
                      12%
                    </span>
                  </div>
                </div>
                <div className="rounded-full bg-primary p-2 flex-shrink-0">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Projects</p>
                  <div className="mt-0.5">
                    <h3 className="text-xl font-bold text-foreground">8</h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">4 in progress</p>
                </div>
                <div className="rounded-full bg-success p-2 flex-shrink-0">
                  <Target className="h-4 w-4 text-success-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Avg Speed</p>
                  <div className="mt-0.5">
                    <h3 className="text-xl font-bold text-foreground">234</h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">per day</p>
                </div>
                <div className="rounded-full bg-info p-2 flex-shrink-0">
                  <Zap className="h-4 w-4 text-info-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Streak</p>
                  <div className="mt-0.5">
                    <h3 className="text-xl font-bold text-foreground">12</h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">days</p>
                </div>
                <div className="rounded-full bg-warning p-2 flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-warning-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Вариант 3: Без иконок */}
      <section className="space-y-3">
        <div className="border-l-4 border-primary pl-3">
          <h2 className="text-xl font-bold">3. Без иконок (максимально чисто)</h2>
          <p className="text-sm text-muted-foreground">
            Только текст и цифры, самый минималистичный
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Stitches</p>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <h3 className="text-xl font-bold text-foreground">12,450</h3>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-success">
                    <ArrowUp className="h-3 w-3" />
                    12%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Projects</p>
                <div className="mt-0.5">
                  <h3 className="text-xl font-bold text-foreground">8</h3>
                </div>
                <p className="text-xs text-muted-foreground">4 in progress</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Avg Speed</p>
                <div className="mt-0.5">
                  <h3 className="text-xl font-bold text-foreground">234</h3>
                </div>
                <p className="text-xs text-muted-foreground">per day</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Streak</p>
                <div className="mt-0.5">
                  <h3 className="text-xl font-bold text-foreground">12</h3>
                </div>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Вариант 4: Маленькая иконка слева */}
      <section className="space-y-3">
        <div className="border-l-4 border-primary pl-3">
          <h2 className="text-xl font-bold">4. Маленькая иконка слева от заголовка</h2>
          <p className="text-sm text-muted-foreground">
            Иконка рядом с текстом, компактно
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  Total Stitches
                </p>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <h3 className="text-xl font-bold text-foreground">12,450</h3>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-success">
                    <ArrowUp className="h-3 w-3" />
                    12%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Target className="h-3.5 w-3.5 text-success" />
                  Projects
                </p>
                <div className="mt-0.5">
                  <h3 className="text-xl font-bold text-foreground">8</h3>
                </div>
                <p className="text-xs text-muted-foreground">4 in progress</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-info" />
                  Avg Speed
                </p>
                <div className="mt-0.5">
                  <h3 className="text-xl font-bold text-foreground">234</h3>
                </div>
                <p className="text-xs text-muted-foreground">per day</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-warning" />
                  Streak
                </p>
                <div className="mt-0.5">
                  <h3 className="text-xl font-bold text-foreground">12</h3>
                </div>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Итог */}
      <section className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 text-center">
        <h2 className="text-xl font-bold">Какой вариант нравится?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Все варианты компактные (p-3, text-xl). Выбери стиль иконок.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
          <span className="rounded-full bg-background px-3 py-1">1. Без фона</span>
          <span className="rounded-full bg-background px-3 py-1">2. С кружочком</span>
          <span className="rounded-full bg-background px-3 py-1">3. Без иконок</span>
          <span className="rounded-full bg-background px-3 py-1">4. Слева от текста</span>
        </div>
      </section>
    </div>
  );
}
