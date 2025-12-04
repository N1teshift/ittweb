import { UserRole } from '@/types/userData';

/**
 * Default role for new users
 */
export const DEFAULT_USER_ROLE: UserRole = 'user';

/**
 * Check if a user has a specific role
 */
export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) {
    return requiredRole === DEFAULT_USER_ROLE;
  }
  
  // Role hierarchy: developer > admin > moderator > premium > user
  const roleHierarchy: Record<UserRole, number> = {
    developer: 5,
    admin: 4,
    moderator: 3,
    premium: 2,
    user: 1,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user is an admin or higher
 */
export function isAdmin(userRole: UserRole | undefined): boolean {
  return hasRole(userRole, 'admin');
}

/**
 * Check if user is a developer
 */
export function isDeveloper(userRole: UserRole | undefined): boolean {
  return userRole === 'developer';
}

/**
 * Check if user is a moderator or higher
 */
export function isModerator(userRole: UserRole | undefined): boolean {
  return hasRole(userRole, 'moderator');
}

/**
 * Check if user has premium access or higher
 */
export function isPremium(userRole: UserRole | undefined): boolean {
  return hasRole(userRole, 'premium');
}

