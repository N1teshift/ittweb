import type { NextApiRequest } from 'next';
import {
  validateApiRequest,
  validatePaginationParams,
  validateDateRange,
  validateEnumField,
  createStringValidator,
  createIntValidator,
  createEnumValidator,
  createDateValidator,
  createBooleanValidator,
  createArrayValidator,
} from '../validationHelpers';

describe('validateApiRequest', () => {
  it('validates required fields', () => {
    const schema = [
      { name: 'title', required: true, validator: createStringValidator(1) },
      { name: 'content', required: true, validator: createStringValidator(1) },
    ];

    const result = validateApiRequest({}, schema);
    expect(result.valid).toBe(false);
    expect(result.errors?.[0]).toContain('Missing required fields');
  });

  it('validates all fields in schema', () => {
    const schema = [
      { name: 'title', required: true, validator: createStringValidator(1) },
      { name: 'contentType', required: true, validator: createEnumValidator(['post', 'memory']) },
      { name: 'date', required: true, validator: createDateValidator() },
    ];

    const result = validateApiRequest(
      {
        title: 'Test',
        contentType: 'post',
        date: '2024-01-01T00:00:00Z',
      },
      schema
    );
    expect(result.valid).toBe(true);
    expect(result.data?.title).toBe('Test');
    expect(result.data?.contentType).toBe('post');
    expect(result.data?.date).toBeInstanceOf(Date);
  });

  it('applies default values for optional fields', () => {
    const schema = [
      { name: 'title', required: true, validator: createStringValidator(1) },
      { name: 'published', required: false, validator: createBooleanValidator(), defaultValue: false },
    ];

    const result = validateApiRequest({ title: 'Test' }, schema);
    expect(result.valid).toBe(true);
    // Default values are applied when field is missing
    expect(result.data?.published).toBe(false);
  });

  it('returns multiple validation errors', () => {
    const schema = [
      { name: 'title', required: true, validator: createStringValidator(1) },
      { name: 'contentType', required: true, validator: createEnumValidator(['post', 'memory']) },
    ];

    const result = validateApiRequest(
      {
        title: '', // Invalid: empty string
        contentType: 'invalid', // Invalid: not in enum
      },
      schema
    );
    expect(result.valid).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it('rejects non-object body', () => {
    const schema = [{ name: 'title', required: true }];
    const result = validateApiRequest('not an object', schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Request body must be an object');
  });
});

describe('validatePaginationParams', () => {
  const createMockRequest = (query: Record<string, string>): NextApiRequest => ({
    method: 'GET',
    query,
    body: undefined,
  } as NextApiRequest);

  it('uses default values when params are missing', () => {
    const req = createMockRequest({});
    const result = validatePaginationParams(req);
    expect(result.valid).toBe(true);
    expect(result.data).toEqual({ page: 1, limit: 20 });
  });

  it('validates page parameter', () => {
    const req = createMockRequest({ page: '2' });
    const result = validatePaginationParams(req);
    expect(result.valid).toBe(true);
    expect(result.data?.page).toBe(2);
  });

  it('validates limit parameter', () => {
    const req = createMockRequest({ limit: '50' });
    const result = validatePaginationParams(req);
    expect(result.valid).toBe(true);
    expect(result.data?.limit).toBe(50);
  });

  it('enforces min limit', () => {
    const req = createMockRequest({ limit: '0' });
    const result = validatePaginationParams(req, { minLimit: 1 });
    expect(result.valid).toBe(false);
    expect(result.errors?.[0]).toContain('limit must be at least');
  });

  it('enforces max limit', () => {
    const req = createMockRequest({ limit: '200' });
    const result = validatePaginationParams(req, { maxLimit: 100 });
    expect(result.valid).toBe(false);
    expect(result.errors?.[0]).toContain('limit must be at most');
  });

  it('rejects invalid page value', () => {
    const req = createMockRequest({ page: 'invalid' });
    const result = validatePaginationParams(req);
    expect(result.valid).toBe(false);
    expect(result.errors?.[0]).toContain('page');
  });

  it('uses custom defaults', () => {
    const req = createMockRequest({});
    const result = validatePaginationParams(req, { defaultPage: 2, defaultLimit: 50 });
    expect(result.valid).toBe(true);
    expect(result.data).toEqual({ page: 2, limit: 50 });
  });
});

describe('validateDateRange', () => {
  const createMockRequest = (query: Record<string, string>): NextApiRequest => ({
    method: 'GET',
    query,
    body: undefined,
  } as NextApiRequest);

  it('validates start and end dates', () => {
    const req = createMockRequest({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    const result = validateDateRange(req);
    expect(result.valid).toBe(true);
    expect(result.data?.startDate).toBeInstanceOf(Date);
    expect(result.data?.endDate).toBeInstanceOf(Date);
  });

  it('validates that start date is before end date', () => {
    const req = createMockRequest({
      startDate: '2024-12-31',
      endDate: '2024-01-01',
    });
    const result = validateDateRange(req);
    expect(result.valid).toBe(false);
    expect(result.errors?.[0]).toContain('must be before');
  });

  it('allows only start date', () => {
    const req = createMockRequest({ startDate: '2024-01-01' });
    const result = validateDateRange(req);
    expect(result.valid).toBe(true);
    expect(result.data?.startDate).toBeInstanceOf(Date);
    expect(result.data?.endDate).toBeUndefined();
  });

  it('allows only end date', () => {
    const req = createMockRequest({ endDate: '2024-12-31' });
    const result = validateDateRange(req);
    expect(result.valid).toBe(true);
    expect(result.data?.startDate).toBeUndefined();
    expect(result.data?.endDate).toBeInstanceOf(Date);
  });

  it('rejects invalid date format', () => {
    const req = createMockRequest({ startDate: 'invalid-date' });
    const result = validateDateRange(req);
    expect(result.valid).toBe(false);
    expect(result.errors?.[0]).toContain('must be a valid date');
  });

  it('uses custom field names', () => {
    const req = createMockRequest({
      from: '2024-01-01',
      to: '2024-12-31',
    });
    const result = validateDateRange(req, 'from', 'to');
    expect(result.valid).toBe(true);
    expect(result.data?.startDate).toBeInstanceOf(Date);
    expect(result.data?.endDate).toBeInstanceOf(Date);
  });
});

describe('validateEnumField', () => {
  it('returns valid enum value', () => {
    const result = validateEnumField('post', 'contentType', ['post', 'memory'] as const);
    expect(result).toBe('post');
  });

  it('returns error message for invalid enum', () => {
    const result = validateEnumField('invalid', 'contentType', ['post', 'memory'] as const);
    expect(typeof result).toBe('string');
    expect(result).toContain('contentType must be one of');
  });

  it('returns error message for non-string', () => {
    const result = validateEnumField(123, 'contentType', ['post', 'memory'] as const);
    expect(result).toBe('contentType must be a string');
  });
});

describe('Validator creators', () => {
  describe('createStringValidator', () => {
    it('creates validator with min length', () => {
      const validator = createStringValidator(5);
      expect(validator('test', 'field')).toContain('at least');
      expect(validator('testing', 'field')).toBeNull();
    });

    it('creates validator with max length', () => {
      const validator = createStringValidator(1, 10);
      expect(validator('this is too long', 'field')).toContain('at most');
      expect(validator('short', 'field')).toBeNull();
    });
  });

  describe('createIntValidator', () => {
    it('creates validator with min/max', () => {
      const validator = createIntValidator(1, 100);
      expect(validator(0, 'field')).toContain('at least');
      expect(validator(101, 'field')).toContain('at most');
      expect(validator(50, 'field')).toBe(50);
    });
  });

  describe('createEnumValidator', () => {
    it('creates validator for enum', () => {
      const validator = createEnumValidator(['post', 'memory'] as const);
      expect(validator('post', 'field')).toBe('post');
      expect(validator('invalid', 'field')).toContain('must be one of');
    });
  });

  describe('createDateValidator', () => {
    it('creates validator for dates', () => {
      const validator = createDateValidator();
      expect(validator('2024-01-01', 'field')).toBeInstanceOf(Date);
      expect(validator('invalid', 'field')).toBeNull();
    });
  });

  describe('createBooleanValidator', () => {
    it('creates validator for booleans', () => {
      const validator = createBooleanValidator();
      expect(validator(true, 'field')).toBe(true);
      expect(validator('true', 'field')).toBe(true);
      expect(validator('false', 'field')).toBe(false);
      expect(validator('invalid', 'field')).toBeNull();
    });
  });

  describe('createArrayValidator', () => {
    it('creates validator for arrays', () => {
      const validator = createArrayValidator<number>(
        (item) => typeof item === 'number' ? item : null,
        1,
        10
      );
      expect(validator([1, 2, 3], 'field')).toEqual([1, 2, 3]);
      expect(validator([], 'field')).toContain('at least');
      expect(validator(Array(11).fill(1), 'field')).toContain('at most');
    });
  });
});

