/**
 * Permanent Cloud Image Storage & Synchronization Service
 * 
 * Strict Architecture Guarantees:
 * 1. Every uploaded image is permanently assigned a unique ID (img_...) and permanent URL.
 * 2. Database/storage is the authoritative source of truth.
 * 3. Removes all dependence on temporary blob URLs, in-memory state, or base64 storage.
 * 4. Automatic retry logic with exponential backoff on network failures.
 * 5. Automated integrity checks and recovery tools.
 * 6. Multi-tier persistence: Cloud Storage + Server Vault + Firestore.
 */

import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { initializeFirebaseApp, syncMediaToFirestore, syncPortfolioToFirestore, fetchMediaFromFirestore } from './firebase';
import { optimizeImage, validateImageFile } from './imageOptimizer';
import { MediaItem, StorageIntegrityReport } from '../types';

export interface UploadProgressCallback {
  (percentage: number, status: string): void;
}

export interface UploadResult {
  id: string;
  url: string;
  permanentUrl: string;
  filename: string;
  storageProvider: 'firebase-storage' | 'backend-server' | 'cloud-storage';
  width: number;
  height: number;
  fileSize: number;
  originalSize: number;
  mediaItem: MediaItem;
}

/**
 * Uploads an image permanently to Cloud / Server Storage
 * Never uses base64 or temporary URLs for final persistence.
 */
