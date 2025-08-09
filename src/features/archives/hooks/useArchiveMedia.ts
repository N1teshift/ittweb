import { useEffect, useMemo, useState } from 'react';
import { uploadImage, uploadImages, uploadReplay } from '@/lib/archiveService';

export function useArchiveMedia(imageFile: File | null, imageFiles: File[]) {
  const imagePreviewUrls = useMemo(() => {
    const files = imageFiles.length ? imageFiles : (imageFile ? [imageFile] : []);
    return files.map((f) => URL.createObjectURL(f));
  }, [imageFiles, imageFile]);

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [imagePreviewUrls]);

  return { imagePreviewUrls };
}

export async function uploadSelectedMedia(
  imageFile: File | null,
  imageFiles: File[],
  currentImages: string[],
  mode: 'create' | 'edit',
  replayFile: File | null,
) {
  let images: string[] | undefined;
  if (imageFiles.length > 0) {
    images = await uploadImages(imageFiles);
  } else if (imageFile) {
    images = [await uploadImage(imageFile)];
  } else if (mode === 'edit' && currentImages.length > 0) {
    images = currentImages;
  }

  let replayUrl: string | undefined;
  if (replayFile) {
    replayUrl = await uploadReplay(replayFile);
  }

  return { images, replayUrl };
}


