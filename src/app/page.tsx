"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart2, Users, BookOpen, Sparkles, Plus, Camera, Wand2, TrendingUp, ArrowRight } from "lucide-react";

export default function Home() {
  const t = useTranslations('landing');
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Show loading state while checking auth
  if (status === "loading" || status === "authenticated") {
    return null;
  }

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

  // Example projects for showcase
  const showcaseProjects = [
    {
      id: 1,
      title: t('showcase.project1.title'),
      description: t('showcase.project1.description'),
      progress: 75,
      image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&h=800&fit=crop",
      status: "in_progress" as const,
    },
    {
      id: 2,
      title: t('showcase.project2.title'),
      description: t('showcase.project2.description'),
      progress: 100,
      image: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800&h=800&fit=crop",
      status: "completed" as const,
    },
    {
      id: 3,
      title: t('showcase.project3.title'),
      description: t('showcase.project3.description'),
      progress: 45,
      image: "https://images.unsplash.com/photo-1517677129300-07b130802f46?w=800&h=800&fit=crop",
      status: "in_progress" as const,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section with Video Background */}
      <section className="relative h-[600px] sm:h-[700px] lg:h-[800px] flex items-center justify-center overflow-hidden">
        {/* Fallback Background (gradient) - shows if video doesn't load */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-success/20 to-info/30" />

        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // Hide video if it fails to load, fallback gradient will show
            e.currentTarget.style.display = 'none';
          }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
          <source src="/videos/hero.webm" type="video/webm" />
        </video>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-white/90 drop-shadow-md">
            {t('subtitle')}
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full w-full sm:w-auto text-base sm:text-lg px-8 py-6 shadow-xl">
                {t('getStarted')}
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-full sm:w-auto text-base sm:text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white shadow-xl"
              >
                {t('signIn')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('howItWorks.title')}</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg">
                  <Plus className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-primary text-sm font-bold text-primary">
                  1
                </div>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{t('howItWorks.step1.title')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t('howItWorks.step1.description')}</p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-success/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-success shadow-lg">
                  <Camera className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-success text-sm font-bold text-success">
                  2
                </div>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{t('howItWorks.step2.title')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t('howItWorks.step2.description')}</p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-info/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-info shadow-lg">
                  <Wand2 className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-info text-sm font-bold text-info">
                  3
                </div>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{t('howItWorks.step3.title')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t('howItWorks.step3.description')}</p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-warning/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-warning shadow-lg">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-warning text-sm font-bold text-warning">
                  4
                </div>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{t('howItWorks.step4.title')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t('howItWorks.step4.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('showcase.title')}</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('showcase.subtitle')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {showcaseProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all group">
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={project.status === "completed" ? "default" : "secondary"}
                      className="rounded-full shadow-lg"
                    >
                      {project.status === "completed" ? t('showcase.completed') : t('showcase.inProgress')}
                    </Badge>
                  </div>
                </div>

                <CardContent className="pt-5 pb-6">
                  <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{project.description}</p>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('showcase.progress')}</span>
                      <span className="font-semibold">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA to Gallery */}
          <div className="mt-12 text-center">
            <Link href="/gallery">
              <Button size="lg" variant="outline" className="rounded-full group">
                {t('showcase.viewMore')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics/Social Proof Section */}
      <section className="py-16 sm:py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('stats.title')}</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('stats.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stat 1: Projects */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-xl">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-primary font-bold">
                10,000+
              </div>
              <p className="mt-2 text-base text-muted-foreground font-medium">{t('stats.projects')}</p>
            </div>

            {/* Stat 2: Stitches */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-success/20 rounded-full blur-2xl" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-success shadow-xl">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-success font-bold">
                50M+
              </div>
              <p className="mt-2 text-base text-muted-foreground font-medium">{t('stats.stitches')}</p>
            </div>

            {/* Stat 3: Users */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-info/20 rounded-full blur-2xl" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-info shadow-xl">
                  <Users className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-info font-bold">
                5,000+
              </div>
              <p className="mt-2 text-base text-muted-foreground font-medium">{t('stats.users')}</p>
            </div>

            {/* Stat 4: Accuracy */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-warning/20 rounded-full blur-2xl" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-warning shadow-xl">
                  <Wand2 className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-warning font-bold">
                95%
              </div>
              <p className="mt-2 text-base text-muted-foreground font-medium">{t('stats.accuracy')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="rounded-2xl bg-primary/5 border-primary/10">
            <CardContent className="px-6 py-12 sm:px-12 sm:py-16 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                {t('cta.title')}
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('cta.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="rounded-full text-base sm:text-lg px-8 py-6 w-full sm:w-auto shadow-sm"
                  >
                    {t('cta.getStarted')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full text-base sm:text-lg px-8 py-6 w-full sm:w-auto"
                  >
                    {t('cta.browseGallery')}
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 pt-8 border-t border-border">
                <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                      <Sparkles className="h-4 w-4 text-success" />
                    </div>
                    <span>{t('cta.feature1')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-info/10">
                      <Users className="h-4 w-4 text-info" />
                    </div>
                    <span>{t('cta.feature2')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/10">
                      <BookOpen className="h-4 w-4 text-warning" />
                    </div>
                    <span>{t('cta.feature3')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
