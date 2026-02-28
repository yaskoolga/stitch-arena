import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ACHIEVEMENTS, RARITY_CONFIG } from "@/lib/constants";

interface UnlockedAchievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: string;
}

export function useAchievementCheck() {
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const checkAchievements = useCallback(async () => {
    try {
      // Call API to check and unlock new achievements
      const response = await fetch("/api/achievements", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to check achievements");
      }

      const data = await response.json();
      const unlocked = data.newlyUnlocked || [];

      if (unlocked.length > 0) {
        // Invalidate queries to refresh achievement data
        queryClient.invalidateQueries({ queryKey: ["achievements"] });
        queryClient.invalidateQueries({ queryKey: ["stats-overall"] });

        // Show toast notifications for each achievement
        unlocked.forEach((achievement: UnlockedAchievement) => {
          const achievementDef = Object.values(ACHIEVEMENTS).find(
            (a) => a.id === achievement.id
          );

          if (achievementDef) {
            const rarityConfig = RARITY_CONFIG[achievementDef.rarity];

            toast.success(
              `${achievement.emoji} Achievement Unlocked!`,
              {
                description: `${achievement.name} - ${rarityConfig.emoji} ${rarityConfig.name}`,
                duration: 5000,
              }
            );
          }
        });

        // Set new achievements for celebration modal
        setNewAchievements(unlocked.map((a: UnlockedAchievement) => a.id));

        return unlocked;
      }

      return [];
    } catch (error) {
      console.error("Error checking achievements:", error);
      return [];
    }
  }, [queryClient]);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  return {
    checkAchievements,
    newAchievements,
    clearNewAchievements,
    hasNewAchievements: newAchievements.length > 0,
  };
}
