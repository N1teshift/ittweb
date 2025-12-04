import { extractYouTubeId, extractTwitchClipId } from '@/features/modules/community/archives/services';
import { SectionKey } from './useArchiveBaseState';
import { Dispatch, SetStateAction } from 'react';

interface UseArchiveHandlersParams {
  setFormData: Dispatch<SetStateAction<{
    title: string;
    content: string;
    author: string;
    entryType: '' | 'story' | 'changelog';
    mediaUrl: string;
    twitchClipUrl: string;
    mediaType: 'image' | 'video' | 'replay' | 'none';
    dateType: 'single' | 'undated';
    singleDate: string;
    approximateText: string;
  }>>;
  imageFile: File | null;
  imageFiles: File[];
  setImageFile: Dispatch<SetStateAction<File | null>>;
  setImageFiles: Dispatch<SetStateAction<File[]>>;
  setReplayFile: Dispatch<SetStateAction<File | null>>;
  setCurrentImages: Dispatch<SetStateAction<string[]>>;
  setSectionOrder: Dispatch<SetStateAction<SectionKey[]>>;
  setError: (msg: string) => void;
  setExistingReplayUrl: Dispatch<SetStateAction<string>>;
}

export function useArchiveHandlers({
  setFormData,
  imageFile,
  imageFiles,
  setImageFile,
  setImageFiles,
  setReplayFile,
  setCurrentImages,
  setSectionOrder,
  setError,
  setExistingReplayUrl,
}: UseArchiveHandlersParams) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (files.some(f => !f.type.startsWith('image/'))) {
      setError('Please select only image files');
      return;
    }
    setError('');
    if (files.length === 1) {
      setImageFile(files[0]);
      setImageFiles([]);
    } else {
      setImageFiles(files);
      setImageFile(null);
    }
    setFormData(prev => ({ ...prev, mediaType: 'image' }));
  };

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    if (imageFiles.length || imageFile) {
      setImageFiles(prev => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
      return;
    }
    setCurrentImages(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleReorderSections = (fromIndex: number, toIndex: number) => {
    setSectionOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const youtubeId = extractYouTubeId(url);
    const twitchId = extractTwitchClipId(url);

    if (url && !youtubeId && !twitchId) {
      setError('Please enter a valid YouTube or Twitch clip URL');
      setFormData(prev => ({ ...prev, mediaUrl: '', twitchClipUrl: '' }));
      return;
    }

    setError('');
    // Set the appropriate URL and clear the other one
    if (youtubeId) {
      setFormData(prev => ({ ...prev, mediaUrl: url, twitchClipUrl: '' }));
    } else if (twitchId) {
      setFormData(prev => ({ ...prev, twitchClipUrl: url, mediaUrl: '' }));
    } else {
      // Empty URL - clear both
      setFormData(prev => ({ ...prev, mediaUrl: '', twitchClipUrl: '' }));
    }
  };

  const handleTwitchUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This is kept for backward compatibility but should not be used with new MediaSelector
    handleVideoUrlChange(e);
  };

  const handleCombinedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const imageFiles: File[] = [];
    const replayFiles: File[] = [];

    files.forEach(file => {
      const nameLower = file.name.toLowerCase();
      if (nameLower.endsWith('.w3g')) {
        replayFiles.push(file);
      } else if (file.type.startsWith('image/')) {
        imageFiles.push(file);
      } else {
        setError(`Unsupported file type: ${file.name}. Please upload images or .w3g replay files.`);
        return;
      }
    });

    if (replayFiles.length > 1) {
      setError('Please upload only one replay file at a time');
      return;
    }

    if (replayFiles.length > 0 && imageFiles.length > 0) {
      setError('Please upload either images or a replay file, not both');
      return;
    }

    setError('');

    // Handle replays
    if (replayFiles.length > 0) {
      setReplayFile(replayFiles[0]);
      setImageFile(null);
      setImageFiles([]);
      setFormData(prev => ({ ...prev, mediaType: 'replay' }));
      return;
    }

    // Handle images
    if (imageFiles.length > 0) {
      if (imageFiles.length === 1) {
        setImageFile(imageFiles[0]);
        setImageFiles([]);
      } else {
        setImageFiles(imageFiles);
        setImageFile(null);
      }
      setReplayFile(null);
      setFormData(prev => ({ ...prev, mediaType: 'image' }));
    }
  };

  const handleReplayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Legacy handler - kept for backward compatibility
    const file = e.target.files?.[0];
    if (file) {
      const nameLower = file.name.toLowerCase();
      if (!nameLower.endsWith('.w3g')) {
        setError('Please select a .w3g replay file');
        return;
      }
      setReplayFile(file);
      setFormData(prev => ({ ...prev, mediaType: 'replay' }));
      setError('');
    }
  };

  const handleMediaFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'mediaUrl') {
      handleVideoUrlChange(e);
      return;
    }
    if (e.target.name === 'twitchClipUrl') {
      handleTwitchUrlChange(e);
      return;
    }
    handleInputChange(e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>);
  };

  const handleRemoveExistingImage = (index: number) => {
    // If working with new uploads (imageFiles/imageFile), remove from those; otherwise from currentImages
    if (imageFiles.length > 0) {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      return;
    }
    if (imageFile && index === 0) {
      setImageFile(null);
      return;
    }
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveReplay = () => {
    setReplayFile(null);
    setExistingReplayUrl('');
  };

  return {
    handleInputChange,
    handleImageUpload,
    handleReorderImages,
    handleReorderSections,
    handleVideoUrlChange,
    handleTwitchUrlChange,
    handleReplayUpload,
    handleCombinedFileUpload,
    handleMediaFieldChange,
    handleRemoveExistingImage,
    handleRemoveReplay,
  };
}


