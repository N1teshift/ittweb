jest.mock('next-auth/react', () => ({
  __esModule: true,
  default: 'SessionProviderMock'
}));

describe('auth infrastructure index', () => {
  it('re-exports SessionProvider from next-auth', async () => {
    const { SessionProvider } = await import('@/features/infrastructure/auth');
    expect(SessionProvider).toBe('SessionProviderMock');
  });

  // Note: The auth/index.ts file is minimal and only re-exports SessionProvider.
  // Session retrieval, authentication status checking, and user data extraction
  // are handled by NextAuth directly via getServerSession, useSession, etc.
  // These are tested in NextAuth integration tests or where they are used.
  // The test plan items for session retrieval, auth status, and user data extraction
  // would be tested in the actual usage locations (e.g., API routes, components).
});