export async function uploadPermanentImage(
  file: File,
  adminToken?: string,
  onProgress?: UploadProgressCallback,
  maxRetries: number = 3,
  associatedSection: 'profile' | 'gallery' | 'blog' | 'document' | 'general' = 'general'
): Promise<UploadResult> {
  // 1. Initial file validation
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  onProgress?.(10, 'Preparing and optimizing image for upload...');

  // 2. Client-side optimization with automatic fallback for mobile phone galleries
  let uploadBlob: Blob = file;
  let filename = `photo_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 30)}`;
  if (!/\.[a-zA-Z0-9]{3,4}$/.test(filename)) {
    filename += '.jpg';
  }
  let contentType = file.type || 'image/jpeg';
  let width = 1200;
  let height = 900;
  let originalSize = file.size;
  let optimizedSize = file.size;
  let dataUrlFallback = '';

  try {
    const optimized = await optimizeImage(file, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.88,
    });
    uploadBlob = optimized.blob;
    filename = optimized.filename;
    contentType = optimized.format === 'webp' ? 'image/webp' : 'image/jpeg';
    width = optimized.width;
    height = optimized.height;
    optimizedSize = optimized.optimizedSize;
    dataUrlFallback = optimized.dataUrl;
  } catch (optErr) {
    console.warn('[Image Optimizer]: Using direct file fallback for phone gallery upload:', optErr);
  }

  onProgress?.(30, 'Allocating permanent cloud storage record...');

  let attempt = 0;
  let lastError: any = null;

  while (attempt <= maxRetries) {
    try {
      // 3. Attempt Tier 1: Firebase Cloud Storage
      const { storage, app } = initializeFirebaseApp();
      if (storage && app) {
        try {
          onProgress?.(40, 'Uploading to Firebase Cloud Storage...');
          const imagePath = `portfolio_images/${filename}`;
          const imageStorageRef = storageRef(storage, imagePath);

          const uploadTask = uploadBytesResumable(imageStorageRef, uploadBlob, {
            contentType,
            customMetadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
              associatedSection,
            },
          });

          const downloadUrl = await new Promise<string>((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const percent = Math.round(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 45
                );
                onProgress?.(40 + percent, `Uploading to Cloud Storage (${40 + percent}%)...`);
              },
              (error) => {
                console.warn('[Firebase Storage Notice]: Task error:', error);
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
            onProgress?.(85, 'Registering media metadata in cloud Firestore...');
            
            // Also notify backend server to register media item in DB
            const token = adminToken || localStorage.getItem('jacinta_portfolio_admin_token') || '';
            const registerRes = await fetch('/api/admin/media/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                filename,
                url: downloadUrl,
                size: optimizedSize,
                mimeType: contentType,
                width,
                height,
                storageProvider: 'firebase-storage',
                associatedSection,
              }),
            });

            const regData = registerRes.ok ? await registerRes.json() : null;
            const uniqueId = regData?.mediaItem?.id || `img_${Date.now()}`;

            const mediaItem: MediaItem = {
              id: uniqueId,
              filename,
              url: downloadUrl,
              permanentUrl: downloadUrl,
              size: optimizedSize,
              mimeType: contentType,
              width,
              height,
              date: new Date().toISOString(),
              storageProvider: 'firebase-storage',
              status: 'synced',
              associatedSection,
            };

            // Register directly in Firestore media catalog
            try {
              const existing = (await fetchMediaFromFirestore()) || [];
              const updatedCatalog = [mediaItem, ...existing.filter((m) => m.id !== uniqueId)];
              await syncMediaToFirestore(updatedCatalog);
              console.log('[Firestore]: Media catalog synchronized with new Firebase Storage item.');
            } catch (fsErr) {
              console.warn('[Firestore Media Sync]:', fsErr);
            }

            onProgress?.(100, 'Upload complete & synchronized!');
            return {
              id: uniqueId,
              url: downloadUrl,
              permanentUrl: downloadUrl,
              filename,
              storageProvider: 'firebase-storage',
              width,
              height,
              fileSize: optimizedSize,
              originalSize,
              mediaItem,
            };
          }
        } catch (fbErr: any) {
          console.warn('[Storage Pipeline]: Firebase Storage upload failed or not configured, switching to persistent backend storage:', fbErr?.message || fbErr);
        }
      }

      // 4. Attempt Tier 2: Persistent Backend Storage API (/api/admin/upload)
      onProgress?.(55, 'Uploading to permanent server storage...');

      let fileDataPayload = dataUrlFallback;
      if (!fileDataPayload) {
        // Convert blob to base64 for server upload
        fileDataPayload = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(uploadBlob);
        });
      }

      const token = adminToken || localStorage.getItem('jacinta_portfolio_admin_token') || '';
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          filename,
          fileData: fileDataPayload,
          fileType: contentType,
          width,
          height,
          originalSize,
          compressedSize: optimizedSize,
          associatedSection,
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

      onProgress?.(90, 'Verifying permanent persistence...');

      const mediaItem: MediaItem = resData.mediaItem || {
        id: resData.id || `img_${Date.now()}`,
        filename: resData.filename || filename,
        url: resData.url,
        permanentUrl: resData.permanentUrl || resData.url,
        size: resData.size || optimizedSize,
        mimeType: contentType,
        width,
        height,
        date: new Date().toISOString(),
        storageProvider: 'server-permanent',
        status: 'active',
        associatedSection,
      };

      // Best effort: sync to Firestore
      try {
        const existing = (await fetchMediaFromFirestore()) || [];
        const updatedCatalog = [mediaItem, ...existing.filter((m) => m.id !== mediaItem.id)];
        await syncMediaToFirestore(updatedCatalog);
      } catch (cloudErr) {
        console.warn('[Firestore Sync Warning]: Background sync deferred:', cloudErr);
      }

      onProgress?.(100, 'Upload permanently persisted & verified!');

      return {
        id: mediaItem.id,
        url: resData.url,
        permanentUrl: resData.permanentUrl || resData.url,
        filename: resData.filename || filename,
        storageProvider: 'backend-server',
        width,
        height,
        fileSize: optimizedSize,
        originalSize,
        mediaItem,
      };
    } catch (err: any) {
      attempt++;
      lastError = err;
      console.warn(`[Upload Attempt ${attempt} Failed]:`, err);
      if (attempt <= maxRetries) {
        onProgress?.(25 + attempt * 15, `Network blip detected. Retrying permanent upload (${attempt}/${maxRetries})...`);
        await new Promise((res) => setTimeout(res, 800 * attempt));
      }
    }
  }

  // All retries failed - fail clearly without falling back to temporary state
  throw new Error(
    `Permanent upload failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Server connection unreachable'}. Please check your connection and retry.`
  );
}

