import { validateArchiveForm, ArchiveFormFieldsState } from '../archiveValidation';

describe('validateArchiveForm', () => {
  const baseFields: ArchiveFormFieldsState = {
    title: 'My Story',
    content: 'Once upon a time',
    author: 'Tester',
    dateType: 'single',
    singleDate: '2024',
    approximateText: ''
  };

  it('requires a title', () => {
    const result = validateArchiveForm({ ...baseFields, title: '   ' });
    expect(result).toBe('Title is required');
  });

  it('requires a creator name', () => {
    const result = validateArchiveForm({ ...baseFields, author: '' });
    expect(result).toBe('Creator name is required');
  });

  it('accepts valid single-date formats', () => {
    expect(validateArchiveForm({ ...baseFields, singleDate: '2023' })).toBeNull();
    expect(validateArchiveForm({ ...baseFields, singleDate: '2023-05' })).toBeNull();
    expect(validateArchiveForm({ ...baseFields, singleDate: '2023-05-12' })).toBeNull();
  });

  it('rejects invalid single-date formats', () => {
    const result = validateArchiveForm({ ...baseFields, singleDate: '2023-5-1' });
    expect(result).toBe('Date must be in format YYYY, YYYY-MM, or YYYY-MM-DD');
  });

  it('allows undated entries without a date', () => {
    const result = validateArchiveForm({
      ...baseFields,
      dateType: 'undated',
      singleDate: '',
      approximateText: ''
    });
    expect(result).toBeNull();
  });

  it('validates approximate text for undated entries', () => {
    const result = validateArchiveForm({
      ...baseFields,
      dateType: 'undated',
      singleDate: '',
      approximateText: '   '
    });
    expect(result).toBe('Approximate time cannot be empty when provided');
  });

  it('returns null for a fully valid form', () => {
    const result = validateArchiveForm({
      ...baseFields,
      singleDate: '1999-12-31'
    });
    expect(result).toBeNull();
  });

  it('returns an error message for invalid form data', () => {
    const result = validateArchiveForm({ ...baseFields, singleDate: '202-01' });
    expect(result).toBe('Date must be in format YYYY, YYYY-MM, or YYYY-MM-DD');
  });
});


