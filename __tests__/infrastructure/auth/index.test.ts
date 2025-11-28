jest.mock('next-auth/react', () => ({
  __esModule: true,
  default: 'SessionProviderMock'
}));

describe('auth infrastructure index', () => {
  it('re-exports SessionProvider from next-auth', async () => {
    const { SessionProvider } = await import('@/features/infrastructure/auth');
    expect(SessionProvider).toBe('SessionProviderMock');
  });
});
