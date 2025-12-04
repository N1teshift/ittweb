import { Timestamp } from 'firebase/firestore';

export const formatDate = (date: Date | Timestamp | string | undefined): string => {
  if (!date) return 'N/A';
  try {
    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else if (date && typeof date === 'object' && 'toDate' in date) {
      d = (date as Timestamp).toDate();
    } else if (typeof date === 'string') {
      d = new Date(date);
    } else {
      return 'N/A';
    }
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

