import type { NextApiRequest, NextApiResponse } from 'next';

export interface MockResponse<T = unknown> {
  res: NextApiResponse<T>;
  json: jest.Mock;
  status: jest.Mock;
  setHeader: jest.Mock;
  revalidate: jest.Mock;
}

export const createMockRequest = (partial: Partial<NextApiRequest> = {}): NextApiRequest => {
  return {
    method: 'GET',
    headers: {},
    query: {},
    body: undefined,
    ...partial,
  } as NextApiRequest;
};

export const createMockResponse = <T = unknown>(): MockResponse<T> => {
  const json = jest.fn();
  const status = jest.fn().mockReturnThis();
  const setHeader = jest.fn();
  const revalidate = jest.fn();

  const res = {
    status,
    json,
    setHeader,
    revalidate,
  } as unknown as NextApiResponse<T>;

  return { res, json, status, setHeader, revalidate };
};

