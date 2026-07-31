import { createClient } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleSupabaseError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  }
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function deleteImagesFromStorage(items: any[], bucket: string = 'vehicle-images'): Promise<void> {
  if (!items || !Array.isArray(items) || items.length === 0) return;

  const rawUrls: string[] = [];

  items.forEach(item => {
    if (!item) return;
    if (typeof item === 'string') {
      if (item.includes('|||')) {
        item.split('|||').forEach(part => { if (part) rawUrls.push(part.trim()); });
      } else {
        rawUrls.push(item.trim());
      }
    } else if (typeof item === 'object') {
      const keys = ['thumbnail_url', 'gallery_url', 'fullscreen_url', 'image_url', 'url', 'src', 'file_path', 'path'];
      keys.forEach(key => {
        const val = item[key];
        if (typeof val === 'string' && val) {
          if (val.includes('|||')) {
            val.split('|||').forEach(part => { if (part) rawUrls.push(part.trim()); });
          } else {
            rawUrls.push(val.trim());
          }
        }
      });
    }
  });

  if (rawUrls.length === 0) return;

  // Extract bucket and relative path for each URL
  const bucketToPathsMap = new Map<string, Set<string>>();

  rawUrls.forEach(url => {
    if (!url || !url.startsWith('http')) return;
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname; // e.g. /storage/v1/object/public/vehicle-images/vehicles/0.123.webp

      // Match patterns like /storage/v1/object/public/<bucket>/<filePath>
      const match = pathname.match(/\/storage\/v1\/object\/(?:public|authenticated|sign)\/([^/]+)\/(.+)$/i);
      if (match) {
        const urlBucket = match[1];
        const relativePath = decodeURIComponent(match[2]);
        if (!bucketToPathsMap.has(urlBucket)) {
          bucketToPathsMap.set(urlBucket, new Set());
        }
        bucketToPathsMap.get(urlBucket)!.add(relativePath);
      } else {
        // Fallback checks
        const targetBuckets = [bucket, 'vehicle-images', 'vehicles'];
        targetBuckets.forEach(b => {
          const idx = pathname.toLowerCase().indexOf(`/${b.toLowerCase()}/`);
          if (idx !== -1) {
            const relPath = decodeURIComponent(pathname.substring(idx + b.length + 2));
            if (relPath) {
              if (!bucketToPathsMap.has(b)) bucketToPathsMap.set(b, new Set());
              bucketToPathsMap.get(b)!.add(relPath);
            }
          }
        });
      }
    } catch (e) {
      console.warn('[STORAGE PURGE URL PARSE ERROR]', e, 'for url:', url);
    }
  });

  // Execute deletion for each detected bucket
  for (const [bkt, pathSet] of bucketToPathsMap.entries()) {
    const pathList = Array.from(pathSet);
    if (pathList.length > 0) {
      console.log(`[STORAGE PURGE] Removing ${pathList.length} files from bucket "${bkt}":`, pathList);
      try {
        const { data, error } = await supabase.storage.from(bkt).remove(pathList);
        if (error) {
          console.error(`[STORAGE PURGE ERROR] Failed to delete from bucket "${bkt}":`, error);
        } else {
          console.log(`[STORAGE PURGE SUCCESS] Removed from bucket "${bkt}":`, data);
        }
      } catch (err) {
        console.error(`[STORAGE PURGE EXCEPTION] Bucket "${bkt}":`, err);
      }
    }
  }
}

export async function cleanupLegacyImageVariants(bucket: string = 'vehicle-images'): Promise<{deletedCount: number, errors: any[]}> {
  let deletedCount = 0;
  const errors: any[] = [];
  try {
    const { data: list, error } = await supabase.storage.from(bucket).list('vehicles', {
      limit: 1000,
      offset: 0,
    });
    if (error) {
      errors.push(error);
      return { deletedCount, errors };
    }

    const filesToDelete = list?.filter(f => 
      f.name.endsWith('-thumb.webp') || 
      f.name.endsWith('-gallery.webp') || 
      f.name.endsWith('-full.webp')
    ).map(f => `vehicles/${f.name}`) || [];

    if (filesToDelete.length > 0) {
      const { data, error: removeError } = await supabase.storage.from(bucket).remove(filesToDelete);
      if (removeError) {
        errors.push(removeError);
      } else {
        deletedCount = data?.length || 0;
      }
    }
  } catch (err) {
    errors.push(err);
  }
  return { deletedCount, errors };
}

