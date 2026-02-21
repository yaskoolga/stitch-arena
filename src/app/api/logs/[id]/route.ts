import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logUpdateSchema } from "@/lib/validations";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const log = await prisma.dailyLog.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!log || log.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = logUpdateSchema.safeParse(body);

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

  const updated = await prisma.dailyLog.update({
    where: { id },
    data: {
      date: date ? new Date(date) : undefined,
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

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const log = await prisma.dailyLog.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!log || log.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.dailyLog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
