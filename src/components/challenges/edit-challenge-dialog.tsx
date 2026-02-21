"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { challengeUpdateSchema } from "@/lib/validations";

type ChallengeFormData = z.infer<typeof challengeUpdateSchema>;

interface EditChallengeDialogProps {
  challengeId: string;
  challenge: {
    type: string;
    title: string;
    description?: string | null;
    startDate: string | Date;
    endDate: string | Date;
    targetValue: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditChallengeDialog({
  challengeId,
  challenge,
  open,
  onOpenChange,
  onSuccess,
}: EditChallengeDialogProps) {
  const t = useTranslations("challenges");
  const tCommon = useTranslations("common");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeUpdateSchema),
    defaultValues: {
      type: challenge.type as any,
      title: challenge.title,
      description: challenge.description || "",
      startDate: format(new Date(challenge.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(challenge.endDate), "yyyy-MM-dd"),
      targetValue: challenge.targetValue,
    },
  });

  // Reset form when challenge changes
  useEffect(() => {
    form.reset({
      type: challenge.type as any,
      title: challenge.title,
      description: challenge.description || "",
      startDate: format(new Date(challenge.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(challenge.endDate), "yyyy-MM-dd"),
      targetValue: challenge.targetValue,
    });
  }, [challenge, form]);

  const watchedType = form.watch("type");
  const watchedStartDate = form.watch("startDate");
  const watchedEndDate = form.watch("endDate");

  // Calculate duration
  const duration =
    watchedStartDate && watchedEndDate
      ? differenceInDays(new Date(watchedEndDate), new Date(watchedStartDate)) + 1
      : 0;

  // Get target value range based on type
  const getTargetValueHint = (type?: string) => {
    if (!type) return "";
    switch (type) {
      case "speed":
        return t("form.targetValueHint.speed", { min: 1000, max: 100000 });
      case "streak":
        return t("form.targetValueHint.streak", { min: 3, max: 365 });
      case "completion":
        return t("form.targetValueHint.completion", { min: 1, max: 50 });
      default:
        return "";
    }
  };

  const onSubmit = async (data: ChallengeFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update challenge");
      }

      toast.success(t("edit.success"));
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating challenge:", error);
      toast.error(t("errors.createFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("edit.title")}</DialogTitle>
          <DialogDescription>
            {t("form.descriptionDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.type")}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="speed" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t("types.speed")} - {t("types.speedDescription")}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="streak" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t("types.streak")} - {t("types.streakDescription")}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="completion" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t("types.completion")} - {t("types.completionDescription")}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.title")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("form.titlePlaceholder")} {...field} />
                  </FormControl>
                  <FormDescription>{t("form.titleDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("form.descriptionPlaceholder")}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>{t("form.descriptionDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.startDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.endDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {duration > 0 && (
              <div className="text-sm text-muted-foreground">
                {t("form.duration", { days: duration })}
              </div>
            )}

            <FormField
              control={form.control}
              name="targetValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.targetValue")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>{getTargetValueHint(watchedType)}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t("form.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {tCommon("save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
