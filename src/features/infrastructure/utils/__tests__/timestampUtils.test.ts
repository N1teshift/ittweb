import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase/firestore';
import { timestampToIso, TimestampLike } from '../timestampUtils';

describe('timestampToIso', () => {
  const fixedDate = new Date('2024-01-02T03:04:05.000Z');

  beforeEach(() => {
    jest.useFakeTimers({ now: fixedDate });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('converts Firestore Timestamp instances', () => {
    const timestamp = Timestamp.fromDate(fixedDate);

    expect(timestampToIso(timestamp)).toBe(fixedDate.toISOString());
  });

  it('converts Admin SDK Timestamp instances', () => {
    const adminTimestamp = AdminTimestamp.fromDate(fixedDate);

    expect(timestampToIso(adminTimestamp)).toBe(fixedDate.toISOString());
  });

  it('returns string timestamps unchanged', () => {
    const isoString = '2023-12-31T00:00:00.000Z';

    expect(timestampToIso(isoString)).toBe(isoString);
  });

  it('converts Date objects to ISO strings', () => {
    const date = new Date('2022-05-06T07:08:09.000Z');

    expect(timestampToIso(date)).toBe(date.toISOString());
  });

  it('defaults to current time when timestamp is undefined', () => {
    expect(timestampToIso(undefined)).toBe(fixedDate.toISOString());
  });

  it('handles TimestampLike objects with toDate method', () => {
    const timestampLike: TimestampLike = {
      toDate: () => fixedDate,
    };

    expect(timestampToIso(timestampLike)).toBe(fixedDate.toISOString());
  });
});
