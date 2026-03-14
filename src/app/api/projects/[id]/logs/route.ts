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

  // Get user's total stitches before adding new log
  let levelUpInfo = null;
  if (session?.user?.id) {
    const { getUserTotalStitches, checkLevelUp } = await import("@/lib/level-check");
    const previousTotal = await getUserTotalStitches(session.user.id);
    const newTotal = previousTotal + dailyStitches;
    levelUpInfo = await checkLevelUp(session.user.id, previousTotal, newTotal);
  }

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

  // If project is in stash and user logged stitches > 0, move to in_progress and set startedAt
  if (project.status === "stash" && dailyStitches > 0) {
    await prisma.project.update({
      where: { id },
      data: {
        status: "in_progress",
        startedAt: new Date(date),
      },
    });
  }

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

  return NextResponse.json({ log, levelUp: levelUpInfo }, { status: 201 });
}
