"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Star } from "lucide-react";
import { RARITY_COLORS, RARITY_GRADIENTS, BadgeRarity } from "@/lib/badges/config";

interface BadgeData {
  key: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: string;
  earnedAt?: Date;
  isFeatured?: boolean;
}

export default function BadgesPage() {
  const { data: session } = useSession();
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForFeatured, setSelectedForFeatured] = useState<string[]>([]);
  const [isEditingFeatured, setIsEditingFeatured] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/badges");
      const data = await res.json();

      if (!res.ok || data.error) {
        console.error("Failed to fetch badges:", data.error);
        setBadges([]);
        return;
      }

      setBadges(data.badges || []);

      // Set currently featured badges
      const featured = (data.badges || [])
        .filter((b: BadgeData) => b.isFeatured)
        .map((b: BadgeData) => b.key);
      setSelectedForFeatured(featured);
    } catch (error) {
      console.error("Failed to fetch badges:", error);
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeatured = async () => {
    try {
      await fetch("/api/badges/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeKeys: selectedForFeatured }),
      });

      setIsEditingFeatured(false);
      fetchBadges();
    } catch (error) {
      console.error("Failed to update featured badges:", error);
    }
  };

  const toggleFeatured = (badgeKey: string) => {
    if (selectedForFeatured.includes(badgeKey)) {
      setSelectedForFeatured(selectedForFeatured.filter((k) => k !== badgeKey));
    } else if (selectedForFeatured.length < 5) {
      setSelectedForFeatured([...selectedForFeatured, badgeKey]);
    }
  };

  const earnedBadges = badges.filter((b) => b.earnedAt);
  const lockedBadges = badges.filter((b) => !b.earnedAt);

  const filterByCategory = (badgesList: BadgeData[]) => {
    if (activeCategory === "all") return badgesList;
    return badgesList.filter((b) => b.category === activeCategory);
  };

  const getRarityLabel = (rarity: BadgeRarity) => {
    const labels: Record<BadgeRarity, string> = {
      common: "Common",
      rare: "Rare",
      epic: "Epic",
      legendary: "Legendary",
    };
    return labels[rarity];
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading badges...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Sign in to view badges</h2>
          <p className="text-muted-foreground">
            You need to be logged in to see your badge collection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Badge Collection</h1>
        <p className="text-muted-foreground">
          Earn badges by completing achievements and participating in events
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 rounded-2xl bg-primary/5 border-primary/10">
          <div className="text-2xl font-bold">{earnedBadges.length}</div>
          <div className="text-sm text-muted-foreground">Total Badges</div>
        </Card>
        {["common", "rare", "epic", "legendary"].map((rarity) => {
          const count = earnedBadges.filter((b) => b.rarity === rarity).length;
          return (
            <Card
              key={rarity}
              className={`p-4 rounded-2xl bg-gradient-to-br ${
                RARITY_GRADIENTS[rarity as BadgeRarity]
              } bg-opacity-5 border-opacity-10`}
            >
              <div className="text-2xl font-bold">{count}</div>
              <div className={`text-sm ${RARITY_COLORS[rarity as BadgeRarity]}`}>
                {getRarityLabel(rarity as BadgeRarity)}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Featured Badges */}
      {earnedBadges.length > 0 && (
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Featured Badges</h2>
              <p className="text-sm text-muted-foreground">
                Select up to 5 badges to display on your profile
              </p>
            </div>
            {!isEditingFeatured ? (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setIsEditingFeatured(true)}
              >
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setIsEditingFeatured(false);
                    // Reset to current featured
                    const featured = badges
                      .filter((b) => b.isFeatured)
                      .map((b) => b.key);
                    setSelectedForFeatured(featured);
                  }}
                >
                  Cancel
                </Button>
                <Button className="rounded-full" onClick={handleSaveFeatured}>
                  Save
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {earnedBadges
              .filter((b) => b.isFeatured)
              .map((badge) => (
                <BadgeCard
                  key={badge.key}
                  badge={badge}
                  isEarned
                  isEditing={isEditingFeatured}
                  isSelected={selectedForFeatured.includes(badge.key)}
                  onToggle={() => toggleFeatured(badge.key)}
                />
              ))}
            {earnedBadges.filter((b) => b.isFeatured).length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No featured badges selected
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="rounded-full">
          <TabsTrigger value="all" className="rounded-full">
            All
          </TabsTrigger>
          <TabsTrigger value="achievement" className="rounded-full">
            Achievement
          </TabsTrigger>
          <TabsTrigger value="event" className="rounded-full">
            Event
          </TabsTrigger>
          <TabsTrigger value="special" className="rounded-full">
            Special
          </TabsTrigger>
          <TabsTrigger value="challenge" className="rounded-full">
            Challenge
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-6 mt-6">
          {/* Earned Badges */}
          {filterByCategory(earnedBadges).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Earned Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filterByCategory(earnedBadges).map((badge) => (
                  <BadgeCard
                    key={badge.key}
                    badge={badge}
                    isEarned
                    isEditing={isEditingFeatured}
                    isSelected={selectedForFeatured.includes(badge.key)}
                    onToggle={() => toggleFeatured(badge.key)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges */}
          {filterByCategory(lockedBadges).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Locked Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filterByCategory(lockedBadges).map((badge) => (
                  <BadgeCard key={badge.key} badge={badge} isEarned={false} />
                ))}
              </div>
            </div>
          )}

          {filterByCategory(earnedBadges).length === 0 &&
            filterByCategory(lockedBadges).length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No badges in this category
              </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface BadgeCardProps {
  badge: BadgeData;
  isEarned: boolean;
  isEditing?: boolean;
  isSelected?: boolean;
  onToggle?: () => void;
}

function BadgeCard({
  badge,
  isEarned,
  isEditing,
  isSelected,
  onToggle,
}: BadgeCardProps) {
  return (
    <Card
      className={`p-4 rounded-2xl relative transition-all ${
        isEarned
          ? `bg-gradient-to-br ${RARITY_GRADIENTS[badge.rarity]} bg-opacity-5 border-opacity-20 hover:scale-105`
          : "opacity-50 grayscale"
      } ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={() => isEditing && isEarned && onToggle?.()}
    >
      {isEditing && isEarned && (
        <div className="absolute top-2 right-2">
          <Checkbox checked={isSelected} />
        </div>
      )}

      {!isEarned && (
        <div className="absolute top-2 right-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {isSelected && !isEditing && (
        <div className="absolute top-2 right-2">
          <Star className="h-4 w-4 fill-primary text-primary" />
        </div>
      )}

      <div className="text-center space-y-2">
        <div className="text-4xl">{badge.icon}</div>
        <div>
          <div className="font-semibold text-sm">{badge.name}</div>
          <Badge
            variant="outline"
            className={`rounded-full text-xs mt-1 ${RARITY_COLORS[badge.rarity]}`}
          >
            {badge.rarity}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {badge.description}
        </p>
        {isEarned && badge.earnedAt && (
          <p className="text-xs text-muted-foreground">
            Earned {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </Card>
  );
}
