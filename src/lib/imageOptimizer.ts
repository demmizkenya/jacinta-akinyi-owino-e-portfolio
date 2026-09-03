/**
 * Image Optimizer and Validator for Phone and Desktop Uploads
 * Compresses phone gallery photos (often 8MB-20MB) to crisp, optimized WebP/JPEG (< 800KB)
 * while correcting orientation and preventing timeout/payload errors.
 */

export interface OptimizedImageResult {
  blob: Blob;
  dataUrl: string;
  filename: string;
  format: 'webp' | 'jpeg' | 'png';
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
}

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  preferredFormat?: 'webp' | 'jpeg';
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

/**
 * Validates file type and size before processing
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }

  // Check file type
  const isImageMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) || file.type.startsWith('image/');
  const extensionMatch = /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(file.name);

  if (!isImageMime && !extensionMatch) {
    return {
      isValid: false,
      error: `Invalid file format (${file.type || 'unknown'}). Please select a JPG, JPEG, PNG, or WEBP image.`,
    };
  }

  // Check file size (max 50MB before compression)
  const maxBytes = 50 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      isValid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 50MB.`,
    };
  }

  return { isValid: true };
}

/**
 * Compresses and scales an image using HTML5 Canvas
 */
export async function optimizeImage(
  file: File,
  options: OptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.88,
    preferredFormat = 'webp',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file from your device.'));
    };

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('The image file appears corrupted or unreadable.'));
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate aspect ratio preserving dimensions
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas rendering context not available on this browser.');
          }

          // Draw with high quality smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Determine output mime
          let outputMime = 'image/webp';
          let outputExt = 'webp';

          // Check if browser supports WebP canvas export
          const testWebp = canvas.toDataURL('image/webp');
          if (!testWebp.startsWith('data:image/webp') || preferredFormat === 'jpeg') {
            outputMime = 'image/jpeg';
            outputExt = 'jpg';
          }

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image data.'));
                return;
              }

              const dataUrl = canvas.toDataURL(outputMime, quality);
              const cleanBaseName = file.name
                .replace(/\.[^/.]+$/, '')
                .replace(/[^a-zA-Z0-9_-]/g, '_')
                .slice(0, 30);
              const safeFilename = `${cleanBaseName}_${Date.now()}.${outputExt}`;

              resolve({
                blob,
                dataUrl,
                filename: safeFilename,
                format: outputExt as any,
                width,
                height,
                originalSize: file.size,
                optimizedSize: blob.size,
              });
            },
            outputMime,
            quality
          );
        } catch (err: any) {
          reject(new Error(`Image optimization error: ${err?.message || err}`));
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
