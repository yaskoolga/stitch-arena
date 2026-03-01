"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
        toast.success(t("auth.resetEmailSent"));
      } else {
        const data = await res.json();
        toast.error(data.error || t("auth.errors.generic"));
      }
    } catch (error) {
      toast.error(t("auth.errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="bg-info/5 rounded-t-2xl border-b border-info/10">
          <CardTitle className="text-2xl">{t("auth.resetPassword")}</CardTitle>
          <CardDescription>
            {sent
              ? t("auth.resetEmailSent")
              : "Enter your email and we'll send you a link to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {!sent ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="rounded-full"
                />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? t("common.loading") : t("auth.sendResetLink")}
              </Button>
            </form>
          ) : (
            <div className="rounded-xl bg-success/10 border border-success/20 p-4">
              <p className="text-sm text-success-foreground">
                ✓ Check your email for a password reset link. It may take a few minutes to arrive.
              </p>
            </div>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t("auth.backToLogin")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
