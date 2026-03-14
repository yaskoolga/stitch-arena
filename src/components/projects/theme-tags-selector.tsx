"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PROJECT_THEMES, MAX_THEMES_PER_PROJECT } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeTagsSelectorProps {
  value: string[];
  onChange: (themes: string[]) => void;
  maxTags?: number;
  className?: string;
}

export function ThemeTagsSelector({
  value = [],
  onChange,
  maxTags = MAX_THEMES_PER_PROJECT,
  className,
}: ThemeTagsSelectorProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const availableThemes = PROJECT_THEMES.filter((theme) => !value.includes(theme));
  const canAddMore = value.length < maxTags;

  const handleAdd = (theme: string) => {
    if (canAddMore && !value.includes(theme)) {
      onChange([...value, theme]);
    }
  };

  const handleRemove = (theme: string) => {
    onChange(value.filter((t) => t !== theme));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected themes */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((theme) => (
            <Badge key={theme} variant="secondary" className="pl-2 pr-1">
              {t(`themes.${theme}` as any)}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => handleRemove(theme)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add button and dropdown */}
      {canAddMore && (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            disabled={availableThemes.length === 0}
          >
            {t("projects.fields.addTheme")} ({value.length}/{maxTags})
          </Button>

          {isOpen && availableThemes.length > 0 && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown */}
              <div className="absolute z-20 mt-1 w-64 max-h-60 overflow-auto rounded-md border bg-popover p-2 shadow-md">
                <div className="grid grid-cols-2 gap-2">
                  {availableThemes.map((theme) => (
                    <Button
                      key={theme}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        handleAdd(theme);
                        setIsOpen(false);
                      }}
                    >
                      {t(`themes.${theme}` as any)}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {!canAddMore && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxTags} themes reached
        </p>
      )}
    </div>
  );
}
