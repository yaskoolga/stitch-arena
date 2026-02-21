/**
 * Project Calibration API
 * Manage per-project calibration settings for CV detection
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calibrationSchema } from "@/lib/validations";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      calibrationData: true,
      canvasType: true,
    },
  });

  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Parse calibrationData JSON
  let calibration = null;
  if (project.calibrationData) {
    try {
      calibration = JSON.parse(project.calibrationData);
    } catch (e) {
      console.error("Failed to parse calibrationData:", e);
    }
  }

  return NextResponse.json({
    projectId: project.id,
    canvasType: project.canvasType,
    calibration,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  const parsed = calibrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { canvasType, pixelPerStitch, referencePhotoUrl } = parsed.data;

  // Build calibration data object
  const calibrationData = {
    canvasType,
    pixelPerStitch,
    referencePhotoUrl,
    calibratedAt: new Date().toISOString(),
  };

  // Update project
  const updated = await prisma.project.update({
    where: { id },
    data: {
      canvasType,
      calibrationData: JSON.stringify(calibrationData),
    },
  });

  return NextResponse.json({
    success: true,
    projectId: updated.id,
    calibration: calibrationData,
  });
}
