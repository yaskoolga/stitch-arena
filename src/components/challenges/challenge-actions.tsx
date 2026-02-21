"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChallengeActionsProps {
  challengeId: string;
  isCreator: boolean;
  canEdit: boolean;
  canDelete: boolean;
  editReason?: string;
  deleteReason?: string;
  onEditClick?: () => void;
}

export function ChallengeActions({
  challengeId,
  isCreator,
  canEdit,
  canDelete,
  editReason,
  deleteReason,
  onEditClick,
}: ChallengeActionsProps) {
  const t = useTranslations("challenges");
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isCreator) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete challenge");
      }

      toast.success(t("delete.success"));

      router.push("/challenges");
      router.refresh();
    } catch (error) {
      console.error("Error deleting challenge:", error);
      toast.error(t("errors.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="outline"
                size="sm"
                disabled={!canEdit}
                onClick={onEditClick}
              >
                <Edit className="h-4 w-4 mr-2" />
                {t("edit.button")}
              </Button>
            </div>
          </TooltipTrigger>
          {!canEdit && editReason && (
            <TooltipContent>
              <p>{editReason}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <AlertDialog>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canDelete || isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    {t("delete.button")}
                  </Button>
                </AlertDialogTrigger>
              </div>
            </TooltipTrigger>
            {!canDelete && deleteReason && (
              <TooltipContent>
                <p>{deleteReason}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete.confirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("delete.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t("delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
