import { DateInfo, CreateArchiveEntry } from '@/types/archive';

export function buildDateInfo(params: {
  dateType: 'single' | 'interval' | 'undated';
  singleDate: string;
  startDate: string;
  endDate: string;
  approximateText: string;
}): DateInfo {
  const { dateType, singleDate, startDate, endDate, approximateText } = params;
  return {
    type: dateType,
    ...(dateType === 'single' && singleDate && { singleDate }),
    ...(dateType === 'interval' && startDate && { startDate }),
    ...(dateType === 'interval' && endDate && { endDate }),
    ...(dateType === 'undated' && approximateText && { approximateText })
  };
}

export function computeEffectiveSectionOrder(
  sectionOrder: Array<'images' | 'video' | 'replay' | 'text'>,
  flags: { hasImages: boolean; hasVideo: boolean; hasReplay: boolean; hasText: boolean }
): Array<'images' | 'video' | 'replay' | 'text'> {
  const { hasImages, hasVideo, hasReplay, hasText } = flags;
  return sectionOrder.filter((s) =>
    (s === 'images' && hasImages) ||
    (s === 'video' && hasVideo) ||
    (s === 'replay' && hasReplay) ||
    (s === 'text' && hasText)
  );
}

export function extractFilenameFromUrl(url: string): string {
  try {
    const asUrl = new URL(url);
    const last = asUrl.pathname.split('/').pop() || '';
    return decodeURIComponent(last) || 'File';
  } catch {
    const last = url.split('/').pop() || '';
    return decodeURIComponent(last) || 'File';
  }
}


