import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { uploadToCloudinary } from "@/lib/cloudinary";
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
    console.error('No file in formData');
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  console.log('Upload attempt:', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    userId: session.user.id,
  });

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
  if (!allowedTypes.includes(file.type)) {
    console.error(`Unsupported file type: ${file.type}`);
    return NextResponse.json({ error: `Unsupported file type: ${file.type}. Only JPEG, PNG, WebP, GIF, and HEIC are allowed` }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get image metadata
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Upload to Cloudinary (handles optimization and thumbnails automatically)
    const publicId = `${session.user.id}-${Date.now()}`;
    const result = await uploadToCloudinary(
      buffer,
      'stitch-arena/projects',
      publicId
    );

    return NextResponse.json({
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      originalSize: file.size,
      width: metadata.width || result.width,
      height: metadata.height || result.height,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      errorMessage,
    });
    return NextResponse.json(
      { error: `Failed to upload image: ${errorMessage}` },
      { status: 500 }
    );
  }
}
