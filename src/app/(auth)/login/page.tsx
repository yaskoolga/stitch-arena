"use client";

import { useState } from "react";
import { signIn, getProviders } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: providers } = useQuery({
    queryKey: ["auth-providers"],
    queryFn: () => getProviders(),
  });

  const hasGoogle = !!providers?.google;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (res?.error) {
      // Map specific errors to translations
      const errorMessage = res.error.includes("No user found")
        ? t("auth.errors.userNotFound")
        : res.error.includes("Invalid password")
        ? t("auth.errors.invalidPassword")
        : res.error.includes("sign in with Google")
        ? t("auth.errors.useGoogle")
        : t("auth.errors.generic");

      setError(errorMessage);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.signIn")}</CardTitle>
        </CardHeader>
        <CardContent>
          {hasGoogle && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                {t("auth.signInWith", { provider: "Google" })}
              </Button>
              <div className="my-4 flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">{t("auth.orContinueWith")}</span>
                <Separator className="flex-1" />
              </div>
            </>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div>
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("common.loading") : t("auth.signIn")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="underline">{t("auth.signUp")}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
