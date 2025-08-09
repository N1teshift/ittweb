export interface ArchiveFormFieldsState {
  title: string;
  content: string;
  author: string;
  dateType: 'single' | 'interval' | 'undated';
  singleDate: string;
  startDate: string;
  endDate: string;
  approximateText: string;
}

export function validateArchiveForm(fields: ArchiveFormFieldsState): string | null {
  if (!fields.title.trim()) return 'Title is required';
  if (!fields.content.trim()) return 'Story/Memory is required';
  if (!fields.author.trim()) return 'Author name is required';

  if (fields.dateType === 'single' && !fields.singleDate) {
    return 'Date is required for single date entries';
  }
  if (fields.dateType === 'interval' && (!fields.startDate || !fields.endDate)) {
    return 'Both start and end dates are required for date ranges';
  }
  return null;
}


