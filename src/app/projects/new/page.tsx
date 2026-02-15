"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/projects/project-form";
import { useTranslations } from "next-intl";

export default function NewProjectPage() {
  const t = useTranslations();
  const { data: session, status } = useSession();
  if (status === "loading") return <p>{t("common.loading")}</p>;
  if (!session) redirect("/login");

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">{t("projects.createProject")}</h1>
      <ProjectForm />
    </div>
  );
}
