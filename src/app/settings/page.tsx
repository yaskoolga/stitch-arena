"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Save, Loader2, Upload, X, Sun, Moon, Monitor } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();

      // Set initial form values
      setName(data.name || "");
      setBio(data.bio || "");
      setAvatar(data.avatar || "");

      return data;
    },
    enabled: status === "authenticated",
  });

  const updateProfile = useMutation({
    mutationFn: async (data: { name?: string; bio?: string; avatar?: string | null }) => {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", session?.user?.id] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      name: name.trim() || undefined,
      bio: bio.trim() || undefined,
      avatar: avatar.trim() || null,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max size: 5MB");
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Invalid file type. Use JPG, PNG, or WebP");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload");
      }

      const data = await res.json();
      setAvatar(data.url);
      toast.success("Avatar uploaded! Don't forget to save.");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-2xl">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Update your profile information visible to other users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Preview & Upload */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatar || profile?.avatar || undefined} />
                  <AvatarFallback className="text-2xl">
                    {name?.[0]?.toUpperCase() || profile?.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                {avatar && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => setAvatar("")}
                    aria-label="Remove avatar"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-3 w-full">
                {/* File Upload */}
                <div>
                  <Label htmlFor="avatar-file">Upload Avatar</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="avatar-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="flex-1"
                    />
                    {isUploading && (
                      <Button type="button" disabled size="icon" variant="outline" className="rounded-full" aria-label="Uploading avatar">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, or WebP. Max 5MB. Will be resized to 256x256.
                  </p>
                </div>

                {/* URL Input (Alternative) */}
                <div>
                  <Label htmlFor="avatar-url">Or enter URL</Label>
                  <Input
                    id="avatar-url"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Direct link to your avatar image
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                required
              />
              <p className="text-xs text-muted-foreground">
                This is your public display name
              </p>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {bio.length} / 500 characters
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={updateProfile.isPending}
                className="gap-2 rounded-full"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setName(profile?.name || "");
                  setBio(profile?.bio || "");
                  setAvatar(profile?.avatar || "");
                }}
                className="rounded-full"
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mounted && theme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            Appearance
          </CardTitle>
          <CardDescription>
            Choose how StitchArena looks to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={mounted && theme === "light" ? "default" : "outline"}
                className="gap-2 rounded-full"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={mounted && theme === "dark" ? "default" : "outline"}
                className="gap-2 rounded-full"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={mounted && theme === "system" ? "default" : "outline"}
                className="gap-2 rounded-full"
                onClick={() => setTheme("system")}
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Select your preferred color scheme. System will match your device settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
