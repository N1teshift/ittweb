import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import EntryFormModal from '@/features/modules/game-management/entries/components/EntryFormModal';
import ScheduleGameForm from '@/features/modules/game-management/scheduled-games/components/ScheduleGameForm';
import { isAdmin } from '@/features/modules/community/users';
import type { GetStaticProps } from 'next';
import type { CreateScheduledGame } from '@/features/modules/game-management/games/types';
import { Button, ErrorBoundary } from '@/features/infrastructure/components';
import { HomeTimeline } from '@/features/modules/community/archives/shared/components';
import type { HomeTimelineHandle } from '@/features/modules/community/archives/timeline/components/HomeTimeline';
import { useRef } from 'react';
import { logError } from '@/features/infrastructure/logging';

const pageNamespaces = ["common"];

type HomeProps = {
  translationNamespaces?: string[];
};

export default function Home({}: HomeProps) {
  const { data: session, status } = useSession();
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const homeTimelineRef = useRef<HomeTimelineHandle | null>(null);

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
        const userData = await response.json();
        if (isMounted) {
          setUserIsAdmin(isAdmin(userData?.data?.role));
        }
      } catch {
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

  const handleCreateEntry = () => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }
    setShowEntryForm(true);
  };

  const handleScheduleClick = () => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }
    setShowScheduleForm(true);
  };

  const handleScheduleSubmit = async (gameData: CreateScheduledGame, addCreatorToParticipants: boolean) => {
    try {
      setIsSubmittingSchedule(true);

      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...gameData,
          gameState: 'scheduled',
          addCreatorToParticipants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule game');
      }

      const responseData = await response.json();
      // API returns { success: true, data: { id: "..." } }
      const newGameId = responseData.data?.id || responseData.id;

      setShowScheduleForm(false);

      // Add the new game to HomeTimeline without page reload
      if (newGameId && homeTimelineRef.current) {
        await homeTimelineRef.current.addNewGame(newGameId);
      } else if (homeTimelineRef.current) {
        // Fallback: if we can't get the game ID, refetch all games
        await homeTimelineRef.current.addNewGame('');
      }
    } catch (err) {
      logError(err as Error, 'Failed to schedule game', {
        component: 'HomePage',
        operation: 'handleScheduleSubmit',
        gameData: { ...gameData, gameState: 'scheduled', addCreatorToParticipants },
      });
      throw err;
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleScheduleCancel = () => {
    setShowScheduleForm(false);
  };

  const handleEntrySuccess = async (entryId?: string) => {
    setShowEntryForm(false);
    
    // Add the new entry to HomeTimeline without page reload
    if (entryId && homeTimelineRef.current) {
      await homeTimelineRef.current.addNewEntry(entryId);
    } else if (homeTimelineRef.current) {
      // Fallback: if we can't get the entry ID, refetch all entries
      await homeTimelineRef.current.addNewEntry('');
    }
  };

  const handleEntryCancel = () => {
    setShowEntryForm(false);
  };


  return (
    <ErrorBoundary>
      <div className="flex justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full px-6 py-12 max-w-4xl">
        {/* Login Message - Only visible to non-authenticated users */}
        {status !== 'authenticated' && (
          <div className="mb-8 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
            <p className="text-amber-300 text-center font-medium">
              Log in to post, schedule games and archive memories!
            </p>
          </div>
        )}

        {/* Action Buttons - Only visible to authenticated users */}
        {status === 'authenticated' && (
          <div className="mt-12 mb-8 flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              onClick={handleCreateEntry}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              Create Entry
            </Button>
            <Button
              type="button"
              onClick={handleScheduleClick}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              Schedule a game
            </Button>
          </div>
        )}

        {/* Unified view of games, posts, and memories */}
        <HomeTimeline ref={homeTimelineRef} />

        {/* Schedule Game Form Modal */}
        {showScheduleForm && (
          <ScheduleGameForm
            onSubmit={handleScheduleSubmit}
            onCancel={handleScheduleCancel}
            isSubmitting={isSubmittingSchedule}
            userIsAdmin={userIsAdmin}
          />
        )}

        {/* Entry Form Modal */}
        {showEntryForm && (
          <EntryFormModal
            onSuccess={handleEntrySuccess}
            onCancel={handleEntryCancel}
          />
        )}
      </div>
      </div>
    </ErrorBoundary>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({ locale }) => {
  const withI18n = getStaticPropsWithTranslations(pageNamespaces);
  const i18nResult = await withI18n({ locale: locale as string });

      return {
    props: {
      ...(i18nResult.props || {}),
      translationNamespaces: pageNamespaces,
    },
    // Revalidate every 60 seconds to allow content to update
      revalidate: 60,
    };
};

