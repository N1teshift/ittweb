export interface ArchiveFormFieldsState {
  title: string;
  content: string;
  author: string;
  dateType: 'single' | 'undated';
  singleDate: string;
  approximateText: string;
}

export function validateArchiveForm(fields: ArchiveFormFieldsState): string | null {
  const title = fields.title.trim();
  const author = fields.author?.trim();
  const singleDate = fields.singleDate?.trim();
  const approximateText = fields.approximateText?.trim();

  if (!title) return 'Title is required';
  // Content (Story/Memory) is now optional
  if (!author) return 'Creator name is required';

  if (fields.dateType === 'single') {
    if (!singleDate) {
      return 'Date is required when Date is selected';
    }
    // Validate date format: YYYY, YYYY-MM, or YYYY-MM-DD
    const datePattern = /^\d{4}(-\d{2}(-\d{2})?)?$/;
    if (!datePattern.test(singleDate)) {
      return 'Date must be in format YYYY, YYYY-MM, or YYYY-MM-DD';
    }
  } else if (fields.dateType === 'undated') {
    if (fields.approximateText && !approximateText) {
      return 'Approximate time cannot be empty when provided';
    }
  }
  return null;
}

