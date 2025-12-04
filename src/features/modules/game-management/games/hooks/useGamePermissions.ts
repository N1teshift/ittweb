import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Logger } from '@/features/infrastructure/logging';
import { isAdmin } from '@/features/modules/community/users';
import type { GameWithPlayers } from '@/features/modules/game-management/games/types';
import type { UserRole } from '@/types/userData';

interface UseGamePermissionsResult {
  userIsAdmin: boolean;
  isUserCreator: (game: GameWithPlayers) => boolean;
  isUserParticipant: (game: GameWithPlayers) => boolean;
}

export function useGamePermissions(): UseGamePermissionsResult {
  const { data: session, status } = useSession();
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  // Fetch user role to check if admin
  useEffect(() => {
    let isMounted = true;

    const fetchUserRole = async () => {
      if (status !== 'authenticated' || !session?.discordId) {
        if (isMounted) {
          setUserIsAdmin(false);
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
          setUserIsAdmin(isAdmin(userData?.role as UserRole | undefined));
        }
      } catch (error) {
        Logger.warn('Failed to fetch user role for game detail page', {
          error: error instanceof Error ? error.message : String(error),
        });
        if (isMounted) {
          setUserIsAdmin(false);
        }
      }
    };

    fetchUserRole();

    return () => {
      isMounted = false;
    };
  }, [status, session?.discordId]);

  const isUserCreator = (game: GameWithPlayers): boolean => {
    if (!session?.discordId) return false;
    return game.createdByDiscordId === session.discordId;
  };

  const isUserParticipant = (game: GameWithPlayers): boolean => {
    if (!session?.discordId || !game.participants) return false;
    return game.participants.some(p => p.discordId === session.discordId);
  };

  return {
    userIsAdmin,
    isUserCreator,
    isUserParticipant,
  };
}

