"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Target, Zap, BookOpen, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StylePickerPage() {
  return (
    <div className="space-y-12 pb-20">
      <div>
        <h1 className="text-4xl font-bold">🎨 Выбери стиль дизайна</h1>
        <p className="mt-2 text-muted-foreground">
          Посмотри на примеры и выбери что больше нравится
        </p>
      </div>

      {/* Style 1: Minimal Clean (Linear) */}
      <section className="space-y-4">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="text-2xl font-bold">1. Minimal Clean (как Linear)</h2>
          <p className="text-sm text-muted-foreground">
            Минимализм, чистые линии, много пространства, акцент на типографике
          </p>
        </div>

        <div className="rounded-xl border-2 border-border bg-background/50 p-8">
          {/* Stats Cards - Minimal */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-0 shadow-none">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Stitches</p>
                    <h3 className="mt-2 text-4xl font-bold tracking-tight">12,450</h3>
                    <p className="mt-1 text-xs text-muted-foreground">+12% from last week</p>
                  </div>
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Projects</p>
                    <h3 className="mt-2 text-4xl font-bold tracking-tight">8</h3>
                    <p className="mt-1 text-xs text-muted-foreground">4 in progress</p>
                  </div>
                  <Target className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Speed</p>
                    <h3 className="mt-2 text-4xl font-bold tracking-tight">234</h3>
                    <p className="mt-1 text-xs text-muted-foreground">stitches per day</p>
                  </div>
                  <Zap className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Buttons & Badges - Minimal */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="rounded-md shadow-none">Primary Action</Button>
            <Button variant="outline" className="rounded-md">Secondary Action</Button>
            <Badge className="rounded-md border-0 bg-foreground/10 text-foreground">Completed</Badge>
            <Badge className="rounded-md border-0 bg-foreground/5 text-foreground/70">In Progress</Badge>
          </div>

          {/* Empty State - Minimal */}
          <Card className="mt-6 border-0 shadow-none">
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-3 text-lg font-semibold">No projects yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create your first project to get started</p>
              <Button className="mt-4 rounded-md shadow-none" size="sm">Create Project</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Style 2: Soft & Rounded (Notion) */}
      <section className="space-y-4">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="text-2xl font-bold">2. Soft & Rounded (как Notion)</h2>
          <p className="text-sm text-muted-foreground">
            Мягкие скругленные углы, пастельные акценты, уютный вид
          </p>
        </div>

        <div className="rounded-2xl border-2 border-border bg-background/50 p-8">
          {/* Stats Cards - Soft */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-2xl border-primary/10 bg-primary/5 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">Total Stitches</p>
                    <h3 className="mt-2 text-3xl font-bold text-primary">12,450</h3>
                    <p className="mt-1 text-xs text-primary/70">+12% from last week</p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-2">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-success/10 bg-success/5 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-success">Projects</p>
                    <h3 className="mt-2 text-3xl font-bold text-success">8</h3>
                    <p className="mt-1 text-xs text-success/70">4 in progress</p>
                  </div>
                  <div className="rounded-full bg-success/10 p-2">
                    <Target className="h-4 w-4 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-info/10 bg-info/5 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-info">Avg Speed</p>
                    <h3 className="mt-2 text-3xl font-bold text-info">234</h3>
                    <p className="mt-1 text-xs text-info/70">stitches per day</p>
                  </div>
                  <div className="rounded-full bg-info/10 p-2">
                    <Zap className="h-4 w-4 text-info" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Buttons & Badges - Soft */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="rounded-full shadow-sm">Primary Action</Button>
            <Button variant="outline" className="rounded-full">Secondary Action</Button>
            <Badge className="rounded-full bg-success/10 text-success">Completed</Badge>
            <Badge className="rounded-full bg-warning/10 text-warning">In Progress</Badge>
          </div>

          {/* Empty State - Soft */}
          <Card className="mt-6 rounded-2xl shadow-sm">
            <CardContent className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-3 text-lg font-semibold">No projects yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create your first project to get started</p>
              <Button className="mt-4 rounded-full shadow-sm" size="sm">Create Project</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Style 3: Bold & Modern (Stripe) */}
      <section className="space-y-4">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="text-2xl font-bold">3. Bold & Modern (как Stripe)</h2>
          <p className="text-sm text-muted-foreground">
            Яркие акценты, bold типографика, контрастные элементы
          </p>
        </div>

        <div className="rounded-xl border-2 border-border bg-background/50 p-8">
          {/* Stats Cards - Bold */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-2 border-primary shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">Total Stitches</p>
                    <h3 className="mt-2 text-4xl font-black">12,450</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-success">
                      <span>↑ 12%</span>
                      <span className="text-muted-foreground">vs last week</span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary p-2">
                    <Activity className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-success shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-success">Projects</p>
                    <h3 className="mt-2 text-4xl font-black">8</h3>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">4 in progress</p>
                  </div>
                  <div className="rounded-lg bg-success p-2">
                    <Target className="h-5 w-5 text-success-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-info shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-info">Avg Speed</p>
                    <h3 className="mt-2 text-4xl font-black">234</h3>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">stitches/day</p>
                  </div>
                  <div className="rounded-lg bg-info p-2">
                    <Zap className="h-5 w-5 text-info-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Buttons & Badges - Bold */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="rounded-lg font-bold shadow-lg" size="lg">Primary Action</Button>
            <Button variant="outline" className="rounded-lg border-2 font-bold" size="lg">Secondary Action</Button>
            <Badge className="rounded-md bg-success px-3 py-1 text-xs font-bold uppercase text-success-foreground">Completed</Badge>
            <Badge className="rounded-md bg-warning px-3 py-1 text-xs font-bold uppercase text-warning-foreground">Active</Badge>
          </div>

          {/* Empty State - Bold */}
          <Card className="mt-6 border-2 shadow-md">
            <CardContent className="py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="mt-4 text-xl font-bold">No projects yet</h3>
              <p className="mt-2 text-sm font-medium text-muted-foreground">Create your first project to get started</p>
              <Button className="mt-6 rounded-lg font-bold shadow-lg" size="lg">Create Project</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Style 4: Glass & Blur */}
      <section className="space-y-4">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="text-2xl font-bold">4. Glass & Blur (современный)</h2>
          <p className="text-sm text-muted-foreground">
            Glassmorphism, размытие, полупрозрачность, воздушный вид
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-primary/5 p-8 backdrop-blur-sm">
          {/* Stats Cards - Glass */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border border-border/50 bg-background/60 shadow-lg backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Stitches</p>
                    <h3 className="mt-2 text-3xl font-bold">12,450</h3>
                    <p className="mt-1 text-xs text-muted-foreground">+12% from last week</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2 backdrop-blur-sm">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-background/60 shadow-lg backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Projects</p>
                    <h3 className="mt-2 text-3xl font-bold">8</h3>
                    <p className="mt-1 text-xs text-muted-foreground">4 in progress</p>
                  </div>
                  <div className="rounded-lg bg-success/10 p-2 backdrop-blur-sm">
                    <Target className="h-5 w-5 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-background/60 shadow-lg backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Speed</p>
                    <h3 className="mt-2 text-3xl font-bold">234</h3>
                    <p className="mt-1 text-xs text-muted-foreground">stitches per day</p>
                  </div>
                  <div className="rounded-lg bg-info/10 p-2 backdrop-blur-sm">
                    <Zap className="h-5 w-5 text-info" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Buttons & Badges - Glass */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="rounded-lg border border-border/50 bg-primary/90 shadow-lg backdrop-blur-sm">
              Primary Action
            </Button>
            <Button
              variant="outline"
              className="rounded-lg border-border/50 bg-background/60 backdrop-blur-sm"
            >
              Secondary Action
            </Button>
            <Badge className="rounded-full border border-success/20 bg-success/10 text-success backdrop-blur-sm">
              Completed
            </Badge>
            <Badge className="rounded-full border border-info/20 bg-info/10 text-info backdrop-blur-sm">
              In Progress
            </Badge>
          </div>

          {/* Empty State - Glass */}
          <Card className="mt-6 border border-border/50 bg-background/60 shadow-lg backdrop-blur-md">
            <CardContent className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-3 text-lg font-semibold">No projects yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create your first project to get started</p>
              <Button className="mt-4 rounded-lg border border-border/50 bg-primary/90 shadow-lg backdrop-blur-sm" size="sm">
                Create Project
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Decision */}
      <section className="rounded-xl border-2 border-primary bg-primary/5 p-8 text-center">
        <h2 className="text-2xl font-bold">Какой стиль нравится?</h2>
        <p className="mt-2 text-muted-foreground">
          Посмотри все варианты и скажи, какой больше подходит для проекта
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button size="lg">1. Minimal Clean</Button>
          <Button size="lg" variant="outline">2. Soft & Rounded</Button>
          <Button size="lg" variant="outline">3. Bold & Modern</Button>
          <Button size="lg" variant="outline">4. Glass & Blur</Button>
        </div>
      </section>
    </div>
  );
}
