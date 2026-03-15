"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect old /projects/[id] URLs to new /@username/slug URLs
 * This page fetches project data and redirects to the SEO-friendly URL
 */
export default function ProjectRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      try {
        // Fetch project to get username and slug
        const res = await fetch(`/api/projects/${id}`);

        if (!res.ok) {
          // Project not found, redirect to dashboard
          router.replace('/dashboard');
          return;
        }

        const project = await res.json();

        // Get user data to find username
        const userRes = await fetch(`/api/users/${project.userId}`);
        if (!userRes.ok) {
          router.replace('/dashboard');
          return;
        }

        const user = await userRes.json();

        // Redirect to new SEO-friendly URL
        const newUrl = `/@${user.username}/${project.slug}`;
        router.replace(newUrl);
      } catch (error) {
        console.error('Redirect error:', error);
        router.replace('/dashboard');
      }
    }

    if (id) {
      redirect();
    }
  }, [id, router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
