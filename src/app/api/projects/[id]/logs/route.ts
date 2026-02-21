import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logCreateSchema } from "@/lib/validations";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const logs = await prisma.dailyLog.findMany({
    where: { projectId: id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(logs);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = logCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const {
    date,
    photoUrl,
    previousPhotoUrl,
    totalStitches,
    dailyStitches,
    aiDetected,
    aiConfidence,
    userCorrected,
    notes
  } = parsed.data;

  const log = await prisma.dailyLog.create({
    data: {
      projectId: id,
      date: new Date(date),
      photoUrl,
      previousPhotoUrl,
      totalStitches,
      dailyStitches,
      aiDetected,
      aiConfidence,
      userCorrected,
      notes,
    },
  });

  // Update challenge progress for user
  if (session?.user?.id) {
    const { updateChallengeProgressForUser } = await import("@/lib/challenges");
    await updateChallengeProgressForUser(session.user.id, log);
  }

  // Check and unlock achievements
  if (session?.user?.id) {
    const { unlockAchievements } = await import("@/lib/achievements");
    await unlockAchievements(session.user.id);
  }

  return NextResponse.json(log, { status: 201 });
}
