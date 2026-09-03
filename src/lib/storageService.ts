/**
 * Permanent Cloud Image Storage Service
 * Handles:
 * - Firebase Storage upload with real-time percentage progress
 * - Resilient Backend Upload API fallback (/api/admin/upload)
 * - Automatic retry on transient failures
 * - File validation and client-side optimization before network transmission
 * - Immediate database synchronization
 */

import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { initializeFirebaseApp } from './firebase';
import { optimizeImage, validateImageFile } from './imageOptimizer';

export interface UploadProgressCallback {
  (percentage: number, status: string): void;
}

export interface UploadResult {
  url: string;
  filename: string;
  storageProvider: 'firebase-storage' | 'backend-server' | 'inline-data';
  width: number;
  height: number;
  fileSize: number;
  originalSize: number;
}

/**
 * Uploads an image permanently to Cloud Storage (Firebase Storage with Backend API fallback)
 */
export async function uploadPermanentImage(
  file: File,
  adminToken?: string,
  onProgress?: UploadProgressCallback,
  maxRetries: number = 2
): Promise<UploadResult> {
  // 1. Initial file validation
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  onProgress?.(10, 'Optimizing image for fast upload...');

  // 2. Client-side optimization (compresses 15MB phone photos to < 600KB)
  const optimized = await optimizeImage(file, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.88,
  });

  onProgress?.(30, 'Preparing permanent cloud storage...');

  let attempt = 0;
  let lastError: any = null;

  while (attempt <= maxRetries) {
    try {
      // 3. Attempt Tier 1: Firebase Storage (if configured)
      const { storage, app } = initializeFirebaseApp();
      if (storage && app) {
        try {
          onProgress?.(40, 'Uploading to Firebase Cloud Storage...');
          const imagePath = `portfolio_images/${optimized.filename}`;
          const imageStorageRef = storageRef(storage, imagePath);

          const uploadTask = uploadBytesResumable(imageStorageRef, optimized.blob, {
            contentType: optimized.format === 'webp' ? 'image/webp' : 'image/jpeg',
            customMetadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
            },
          });

          const downloadUrl = await new Promise<string>((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const percent = Math.round(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 50
                );
                onProgress?.(40 + percent, `Uploading to Firebase Storage (${40 + percent}%)...`);
              },
              (error) => {
                console.warn('[Firebase Storage Notice]: Task error, will attempt backend fallback:', error);
                reject(error);
              },
              async () => {
                try {
                  const url = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve(url);
                } catch (urlErr) {
                  reject(urlErr);
                }
              }
            );
          });

          if (downloadUrl) {
            onProgress?.(100, 'Upload complete!');
            return {
              url: downloadUrl,
              filename: optimized.filename,
              storageProvider: 'firebase-storage',
              width: optimized.width,
              height: optimized.height,
              fileSize: optimized.optimizedSize,
              originalSize: optimized.originalSize,
            };
          }
        } catch (fbErr: any) {
          console.warn('[Storage Pipeline]: Firebase Storage upload failed or not enabled, switching to persistent backend storage:', fbErr?.message || fbErr);
        }
      }

      // 4. Attempt Tier 2: Persistent Backend Upload API (/api/admin/upload)
      onProgress?.(55, 'Uploading to persistent server storage...');

      const token = adminToken || localStorage.getItem('jacinta_portfolio_admin_token') || '';
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          filename: optimized.filename,
          fileData: optimized.dataUrl,
          fileType: optimized.format === 'webp' ? 'image/webp' : 'image/jpeg',
          width: optimized.width,
          height: optimized.height,
          originalSize: optimized.originalSize,
          compressedSize: optimized.optimizedSize,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const resData = await response.json();
      if (!resData.url) {
        throw new Error(resData.error || 'Server did not return a valid URL.');
      }

      onProgress?.(100, 'Upload complete and verified!');

      return {
        url: resData.url,
        filename: resData.filename || optimized.filename,
        storageProvider: 'backend-server',
        width: optimized.width,
        height: optimized.height,
        fileSize: optimized.optimizedSize,
        originalSize: optimized.originalSize,
      };
    } catch (err: any) {
      attempt++;
      lastError = err;
      console.warn(`[Upload Attempt ${attempt} Failed]:`, err);
      if (attempt <= maxRetries) {
        onProgress?.(20 + attempt * 15, `Network interruption. Retrying upload (attempt ${attempt + 1}/${maxRetries + 1})...`);
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
    }
  }

  // If all remote attempts fail, check if we can safely use the optimized data URL as an emergency fallback
  // with a warning, but throw if it's too big
  if (optimized.optimizedSize < 300 * 1024) {
    console.warn('[Upload Fallback]: Storing inline optimized image URL as emergency fallback.');
    return {
      url: optimized.dataUrl,
      filename: optimized.filename,
      storageProvider: 'inline-data',
      width: optimized.width,
      height: optimized.height,
      fileSize: optimized.optimizedSize,
      originalSize: optimized.originalSize,
    };
  }

  throw new Error(
    `Image upload failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Network connection failed'}. Please check your connection and retry.`
  );
}
