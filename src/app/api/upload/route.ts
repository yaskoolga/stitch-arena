import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { rateLimit } from "@/lib/rate-limit";
import sharp from "sharp";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`upload:${session.user.id}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP and GIF are allowed" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create filename without extension (we'll use WebP for all)
  const baseFilename = `${session.user.id}-${Date.now()}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  // Process image with sharp
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Create optimized version (max 1920px width, quality 85%)
  const optimizedFilename = `${baseFilename}.webp`;
  await image
    .resize(1920, 1920, {
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({ quality: 85 })
    .toFile(path.join(uploadDir, optimizedFilename));

  // Create thumbnail for cards (max 800px width, quality 80%)
  const thumbnailFilename = `${baseFilename}-thumb.webp`;
  await sharp(buffer)
    .resize(800, 800, {
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({ quality: 80 })
    .toFile(path.join(uploadDir, thumbnailFilename));

  const url = `/uploads/${optimizedFilename}`;
  const thumbnailUrl = `/uploads/${thumbnailFilename}`;

  return NextResponse.json({
    url,
    thumbnailUrl,
    originalSize: file.size,
    width: metadata.width,
    height: metadata.height
  });
}
