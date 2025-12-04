import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { UserRole } from '@/types/userData';
import { isAdmin } from '@/features/modules/community/users';

interface UseTimelinePermissionsReturn {
  userRole: UserRole | undefined;
  isAuthenticated: boolean;
  currentDiscordId: string | undefined;
  canManageEntries: boolean;
}

/**
 * Hook for managing user permissions in timeline
 */
export function useTimelinePermissions(): UseTimelinePermissionsReturn {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<UserRole | undefined>();

  const isAuthenticated = status === 'authenticated';
  const currentDiscordId = session?.discordId;

  // Fetch user role
  useEffect(() => {
    let isMounted = true;

    const fetchUserRole = async () => {
      if (status !== 'authenticated' || !session?.discordId) {
        if (isMounted) {
          setUserRole(undefined);
        }
        return;
      }

      try {
        const response = await fetch('/api/user/me');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const result = await response.json();
        const userData = result.data;
        if (isMounted) {
          setUserRole(userData?.role);
        }
      } catch {
        if (isMounted) {
          setUserRole(undefined);
        }
      }
    };

    fetchUserRole();

    return () => {
      isMounted = false;
    };
  }, [status, session?.discordId]);

  const canManageEntries = isAdmin(userRole);

  return {
    userRole,
    isAuthenticated,
    currentDiscordId,
    canManageEntries,
  };
}



