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

export async function uploadImageToStorage(file: File, path: string, bucket: string = 'vehicle-images'): Promise<string> {
  let finalFile: File | Blob = file;
  
  if (file.type.startsWith('image/') && !file.type.includes('svg')) {
    const isShowcase = bucket === 'site_settings' || path.includes('site_settings') || path.includes('logo') || path.includes('hero') || path.includes('about') || path.includes('delivery');
    
    if (!isShowcase) {
      try {
        const options = {
          maxSizeMB: 0.5, // Budget thumbnail boundary (~500 KB)
          maxWidthOrHeight: 1440, // Crisp HD resolution
          useWebWorker: true,
          fileType: 'image/webp' as string,
          initialQuality: 0.88
        };
        finalFile = await imageCompression(file, options);
      } catch (err) {
        console.warn('Image compression failed, using original', err);
      }
    } else {
      console.log('Skipping image compression for showcase asset:', file.name, 'Path:', path, 'Bucket:', bucket);
    }
  }

  const fileExt = finalFile.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg');
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, finalFile);

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

