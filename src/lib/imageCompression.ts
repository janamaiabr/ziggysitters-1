import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 0.5, // Compress to max 500KB
  maxWidthOrHeight: 1920, // Max dimension
  useWebWorker: true,
};

/**
 * Compress an image file before uploading
 * Reduces file size significantly while maintaining quality
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // Skip compression for non-image files
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Skip if already small enough (under 200KB)
  if (file.size < 200 * 1024) {
    console.log(`[ImageCompression] Skipping ${file.name} - already small (${(file.size / 1024).toFixed(1)}KB)`);
    return file;
  }

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    console.log(`[ImageCompression] Compressing ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    const compressedFile = await imageCompression(file, {
      maxSizeMB: mergedOptions.maxSizeMB!,
      maxWidthOrHeight: mergedOptions.maxWidthOrHeight!,
      useWebWorker: mergedOptions.useWebWorker!,
      fileType: 'image/jpeg', // Convert to JPEG for better compression
    });

    console.log(`[ImageCompression] Compressed to: ${(compressedFile.size / 1024).toFixed(1)}KB (${((1 - compressedFile.size / file.size) * 100).toFixed(0)}% reduction)`);

    // Return with original filename but .jpg extension
    const newFileName = file.name.replace(/\.[^/.]+$/, '.jpg');
    return new File([compressedFile], newFileName, { type: 'image/jpeg' });
  } catch (error) {
    console.error('[ImageCompression] Error compressing image:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  return Promise.all(files.map(file => compressImage(file, options)));
}

/**
 * Get compression options based on use case
 */
export const compressionPresets = {
  avatar: {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 512,
  },
  portfolio: {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
  },
  thumbnail: {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 400,
  },
  document: {
    maxSizeMB: 1,
    maxWidthOrHeight: 2048,
  },
} as const;
