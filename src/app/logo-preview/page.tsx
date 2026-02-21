"use client";

import { Logo, LogoHoop, LogoNeedle } from "@/components/ui/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LogoPreviewPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Logo Variants</h1>
          <p className="text-muted-foreground">Choose your favorite design</p>
        </div>
      </div>

      {/* Variant 1: Cross-Stitch with Thread */}
      <Card>
        <CardHeader>
          <CardTitle>1. Cross-Stitch with Thread (Current)</CardTitle>
          <CardDescription>
            Minimalistic X with decorative stitches and connecting thread
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Light background */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Light background:</p>
            <div className="bg-background border rounded-lg p-8 flex flex-wrap items-center gap-8">
              <Logo size={32} showText={true} />
              <Logo size={48} showText={false} />
              <Logo size={64} showText={false} />
              <Logo size={80} showText={false} />
            </div>
          </div>

          {/* Dark background */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Dark background:</p>
            <div className="bg-card border rounded-lg p-8 flex flex-wrap items-center gap-8">
              <Logo size={32} showText={true} />
              <Logo size={48} showText={false} />
              <Logo size={64} showText={false} />
              <Logo size={80} showText={false} />
            </div>
          </div>

          {/* With gradient background */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">On gradient:</p>
            <div className="bg-gradient-to-br from-primary/10 via-background to-background border rounded-lg p-8 flex flex-wrap items-center gap-8">
              <Logo size={32} showText={true} />
              <Logo size={48} showText={false} />
              <Logo size={64} showText={false} />
              <Logo size={80} showText={false} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variant 2: Embroidery Hoop */}
      <Card>
        <CardHeader>
          <CardTitle>2. Embroidery Hoop</CardTitle>
          <CardDescription>
            Classic hoop with cross-stitch pattern inside
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Light background */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Light background:</p>
            <div className="bg-background border rounded-lg p-8 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <LogoHoop size={40} />
                <div className="flex flex-col">
                  <span className="font-bold text-xl leading-none bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    StitchArena
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    Track your progress
                  </span>
                </div>
              </div>
              <LogoHoop size={48} />
              <LogoHoop size={64} />
              <LogoHoop size={80} />
            </div>
          </div>

          {/* Dark background */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Dark background:</p>
            <div className="bg-card border rounded-lg p-8 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <LogoHoop size={40} />
                <div className="flex flex-col">
                  <span className="font-bold text-xl leading-none bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    StitchArena
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    Track your progress
                  </span>
                </div>
              </div>
              <LogoHoop size={48} />
              <LogoHoop size={64} />
              <LogoHoop size={80} />
            </div>
          </div>

          {/* With gradient background */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">On gradient:</p>
            <div className="bg-gradient-to-br from-primary/10 via-background to-background border rounded-lg p-8 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <LogoHoop size={40} />
                <div className="flex flex-col">
                  <span className="font-bold text-xl leading-none bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    StitchArena
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    Track your progress
                  </span>
                </div>
              </div>
              <LogoHoop size={48} />
              <LogoHoop size={64} />
              <LogoHoop size={80} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variant 3: Needle and Thread */}
      <Card>
        <CardHeader>
          <CardTitle>3. Needle and Thread</CardTitle>
          <CardDescription>
            Elegant needle with thread forming an S-curve
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Light background */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Light background:</p>
            <div className="bg-background border rounded-lg p-8 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <LogoNeedle size={40} />
                <div className="flex flex-col">
                  <span className="font-bold text-xl leading-none bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    StitchArena
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    Track your progress
                  </span>
                </div>
              </div>
              <LogoNeedle size={48} />
              <LogoNeedle size={64} />
              <LogoNeedle size={80} />
            </div>
          </div>

          {/* Dark background */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Dark background:</p>
            <div className="bg-card border rounded-lg p-8 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <LogoNeedle size={40} />
                <div className="flex flex-col">
                  <span className="font-bold text-xl leading-none bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    StitchArena
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    Track your progress
                  </span>
                </div>
              </div>
              <LogoNeedle size={48} />
              <LogoNeedle size={64} />
              <LogoNeedle size={80} />
            </div>
          </div>

          {/* With gradient background */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">On gradient:</p>
            <div className="bg-gradient-to-br from-primary/10 via-background to-background border rounded-lg p-8 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <LogoNeedle size={40} />
                <div className="flex flex-col">
                  <span className="font-bold text-xl leading-none bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    StitchArena
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    Track your progress
                  </span>
                </div>
              </div>
              <LogoNeedle size={48} />
              <LogoNeedle size={64} />
              <LogoNeedle size={80} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <p className="font-medium">💡 How to change the logo:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
              <li>
                Open <code className="bg-background px-1.5 py-0.5 rounded">src/components/layout/header.tsx</code>
              </li>
              <li>
                Replace <code className="bg-background px-1.5 py-0.5 rounded">&lt;Logo /&gt;</code> with:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li><code className="bg-background px-1.5 py-0.5 rounded">&lt;LogoHoop /&gt;</code> for Embroidery Hoop</li>
                  <li><code className="bg-background px-1.5 py-0.5 rounded">&lt;LogoNeedle /&gt;</code> for Needle and Thread</li>
                </ul>
              </li>
              <li>
                Wrap it with text if needed (see examples above)
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