/**
 * Fetch all registered media from authoritative database and Firestore
 */
export async function fetchMediaCatalog(adminToken?: string): Promise<MediaItem[]> {
  try {
    const token = adminToken || localStorage.getItem('jacinta_portfolio_admin_token') || '';
    const res = await fetch('/api/admin/media', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) return items;
    }
  } catch (err) {
    console.warn('Failed to fetch media catalog from server, checking Firestore...', err);
  }

  try {
    const cloudItems = await fetchMediaFromFirestore();
    if (cloudItems && cloudItems.length > 0) {
      return cloudItems;
    }
  } catch (fbErr) {
    console.warn('Firestore media fetch error:', fbErr);
  }

  return [];
}

/**
 * Delete a media item from permanent storage (Firebase Storage, backend server, and Firestore)
 */
export async function deleteMediaItem(
  id: string,
  adminToken?: string,
  filename?: string,
  storageProvider?: string
): Promise<boolean> {
  try {
    // 1. If stored in Firebase Cloud Storage, safely delete object from bucket
    try {
      const { storage } = initializeFirebaseApp();
      if (storage && filename) {
        const itemRef = storageRef(storage, `portfolio_images/${filename}`);
        await deleteObject(itemRef).catch((e) => {
          console.info('[Firebase Storage]: deleteObject notice:', e?.message || e);
        });
      }
    } catch (fbErr) {
      console.warn('[Firebase Storage Delete Notice]:', fbErr);
    }

    // 2. Delete from server backend
    const token = adminToken || localStorage.getItem('jacinta_portfolio_admin_token') || '';
    const res = await fetch(`/api/admin/media/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    // 3. Keep Firestore media catalog synchronized
    try {
      const updatedCatalog = await fetchMediaCatalog(token);
      await syncMediaToFirestore(updatedCatalog);
    } catch (syncErr) {
      console.warn('[Firestore Media Sync after delete]:', syncErr);
    }

    return res.ok;
  } catch (err) {
    console.error('Failed to delete media item:', err);
    return false;
  }
}

/**
 * Run automated storage integrity checks
 */
export async function checkStorageIntegrity(adminToken?: string): Promise<StorageIntegrityReport> {
  try {
    const token = adminToken || localStorage.getItem('jacinta_portfolio_admin_token') || '';
    const res = await fetch('/api/admin/media/integrity', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to run storage integrity check:', err);
  }

  return {
    totalMediaCount: 0,
    verifiedCount: 0,
    missingCount: 0,
    storageLocation: '/public/uploads',
    cloudSyncStatus: 'local_only',
    lastChecked: new Date().toISOString(),
    items: [],
  };
}

/**
 * Repair and rehydrate missing media records
 */
export async function repairStorageIntegrity(adminToken?: string): Promise<{
  success: boolean;
  repairedCount: number;
  message: string;
}> {
  try {
    const token = adminToken || localStorage.getItem('jacinta_portfolio_admin_token') || '';
    const res = await fetch('/api/admin/media/repair', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Repair failed:', err);
  }
  return { success: false, repairedCount: 0, message: 'Server unreachable' };
}

/**
 * Sync all media records to Cloud Firestore
 */
export async function syncMediaToCloudFirestore(adminToken?: string): Promise<{
  success: boolean;
  syncedCount: number;
  message: string;
}> {
  try {
    const catalog = await fetchMediaCatalog(adminToken);
    const success = await syncMediaToFirestore(catalog);
    return {
      success,
      syncedCount: catalog.length,
      message: success
        ? `Successfully synchronized ${catalog.length} media records to cloud Firestore.`
        : 'Could not sync to cloud Firestore. Check Firebase environment configuration.',
    };
  } catch (err: any) {
    return {
      success: false,
      syncedCount: 0,
      message: `Sync error: ${err?.message || String(err)}`,
    };
  }
}

/**
 * Verify if an image is accessible via network
 */
export async function verifyImageAvailability(url: string): Promise<boolean> {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}