function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Ultra-reliable client-side image compression & format converter
 * Fixes iPhone iOS Safari issues where Web Workers fail or HEIC/JPEG uploads uncompressed/huge/soft.
 * Converts iPhone/Android photos to crisp 1600px HD WebP (~150KB - 250KB) with high image smoothing.
 */
export async function compressImageToWebP(
  file: File | Blob,
  maxDimension: number = 1600,
  quality: number = 0.85
): Promise<{ file: File; url: string; ext: string }> {
  if (file.type && !file.type.startsWith('image/')) {
    const defaultFile = file instanceof File ? file : new File([file], 'file', { type: file.type });
    return { file: defaultFile, url: '', ext: 'jpg' };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));
      img.onload = () => {
        try {
          let width = img.width || img.naturalWidth || 1600;
          let height = img.height || img.naturalHeight || 1200;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }

          // High-clarity sharp image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Check browser/device canvas WebP export capability
          const sampleWebp = canvas.toDataURL('image/webp', 0.8);
          const isWebpSupported = sampleWebp.startsWith('data:image/webp');

          const mimeType = isWebpSupported ? 'image/webp' : 'image/jpeg';
          const fileExt = isWebpSupported ? 'webp' : 'jpg';

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const origName = (file as File).name || 'photo';
                const baseName = origName.substring(0, origName.lastIndexOf('.')) || origName;
                const newFile = new File([blob], `${baseName}.${fileExt}`, {
                  type: mimeType,
                  lastModified: Date.now(),
                });
                resolve({ file: newFile, url: '', ext: fileExt });
              } else {
                // Fallback via data URL if toBlob returns null
                const dataUrl = canvas.toDataURL(mimeType, quality);
                const arr = dataUrl.split(',');
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                  u8arr[n] = bstr.charCodeAt(n);
                }
                const fallbackBlob = new Blob([u8arr], { type: mimeType });
                const origName = (file as File).name || 'photo';
                const baseName = origName.substring(0, origName.lastIndexOf('.')) || origName;
                const newFile = new File([fallbackBlob], `${baseName}.${fileExt}`, {
                  type: mimeType,
                  lastModified: Date.now(),
                });
                resolve({ file: newFile, url: dataUrl, ext: fileExt });
              }
            },
            mimeType,
            quality
          );
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadImageToStorage(file: File, path: string, bucket: string = 'vehicle-images'): Promise<string> {
  let finalFile: File = file;
  
  if (file.type.startsWith('image/') && !file.type.includes('svg')) {
    const isShowcase = bucket === 'site_settings' || path.includes('site_settings') || path.includes('logo') || path.includes('hero') || path.includes('about') || path.includes('delivery');
    
    if (!isShowcase) {
      try {
        // 1. Try high-clarity canvas WebP compression (optimised for iPhone iOS Safari & Android)
        const compressed = await compressImageToWebP(file, 1600, 0.85);
        finalFile = compressed.file;
        console.log(`[IMAGE COMPRESSED] Original: ${(file.size / 1024).toFixed(1)}KB -> Compressed: ${(finalFile.size / 1024).toFixed(1)}KB (${finalFile.type})`);
      } catch (err) {
        console.warn('Canvas webp compression failed, trying browser-image-compression fallback', err);
        try {
          const options = {
            maxSizeMB: 0.4,
            maxWidthOrHeight: 1600,
            useWebWorker: false, // useWebWorker: false prevents Safari worker failures
            fileType: 'image/webp' as string,
            initialQuality: 0.85
          };
          const compressedBlob = await imageCompression(file, options);
          const ext = compressedBlob.type === 'image/webp' ? 'webp' : 'jpg';
          finalFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + "." + ext, { type: compressedBlob.type });
        } catch (fallbackErr) {
          console.warn('All image compression attempts failed, using original', fallbackErr);
        }
      }
    } else {
      console.log('Skipping image compression for showcase asset:', file.name, 'Path:', path, 'Bucket:', bucket);
    }
  }

  const fileExt = finalFile.type === 'image/webp' ? 'webp' : (finalFile.name.split('.').pop() || 'jpg');
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, finalFile, {
        contentType: finalFile.type || (fileExt === 'webp' ? 'image/webp' : 'image/jpeg'),
        upsert: true
      });

    if (uploadError) {
      console.warn(`Supabase Storage upload error for bucket "${bucket}". Using local data URL fallback:`, uploadError);
      return await fileToBase64(finalFile);
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (data?.publicUrl) {
      return data.publicUrl;
    }

    return await fileToBase64(finalFile);
  } catch (err) {
    console.warn('Supabase storage upload exception, using local data URL fallback:', err);
    return await fileToBase64(finalFile);
  }
}

