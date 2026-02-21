/**
 * Project-specific CV Detection API
 * Analyzes work photo with project context (calibration + previous photo)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CV_SERVICE_URL = process.env.CV_SERVICE_URL || "http://localhost:8001";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { date: "desc" },
          take: 1,
          select: {
            photoUrl: true,
            totalStitches: true,
          },
        },
      },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get form data
    const formData = await request.formData();
    const currentPhoto = formData.get("photo") as File;

    if (!currentPhoto) {
      return NextResponse.json(
        { error: "No photo provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(currentPhoto.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (currentPhoto.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Prepare CV request
    const cvFormData = new FormData();
    cvFormData.append("current_photo", currentPhoto);

    // Add project calibration if available
    if (project.calibrationData) {
      cvFormData.append("calibration_data", project.calibrationData);
    }

    // If there's a previous log, fetch and add previous photo for comparison
    const previousLog = project.logs[0];
    if (previousLog?.photoUrl) {
      // Note: In production, you'd fetch the actual photo from S3/storage
      // For now, we'll just pass the URL to CV service
      // The CV service would need to fetch it or we'd need to proxy it here

      // For MVP, we'll skip automatic previous photo fetching
      // and require it to be passed manually if needed
    }

    // Call CV service
    const cvResponse = await fetch(`${CV_SERVICE_URL}/api/detect-progress`, {
      method: "POST",
      body: cvFormData,
    });

    if (!cvResponse.ok) {
      const error = await cvResponse.text();
      console.error("CV service error:", error);
      return NextResponse.json(
        { error: "CV service error", details: error },
        { status: cvResponse.status }
      );
    }

    const result = await cvResponse.json();

    // Enrich result with project context
    return NextResponse.json({
      ...result,
      projectId: project.id,
      projectTitle: project.title,
      totalStitchesInProject: project.totalStitches,
      previousTotal: previousLog?.totalStitches || 0,
      progress: previousLog
        ? ((previousLog.totalStitches / project.totalStitches) * 100).toFixed(2)
        : "0.00",
    });
  } catch (error) {
    console.error("Error in project CV detection:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
