import { redirect } from "next/navigation";

interface ProfileRedirectProps {
  params: Promise<{ userId: string }>;
}

/**
 * Redirect from old /profile/[userId] to new /dashboard/[userId]
 * Kept for backwards compatibility with old links
 */
export default async function ProfileRedirect({ params }: ProfileRedirectProps) {
  const { userId } = await params;
  redirect(`/dashboard/${userId}`);
}
