"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/projects/project-form";
import { useTranslations } from "next-intl";

export default function EditProjectPage() {
  const t = useTranslations();
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => fetch(`/api/projects/${id}`).then((r) => r.json()),
    enabled: !!session,
  });

  if (status === "loading" || isLoading) return <p>{t("common.loading")}</p>;
  if (!session) redirect("/login");
  if (!project) return <p>{t("common.noResults")}</p>;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">{t("projects.editProject")}</h1>
      <ProjectForm
        projectId={id}
        defaultValues={{
          title: project.title,
          description: project.description ?? "",
          totalStitches: project.totalStitches,
          canvasType: project.canvasType ?? "",
          isPublic: project.isPublic,
          status: project.status,
          imageUrl: project.imageUrl,
        }}
      />
    </div>
  );
}
