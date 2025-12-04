import { DEFAULT_USER_ROLE, hasRole, isAdmin, isDeveloper, isModerator, isPremium } from '../userRoleUtils';
import type { UserRole } from '@/types/userData';

describe('userRoleUtils', () => {
  describe('hasRole', () => {
    it('evaluates all role combinations with hierarchy', () => {
      expect(hasRole('developer', 'admin')).toBe(true);
      expect(hasRole('admin', 'developer')).toBe(false);
      expect(hasRole('moderator', 'premium')).toBe(true);
      expect(hasRole('premium', 'moderator')).toBe(false);
      expect(hasRole('user', 'user')).toBe(true);
    });

    it('tests all role pairs systematically', () => {
      const roles: UserRole[] = ['developer', 'admin', 'moderator', 'premium', 'user'];
      const roleHierarchy: Record<UserRole, number> = {
        developer: 5,
        admin: 4,
        moderator: 3,
        premium: 2,
        user: 1,
      };
      
      roles.forEach((userRole) => {
        roles.forEach((requiredRole) => {
          const result = hasRole(userRole, requiredRole);
          const userLevel = roleHierarchy[userRole];
          const requiredLevel = roleHierarchy[requiredRole];
          
          expect(result).toBe(userLevel >= requiredLevel);
        });
      });
    });

    it('respects role hierarchy (developer > admin > moderator > premium > user)', () => {
      expect(hasRole('developer', 'developer')).toBe(true);
      expect(hasRole('developer', 'admin')).toBe(true);
      expect(hasRole('developer', 'moderator')).toBe(true);
      expect(hasRole('developer', 'premium')).toBe(true);
      expect(hasRole('developer', 'user')).toBe(true);

      expect(hasRole('admin', 'developer')).toBe(false);
      expect(hasRole('admin', 'admin')).toBe(true);
      expect(hasRole('admin', 'moderator')).toBe(true);
      expect(hasRole('admin', 'premium')).toBe(true);
      expect(hasRole('admin', 'user')).toBe(true);

      expect(hasRole('moderator', 'developer')).toBe(false);
      expect(hasRole('moderator', 'admin')).toBe(false);
      expect(hasRole('moderator', 'moderator')).toBe(true);
      expect(hasRole('moderator', 'premium')).toBe(true);
      expect(hasRole('moderator', 'user')).toBe(true);

      expect(hasRole('premium', 'developer')).toBe(false);
      expect(hasRole('premium', 'admin')).toBe(false);
      expect(hasRole('premium', 'moderator')).toBe(false);
      expect(hasRole('premium', 'premium')).toBe(true);
      expect(hasRole('premium', 'user')).toBe(true);

      expect(hasRole('user', 'developer')).toBe(false);
      expect(hasRole('user', 'admin')).toBe(false);
      expect(hasRole('user', 'moderator')).toBe(false);
      expect(hasRole('user', 'premium')).toBe(false);
      expect(hasRole('user', 'user')).toBe(true);
    });

    it('treats undefined roles as default user', () => {
      expect(hasRole(undefined, 'user')).toBe(true);
      expect(hasRole(undefined, 'premium')).toBe(false);
      expect(hasRole(undefined, 'moderator')).toBe(false);
      expect(hasRole(undefined, 'admin')).toBe(false);
      expect(hasRole(undefined, 'developer')).toBe(false);
    });

    it('handles role comparison edge cases', () => {
      expect(hasRole('user', 'user')).toBe(true);
      expect(hasRole('developer', 'developer')).toBe(true);
    });
  });

  describe('role helper functions', () => {
    describe('isAdmin', () => {
      it('returns true for admin role', () => {
        expect(isAdmin('admin')).toBe(true);
      });

      it('returns true for developer role', () => {
        expect(isAdmin('developer')).toBe(true);
      });

      it('returns false for lower roles', () => {
        expect(isAdmin('moderator')).toBe(false);
        expect(isAdmin('premium')).toBe(false);
        expect(isAdmin('user')).toBe(false);
      });

      it('returns false for undefined role', () => {
        expect(isAdmin(undefined)).toBe(false);
      });
    });

    describe('isDeveloper', () => {
      it('returns true only for developer role', () => {
        expect(isDeveloper('developer')).toBe(true);
      });

      it('returns false for all other roles', () => {
        expect(isDeveloper('admin')).toBe(false);
        expect(isDeveloper('moderator')).toBe(false);
        expect(isDeveloper('premium')).toBe(false);
        expect(isDeveloper('user')).toBe(false);
      });

      it('returns false for undefined role', () => {
        expect(isDeveloper(undefined)).toBe(false);
      });
    });

    describe('isModerator', () => {
      it('returns true for moderator role', () => {
        expect(isModerator('moderator')).toBe(true);
      });

      it('returns true for admin role', () => {
        expect(isModerator('admin')).toBe(true);
      });

      it('returns true for developer role', () => {
        expect(isModerator('developer')).toBe(true);
      });

      it('returns false for lower roles', () => {
        expect(isModerator('premium')).toBe(false);
        expect(isModerator('user')).toBe(false);
      });

      it('returns false for undefined role', () => {
        expect(isModerator(undefined)).toBe(false);
      });
    });

    describe('isPremium', () => {
      it('returns true for premium role', () => {
        expect(isPremium('premium')).toBe(true);
      });

      it('returns true for higher roles', () => {
        expect(isPremium('moderator')).toBe(true);
        expect(isPremium('admin')).toBe(true);
        expect(isPremium('developer')).toBe(true);
      });

      it('returns false for user role', () => {
        expect(isPremium('user')).toBe(false);
      });

      it('returns false for undefined role', () => {
        expect(isPremium(undefined)).toBe(false);
      });
    });
  });

  describe('edge cases', () => {
    it('exposes default user role constant', () => {
      expect(DEFAULT_USER_ROLE).toBe('user');
      expect(typeof DEFAULT_USER_ROLE).toBe('string');
    });

    it('handles role comparison edge cases', () => {
      expect(hasRole('user', 'user')).toBe(true);
      expect(hasRole('developer', 'developer')).toBe(true);
    });
  });
});

