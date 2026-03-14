import imageCompression from 'browser-image-compression';

/**
 * Compress image file before upload
 * Ensures file is under Vercel's 4.5MB limit
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 4, // Max 4MB (safely under Vercel's 4.5MB limit)
    maxWidthOrHeight: 2048, // Max dimension
    useWebWorker: true,
    fileType: 'image/jpeg', // Convert to JPEG for better compression
  };

  try {
    console.log('Original file:', {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type,
    });

    const compressedFile = await imageCompression(file, options);

    console.log('Compressed file:', {
      name: compressedFile.name,
      size: (compressedFile.size / 1024 / 1024).toFixed(2) + ' MB',
      type: compressedFile.type,
    });

    return compressedFile;
  } catch (error) {
    console.error('Compression error:', error);
    // If compression fails, return original file
    return file;
  }
}
