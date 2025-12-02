import { useEffect, useMemo, useState } from 'react';
import { ArchiveEntry } from '@/types/archive';
import {
  extractFilenameFromUrl,
  normalizeSectionOrder,
  type SectionKey as FormSectionKey,
} from '../utils/archiveFormUtils';

export type SectionKey = FormSectionKey;

export function useArchiveBaseState(mode: 'create' | 'edit', initialEntry?: ArchiveEntry) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    entryType: '' as '' | 'story' | 'changelog',
    mediaUrl: '',
    twitchClipUrl: '',
    mediaType: 'none' as 'image' | 'video' | 'replay' | 'none',
    dateType: 'single' as 'single' | 'undated',
    singleDate: '',
    approximateText: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [replayFile, setReplayFile] = useState<File | null>(null);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(normalizeSectionOrder());
  const [existingReplayUrl, setExistingReplayUrl] = useState<string>(
    initialEntry?.replayUrl || ''
  );

  useEffect(() => {
    if (mode === 'edit' && initialEntry) {
      // Convert interval dates to single if needed (for backward compatibility)
      const dateType: 'single' | 'undated' = initialEntry.dateInfo.type === 'undated' ? 'undated' : 'single';
      let singleDate = initialEntry.dateInfo.singleDate || '';
      
      // If it's an interval type, use startDate as singleDate (for backward compatibility)
      if (initialEntry.dateInfo.type === 'interval' && initialEntry.dateInfo.startDate) {
        singleDate = initialEntry.dateInfo.startDate;
      }
      
      setFormData({
        title: initialEntry.title,
        content: initialEntry.content,
        author: initialEntry.creatorName,
        entryType: (initialEntry.entryType || '') as '' | 'story' | 'changelog',
        mediaUrl: initialEntry.videoUrl || '',
        twitchClipUrl: initialEntry.twitchClipUrl || '',
        mediaType: (initialEntry.videoUrl ? 'video' : initialEntry.images?.length ? 'image' : initialEntry.replayUrl ? 'replay' : 'none'),
        dateType,
        singleDate,
        approximateText: initialEntry.dateInfo.approximateText || ''
      });
      const initialImages = initialEntry.images && initialEntry.images.length > 0
        ? initialEntry.images
        : [];
      setCurrentImages(initialImages);
      const initialOrder = normalizeSectionOrder(initialEntry.sectionOrder as SectionKey[] | undefined);
      setSectionOrder(initialOrder);
      setExistingReplayUrl(
        initialEntry.replayUrl || ''
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


