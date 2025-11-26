export interface ArchiveFormFieldsState {
  title: string;
  content: string;
  author: string;
  dateType: 'single' | 'undated';
  singleDate: string;
  approximateText: string;
}

export function validateArchiveForm(fields: ArchiveFormFieldsState): string | null {
  if (!fields.title.trim()) return 'Title is required';
  // Content (Story/Memory) is now optional
  if (!fields.author.trim()) return 'Author name is required';

  if (fields.dateType === 'single') {
    if (!fields.singleDate || !fields.singleDate.trim()) {
      return 'Date is required when Date is selected';
    }
    // Validate date format: YYYY, YYYY-MM, or YYYY-MM-DD
    const datePattern = /^\d{4}(-\d{2}(-\d{2})?)?$/;
    if (!datePattern.test(fields.singleDate.trim())) {
      return 'Date must be in format YYYY, YYYY-MM, or YYYY-MM-DD';
    }
  }
  return null;
}