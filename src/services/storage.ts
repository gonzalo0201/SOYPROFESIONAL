import { supabase } from '../lib/supabase';

type StorageBucket = 'avatars' | 'portfolio' | 'stories';

/**
 * Upload a file to Supabase Storage
 * Files are organized by user: bucket/userId/filename
 */
export async function uploadImage(
  bucket: StorageBucket,
  userId: string,
  file: File,
  customName?: string
): Promise<{ url: string | null; error: string | null }> {
  // Generate unique filename
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = customName || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const filePath = `${userId}/${fileName}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: bucket === 'avatars', // Avatars can be overwritten
    });

  if (error) {
    console.error(`Error uploading to ${bucket}:`, error);
    return { url: null, error: error.message };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl, error: null };
}

/**
 * Upload avatar and update profile
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  // Upload with fixed name so it overwrites (upsert)
  const result = await uploadImage('avatars', userId, file, 'avatar');

  if (result.url) {
    // Update profile in database
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ avatar_url: result.url })
      .eq('id', userId);

    if (dbError) {
      console.error('Error updating profile avatar:', dbError);
      return { url: result.url, error: 'Imagen subida pero no se pudo actualizar el perfil' };
    }
  }

  return result;
}

/**
 * Upload multiple portfolio images
 */
export async function uploadPortfolioImages(
  userId: string,
  files: File[]
): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = await uploadImage('portfolio', userId, file);
    if (result.url) {
      urls.push(result.url);
    } else {
      errors.push(result.error || 'Error desconocido');
    }
  }

  return { urls, errors };
}

/**
 * Upload a story image/video
 */
export async function uploadStoryMedia(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  return uploadImage('stories', userId, file);
}

/**
 * Delete a file from storage
 */
export async function deleteStorageFile(
  bucket: StorageBucket,
  filePath: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    console.error(`Error deleting from ${bucket}:`, error);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Compress image before upload (client-side)
 * Returns a new File with reduced quality/size
 */
export function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            resolve(file); // Fallback to original
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => resolve(file); // Fallback
    img.src = URL.createObjectURL(file);
  });
}
