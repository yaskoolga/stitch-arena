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
const QUIZ_QUESTIONS = [
  {
    question: "What fabric is most commonly used for cross-stitch?",
    options: [
      { value: "aida", label: "Aida cloth" },
      { value: "cotton", label: "Regular cotton" },
      { value: "silk", label: "Silk fabric" },
      { value: "denim", label: "Denim jeans" },
    ],
    correctAnswer: "aida",
  },
  {
    question: "How many strands of embroidery floss are typically used for one cross-stitch?",
    options: [
      { value: "1", label: "1 strand" },
      { value: "2", label: "2 strands" },
      { value: "6", label: "6 strands (all)" },
      { value: "10", label: "10 strands" },
    ],
    correctAnswer: "2",
  },
  {
    question: "What is the term for the base pattern you follow when stitching?",
    options: [
      { value: "chart", label: "Chart or pattern" },
      { value: "map", label: "Treasure map" },
      { value: "blueprint", label: "Building blueprint" },
      { value: "recipe", label: "Cooking recipe" },
    ],
    correctAnswer: "chart",
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
    const correctCount = QUIZ_QUESTIONS.filter(
      (q, idx) => quizAnswers[idx] === q.correctAnswer
    ).length;

    if (correctCount < 2) {
      setError("Please answer the cross-stitch questions correctly. This helps us ensure you're a real stitcher! 🧵");
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
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{t("auth.registerTitle")}</CardTitle>
          <CardDescription>
            {step === 1 ? "Step 1 of 2: Basic Information" : "Step 2 of 2: Quick Cross-Stitch Quiz"}
          </CardDescription>
          <Progress value={step === 1 ? 50 : 100} className="mt-2" />
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
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
                />
              </div>
              <Button type="submit" className="w-full">
                Next: Cross-Stitch Quiz →
              </Button>
            </form>
          ) : (
            // Step 2: Cross-Stitch Quiz
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="rounded-md bg-muted/50 p-4 text-sm">
                <p className="font-medium">🧵 Quick Quiz: Are you a cross-stitcher?</p>
                <p className="mt-1 text-muted-foreground">
                  Answer at least 2 out of 3 questions correctly. This helps us keep the community genuine!
                </p>
              </div>

              {QUIZ_QUESTIONS.map((q, idx) => (
                <div key={idx} className="space-y-3">
                  <Label className="text-base font-medium">
                    {idx + 1}. {q.question}
                  </Label>
                  <RadioGroup
                    value={quizAnswers[idx] || ""}
                    onValueChange={(value) =>
                      setQuizAnswers((prev) => ({ ...prev, [idx]: value }))
                    }
                    required
                  >
                    {q.options.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`q${idx}-${option.value}`} />
                        <Label htmlFor={`q${idx}-${option.value}`} className="font-normal cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t("common.cancel")}
                </Button>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("common.loading") : t("auth.signUp")}
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="underline">{t("auth.signIn")}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
