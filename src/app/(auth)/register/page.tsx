"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";

// Cross-stitch quiz questions for spam protection
// Correctanswers are hardcoded, but questions/options are translated
const QUIZ_CONFIG = [
  {
    questionKey: "auth.quiz.q1.question",
    options: ["a1", "a2", "a3", "a4"],
    correctAnswer: "aida",
    answerMap: { aida: "a1", cotton: "a2", silk: "a3", denim: "a4" }
  },
  {
    questionKey: "auth.quiz.q2.question",
    options: ["a1", "a2", "a3", "a4"],
    correctAnswer: "2",
    answerMap: { "1": "a1", "2": "a2", "6": "a3", "10": "a4" }
  },
  {
    questionKey: "auth.quiz.q3.question",
    options: ["a1", "a2", "a3", "a4"],
    correctAnswer: "chart",
    answerMap: { chart: "a1", map: "a2", blueprint: "a3", recipe: "a4" }
  },
];

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = account info, 2 = quiz
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

  function handleNextStep(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    setFormData({
      name: form.get("name") as string,
      email: form.get("email") as string,
      password: form.get("password") as string,
    });

    setStep(2);
  }

  async function handleFinalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate quiz answers (at least 2 out of 3 correct)
    const correctCount = QUIZ_CONFIG.filter(
      (q, idx) => quizAnswers[idx] === q.correctAnswer
    ).length;

    if (correctCount < 2) {
      setError(t("auth.quiz.quizError"));
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || t("toast.error.registerFailed"));
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-2xl rounded-2xl shadow-lg">
        <CardHeader className="bg-success/5 rounded-t-2xl border-b border-success/10">
          <CardTitle className="text-2xl">{t("auth.registerTitle")}</CardTitle>
          <CardDescription>
            {step === 1 ? t("auth.quiz.step1") : t("auth.quiz.step2")}
          </CardDescription>
          <Progress value={step === 1 ? 50 : 100} className="mt-3 rounded-full" />
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 1 ? (
            // Step 1: Account Information
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={formData.name}
                  placeholder={t("auth.name")}
                  className="rounded-full"
                />
              </div>
              <div>
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={formData.email}
                  placeholder={t("auth.email")}
                  className="rounded-full"
                />
              </div>
              <div>
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  defaultValue={formData.password}
                  placeholder={t("auth.password")}
                  className="rounded-full"
                />
              </div>
              <Button type="submit" className="w-full rounded-full">
                {t("auth.quiz.nextQuiz")}
              </Button>
            </form>
          ) : (
            // Step 2: Cross-Stitch Quiz
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 text-sm">
                <p className="font-medium">{t("auth.quiz.quizTitle")}</p>
                <p className="mt-1 text-muted-foreground">
                  {t("auth.quiz.quizDescription")}
                </p>
              </div>

              {QUIZ_CONFIG.map((q, idx) => (
                <div key={idx} className="space-y-3">
                  <Label className="text-base font-medium">
                    {idx + 1}. {t(q.questionKey)}
                  </Label>
                  <RadioGroup
                    value={quizAnswers[idx] || ""}
                    onValueChange={(value) =>
                      setQuizAnswers((prev) => ({ ...prev, [idx]: value }))
                    }
                    required
                  >
                    {q.options.map((optKey) => {
                      // Find the value for this option
                      const value = Object.keys(q.answerMap).find(k => q.answerMap[k as keyof typeof q.answerMap] === optKey) || optKey;
                      return (
                        <div key={value} className="flex items-center space-x-2">
                          <RadioGroupItem value={value} id={`q${idx}-${value}`} />
                          <Label htmlFor={`q${idx}-${value}`} className="font-normal cursor-pointer">
                            {t(`auth.quiz.q${idx + 1}.${optKey}`)}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              ))}

              <div className="space-y-3">
                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading ? t("common.loading") : t("auth.signUp")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t("common.back")}
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">{t("auth.signIn")}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
