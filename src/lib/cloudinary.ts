import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload image to Cloudinary
 * @param buffer - Image buffer
 * @param folder - Cloudinary folder (e.g., "stitch-arena/projects")
 * @param publicId - Optional custom public ID
 * @returns Upload result with URLs
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'stitch-arena',
  publicId?: string
): Promise<{
  url: string;
  thumbnailUrl: string;
  publicId: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        format: 'webp',
        transformation: [
          { width: 1920, height: 1920, crop: 'limit', quality: 85 }
        ],
        eager: [
          { width: 800, height: 800, crop: 'limit', quality: 80, format: 'webp' }
        ],
        eager_async: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            thumbnailUrl: result.eager?.[0]?.secure_url || result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
