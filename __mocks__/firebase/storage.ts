export const mockRef = jest.fn();
export const mockUploadBytes = jest.fn();
export const mockGetDownloadURL = jest.fn();

export const ref = (...args: unknown[]) => mockRef(...args);
export const uploadBytes = (...args: unknown[]) => mockUploadBytes(...args);
export const getDownloadURL = (...args: unknown[]) => mockGetDownloadURL(...args);
