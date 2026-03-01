"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface ReportButtonProps {
  type: "comment" | "project" | "user" | "dailyLog";
  resourceId: string;
  reportedUserId?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ReportButton({
  type,
  resourceId,
  reportedUserId,
  variant = "ghost",
  size = "sm",
}: ReportButtonProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error(t("report.pleaseSelectReason"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          reason,
          description,
          resourceId,
          reportedUserId,
        }),
      });

      if (res.ok) {
        toast.success(t("report.submitted"));
        setOpen(false);
        setReason("");
        setDescription("");
      } else {
        const data = await res.json();
        toast.error(data.error || t("report.failed"));
      }
    } catch (error) {
      console.error("Failed to submit report:", error);
      toast.error(t("report.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={size === "icon" ? "rounded-full" : "rounded-full"}
      >
        <Flag className="h-4 w-4" />
        {size !== "icon" && <span className="ml-2">{t("report.button")}</span>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("report.title")}</DialogTitle>
            <DialogDescription>{t("report.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">{t("report.reason")}</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder={t("report.selectReason")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">{t("report.reasons.spam")}</SelectItem>
                  <SelectItem value="inappropriate">
                    {t("report.reasons.inappropriate")}
                  </SelectItem>
                  <SelectItem value="harassment">
                    {t("report.reasons.harassment")}
                  </SelectItem>
                  <SelectItem value="other">{t("report.reasons.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">{t("report.details")}</Label>
              <Textarea
                id="description"
                placeholder={t("report.detailsPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-full"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-full"
            >
              {loading ? t("common.loading") : t("report.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
