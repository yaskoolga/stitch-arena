"use client";

import { StatsCard, EmptyState, Badge } from "@/components/design";
import { FadeIn, SlideIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Target,
  Zap,
  TrendingUp,
  BookOpen,
  Star,
  Flame,
  Heart,
  Award,
  CheckCircle2,
} from "lucide-react";

export default function DesignDemoPage() {
  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-4xl font-bold">🎨 Soft & Rounded Design</h1>
          <p className="mt-2 text-muted-foreground">
            Мягкий и уютный дизайн с пастельными цветами
          </p>
        </div>
      </FadeIn>

      {/* Stats Cards */}
      <section>
        <SlideIn delay={0.1}>
          <h2 className="mb-4 text-2xl font-bold">Stats Cards</h2>
        </SlideIn>

        <StaggerContainer staggerDelay={0.05} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatsCard
              title="Total Stitches"
              value={12450}
              icon={Activity}
              trend={{ value: 12, label: "vs last week" }}
              color="primary"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Projects"
              value={8}
              icon={Target}
              description="4 in progress"
              color="success"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Avg Speed"
              value="234/day"
              icon={Zap}
              trend={{ value: 8 }}
              color="info"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Streak"
              value="12 days"
              icon={TrendingUp}
              trend={{ value: -2 }}
              color="warning"
            />
          </StaggerItem>
        </StaggerContainer>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Achievements"
            value={16}
            icon={Award}
            description="All unlocked!"
            color="success"
          />
          <StatsCard
            title="Completion"
            value="98%"
            icon={CheckCircle2}
            trend={{ value: 5 }}
            color="info"
          />
          <StatsCard
            title="Total Likes"
            value={2450}
            icon={Heart}
            trend={{ value: 15 }}
            color="destructive"
          />
        </div>
      </section>

      {/* Badges */}
      <section>
        <SlideIn delay={0.2}>
          <h2 className="mb-4 text-2xl font-bold">Badges</h2>
        </SlideIn>

        <FadeIn delay={0.3}>
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Badge Variants (Pastel Style)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="ghost">Ghost</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge size="sm" variant="success">Small</Badge>
                <Badge size="md" variant="info">Medium</Badge>
                <Badge size="lg" variant="warning">Large</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="success" icon={<Star className="h-3 w-3" />}>
                  With Icon
                </Badge>
                <Badge variant="info" dot>
                  Live
                </Badge>
                <Badge variant="warning" icon={<Flame className="h-3 w-3" />} size="lg">
                  Hot!
                </Badge>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </section>

      {/* Empty States */}
      <section>
        <SlideIn delay={0.3}>
          <h2 className="mb-4 text-2xl font-bold">Empty States</h2>
        </SlideIn>

        <div className="grid gap-4 md:grid-cols-2">
          <FadeIn delay={0.4}>
            <Card className="rounded-2xl shadow-sm">
              <EmptyState
                icon={BookOpen}
                title="No projects yet"
                description="Create your first cross-stitch project to get started!"
                action={<Button className="rounded-full shadow-sm">Create Project</Button>}
                color="primary"
              />
            </Card>
          </FadeIn>

          <FadeIn delay={0.5}>
            <Card className="rounded-2xl shadow-sm">
              <EmptyState
                icon={Activity}
                title="No activity"
                description="Start stitching to see your progress here"
                variant="compact"
                color="info"
              />
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <SlideIn delay={0.4}>
          <h2 className="mb-4 text-2xl font-bold">Buttons</h2>
        </SlideIn>

        <FadeIn delay={0.5}>
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-full shadow-sm">Primary Rounded</Button>
                <Button variant="outline" className="rounded-full">Secondary Rounded</Button>
                <Button variant="ghost" className="rounded-full">Ghost Rounded</Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="rounded-full shadow-sm">Small</Button>
                <Button size="default" className="rounded-full shadow-sm">Default</Button>
                <Button size="lg" className="rounded-full shadow-sm">Large</Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </section>

      {/* Hover Effects */}
      <section>
        <SlideIn delay={0.5}>
          <h2 className="mb-4 text-2xl font-bold">Hover Effects</h2>
        </SlideIn>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl shadow-sm hover-lift cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="icon-circle-primary">
                  <Star className="h-4 w-4" />
                </div>
                Hover Lift
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gentle lift on hover with soft shadow
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-soft-primary cursor-pointer transition-smooth hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="icon-circle-success">
                  <Heart className="h-4 w-4" />
                </div>
                Pastel BG
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Soft pastel background with hover
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-soft-info cursor-pointer transition-smooth hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="icon-circle-info">
                  <Zap className="h-4 w-4" />
                </div>
                Soft Colors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Calm and cozy color scheme
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Icon Circles */}
      <section>
        <SlideIn delay={0.6}>
          <h2 className="mb-4 text-2xl font-bold">Icon Circles</h2>
        </SlideIn>

        <FadeIn delay={0.7}>
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Pastel Icon Backgrounds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="icon-circle-primary">
                  <Star className="h-5 w-5" />
                </div>
                <div className="icon-circle-success">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="icon-circle-warning">
                  <Flame className="h-5 w-5" />
                </div>
                <div className="icon-circle-info">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </section>

      {/* Summary */}
      <section>
        <FadeIn delay={0.8}>
          <Card className="rounded-2xl border-2 border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Soft & Rounded Design</h2>
              <p className="mt-2 text-muted-foreground">
                Мягкие скругленные углы • Пастельные цвета • Уютный вид
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Badge variant="success">Без градиентов ✓</Badge>
                <Badge variant="info">Rounded-2xl ✓</Badge>
                <Badge variant="warning">Pastel colors ✓</Badge>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </section>
    </div>
  );
}
