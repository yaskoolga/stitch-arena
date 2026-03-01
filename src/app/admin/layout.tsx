import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  // Check if user is admin
  if (session.user.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-6">
        {children}
      </main>
    </div>
  );
}
