import type { ArchiveEntry } from '@/types/archive';

/**
 * Format archive entry date based on dateInfo type
 */
export function formatArchiveDate(dateInfo: ArchiveEntry['dateInfo']): string {
  switch (dateInfo.type) {
    case 'single':
      if (!dateInfo.singleDate) return 'Unknown';
      // Handle partial dates: YYYY, YYYY-MM, or YYYY-MM-DD
      const dateStr = dateInfo.singleDate.trim();
      if (/^\d{4}$/.test(dateStr)) {
        // Year only
        return dateStr;
      } else if (/^\d{4}-\d{2}$/.test(dateStr)) {
        // Year-Month: format as "March 2025"
        const [year, month] = dateStr.split('-');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = monthNames[parseInt(month) - 1] || month;
        return `${monthName} ${year}`;
      } else {
        // Full date: YYYY-MM-DD
        try {
          return new Date(dateStr).toLocaleDateString();
        } catch {
          return dateStr;
        }
      }
    case 'interval':
      // Backward compatibility: handle existing interval dates
      const start = dateInfo.startDate ? new Date(dateInfo.startDate).toLocaleDateString() : 'Unknown';
      const end = dateInfo.endDate ? new Date(dateInfo.endDate).toLocaleDateString() : 'Unknown';
      return `${start} - ${end}`;
    case 'undated':
      return dateInfo.approximateText || 'Undated';
    default:
      return 'Unknown';
  }
}

/**
 * Get CSS classes for date badge based on dateInfo type
 */
export function getDateBadgeColor(dateInfo: ArchiveEntry['dateInfo']): string {
  switch (dateInfo.type) {
    case 'undated':
      return 'bg-gray-600 text-gray-300';
    case 'interval':
      return 'bg-blue-600 text-white';
    default:
      return 'bg-amber-600 text-white';
  }
}



