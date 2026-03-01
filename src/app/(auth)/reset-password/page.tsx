"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

function ResetPasswordContent() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success("Password reset successfully!");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toast.error(data.error || t("auth.errors.generic"));
      }
    } catch (error) {
      toast.error(t("auth.errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return null;
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="bg-warning/5 rounded-t-2xl border-b border-warning/10">
          <CardTitle className="text-2xl">{t("auth.resetPassword")}</CardTitle>
          <CardDescription>
            {success
              ? "Password reset successfully! Redirecting to login..."
              : "Enter your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {!success ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  className="rounded-full"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Confirm your password"
                  className="rounded-full"
                />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? t("common.loading") : t("auth.resetPassword")}
              </Button>
            </form>
          ) : (
            <div className="rounded-xl bg-success/10 border border-success/20 p-4 text-center">
              <p className="text-sm text-success-foreground">
                ✓ Redirecting to login page...
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
