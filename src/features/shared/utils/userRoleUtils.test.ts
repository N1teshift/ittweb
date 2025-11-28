import { DEFAULT_USER_ROLE, hasRole, isAdmin, isDeveloper, isModerator, isPremium } from './userRoleUtils';

describe('userRoleUtils', () => {
  describe('hasRole', () => {
    it('evaluates all role combinations with hierarchy', () => {
      expect(hasRole('developer', 'admin')).toBe(true);
      expect(hasRole('admin', 'developer')).toBe(false);
      expect(hasRole('moderator', 'premium')).toBe(true);
      expect(hasRole('premium', 'moderator')).toBe(false);
      expect(hasRole('user', 'user')).toBe(true);
    });

    it('treats undefined roles as default user', () => {
      expect(hasRole(undefined, 'user')).toBe(true);
      expect(hasRole(undefined, 'premium')).toBe(false);
    });

    it('respects full hierarchy ordering', () => {
      const roles: Array<['developer' | 'admin' | 'moderator' | 'premium' | 'user', boolean]> = [
        ['developer', true],
        ['admin', true],
        ['moderator', true],
        ['premium', true],
        ['user', true],
      ];

      roles.forEach(([role]) => {
        expect(hasRole(role, 'user')).toBe(true);
      });

      expect(hasRole('admin', 'admin')).toBe(true);
      expect(hasRole('premium', 'admin')).toBe(false);
    });
  });

  describe('role helper functions', () => {
    it('checks admin status', () => {
      expect(isAdmin('admin')).toBe(true);
      expect(isAdmin('moderator')).toBe(false);
    });

    it('checks developer status', () => {
      expect(isDeveloper('developer')).toBe(true);
      expect(isDeveloper('admin')).toBe(false);
    });

    it('checks moderator status', () => {
      expect(isModerator('moderator')).toBe(true);
      expect(isModerator('premium')).toBe(false);
    });

    it('checks premium status', () => {
      expect(isPremium('premium')).toBe(true);
      expect(isPremium('user')).toBe(false);
    });
  });

  it('exposes default user role constant', () => {
    expect(DEFAULT_USER_ROLE).toBe('user');
  });
});
