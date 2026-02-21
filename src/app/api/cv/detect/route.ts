/**
 * CV Progress Detection API
 * Proxies work-in-progress photos to CV service for stitch counting and comparison
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const CV_SERVICE_URL = process.env.CV_SERVICE_URL || "http://localhost:8001";

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const currentPhoto = formData.get("currentPhoto") as File;
    const previousPhoto = formData.get("previousPhoto") as File | null;
    const calibrationData = formData.get("calibrationData") as string | null;

    if (!currentPhoto) {
      return NextResponse.json(
        { error: "No current photo provided" },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(currentPhoto.type)) {
      return NextResponse.json(
        { error: "Invalid file type for current photo. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    if (previousPhoto && !allowedTypes.includes(previousPhoto.type)) {
      return NextResponse.json(
        { error: "Invalid file type for previous photo. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    // Validate file sizes (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (currentPhoto.size > maxSize) {
      return NextResponse.json(
        { error: `Current photo too large. Maximum size: ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    if (previousPhoto && previousPhoto.size > maxSize) {
      return NextResponse.json(
        { error: `Previous photo too large. Maximum size: ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Forward to CV service /detect-progress endpoint
    const cvFormData = new FormData();
    cvFormData.append("current_photo", currentPhoto);
    if (previousPhoto) {
      cvFormData.append("previous_photo", previousPhoto);
    }
    if (calibrationData) {
      cvFormData.append("calibration_data", calibrationData);
    }

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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in CV progress detection:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
