import { useEffect, useMemo, useState } from 'react';
import { ArchiveEntry } from '@/types/archive';
import { extractFilenameFromUrl } from '../utils/archiveFormUtils';

export type SectionKey = 'images' | 'video' | 'twitch' | 'replay' | 'text';

export function useArchiveBaseState(mode: 'create' | 'edit', initialEntry?: ArchiveEntry) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    mediaUrl: '',
    twitchClipUrl: '',
    mediaType: 'none' as 'image' | 'video' | 'replay' | 'none',
    dateType: 'single' as 'single' | 'interval' | 'undated',
    singleDate: '',
    startDate: '',
    endDate: '',
    approximateText: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [replayFile, setReplayFile] = useState<File | null>(null);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(['images', 'video', 'twitch', 'replay', 'text']);
  const [existingReplayUrl, setExistingReplayUrl] = useState<string>(
    (initialEntry?.replayUrl || (initialEntry?.mediaType === 'replay' ? initialEntry?.mediaUrl : '')) || ''
  );

  useEffect(() => {
    if (mode === 'edit' && initialEntry) {
      setFormData({
        title: initialEntry.title,
        content: initialEntry.content,
        author: initialEntry.author,
        mediaUrl: initialEntry.videoUrl || initialEntry.mediaUrl || '',
        twitchClipUrl: initialEntry.twitchClipUrl || '',
        mediaType: initialEntry.mediaType || (initialEntry.videoUrl ? 'video' : initialEntry.images?.length ? 'image' : initialEntry.replayUrl ? 'replay' : 'none'),
        dateType: initialEntry.dateInfo.type,
        singleDate: initialEntry.dateInfo.singleDate || '',
        startDate: initialEntry.dateInfo.startDate || '',
        endDate: initialEntry.dateInfo.endDate || '',
        approximateText: initialEntry.dateInfo.approximateText || ''
      });
      const initialImages = initialEntry.images && initialEntry.images.length > 0
        ? initialEntry.images
        : (initialEntry.mediaType === 'image' && initialEntry.mediaUrl ? [initialEntry.mediaUrl] : []);
      setCurrentImages(initialImages);
      const initialOrder: SectionKey[] = initialEntry.sectionOrder && initialEntry.sectionOrder.length
        ? (initialEntry.sectionOrder as SectionKey[])
        : ['images', 'video', 'twitch', 'replay', 'text'];
      setSectionOrder(initialOrder);
      setExistingReplayUrl(
        (initialEntry.replayUrl || (initialEntry.mediaType === 'replay' ? initialEntry.mediaUrl : '')) || ''
      );
    }
  }, [mode, initialEntry]);

  const existingReplayName = useMemo(
    () => (existingReplayUrl ? extractFilenameFromUrl(existingReplayUrl) : ''),
    [existingReplayUrl]
  );

  return {
    formData,
    setFormData,
    imageFile,
    setImageFile,
    imageFiles,
    setImageFiles,
    replayFile,
    setReplayFile,
    currentImages,
    setCurrentImages,
    sectionOrder,
    setSectionOrder,
    existingReplayUrl,
    existingReplayName,
    setExistingReplayUrl,
  };
}


