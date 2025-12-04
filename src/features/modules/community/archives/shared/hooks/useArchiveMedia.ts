import { useEffect, useMemo } from 'react';
import { uploadImage, uploadImages, uploadReplay } from '@/features/modules/community/archives/services';

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
  entryId?: string,
) {
  let images: string[] | undefined;
  if (imageFiles.length > 0) {
    images = await uploadImages(imageFiles.map(f => ({ file: f, entryId })));
  } else if (imageFile) {
    images = [await uploadImage(imageFile, entryId)];
  } else if (mode === 'edit' && currentImages.length > 0) {
    images = currentImages;
  }

  let replayUrl: string | undefined;
  if (replayFile) {
    replayUrl = await uploadReplay(replayFile, entryId);
  }

  return { images, replayUrl };
}


