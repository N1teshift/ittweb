import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { getUserDataByDiscordIdServer } from '@/features/modules/community/users/services/userDataService.server';
import { UserRole } from '@/types/userData';
import { useSession } from 'next-auth/react';
import { PageHero, ErrorBoundary } from '@/features/infrastructure/components';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { isAdmin } from '@/features/modules/community/users';
import { logError } from '@/features/infrastructure/logging';
import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { serializeUserData } from '@/features/modules/community/users/settings/utils/serializeUserData';
import { UserProfile } from '@/features/modules/community/users/settings/components/UserProfile';
import { AdminTools } from '@/features/modules/community/users/settings/components/AdminTools';
import { DeleteAccountDialog } from '@/features/modules/community/users/settings/components/DeleteAccountDialog';
import { WipeTestDataDialog } from '@/features/modules/community/users/settings/components/WipeTestDataDialog';
import { WipeEntriesDialog } from '@/features/modules/community/users/settings/components/WipeEntriesDialog';

const pageNamespaces = ["common"];

type SerializedUserData = Record<string, unknown> | null;

interface SettingsPageProps {
  userData: SerializedUserData;
  translationNamespaces?: string[];
}

export default function SettingsPage({ userData }: SettingsPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showWipeDialog, setShowWipeDialog] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeError, setWipeError] = useState<string | null>(null);
  const [wipeSuccess, setWipeSuccess] = useState<string | null>(null);
  const [showWipeEntriesDialog, setShowWipeEntriesDialog] = useState(false);
  const [isWipingEntries, setIsWipingEntries] = useState(false);
  const [wipeEntriesError, setWipeEntriesError] = useState<string | null>(null);
  const [wipeEntriesSuccess, setWipeEntriesSuccess] = useState<string | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (userData && 'role' in userData) {
      setUserIsAdmin(isAdmin(userData.role as UserRole | undefined));
    }
  }, [userData]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete account');
      }

      // Sign out and redirect to home
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      const err = error as Error;
      setDeleteError(err.message || 'An error occurred while deleting your account');
      setIsDeleting(false);
    }
  };

  const handleWipeTestData = async () => {
    setIsWiping(true);
    setWipeError(null);

    try {
      const response = await fetch('/api/admin/wipe-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to wipe test data');
      }

      const result = await response.json();
      setShowWipeDialog(false);

      // Build deletion summary message
      const counts = result.deletedCounts || {};
      const summaryLines = Object.entries(counts)
        .filter(([_, count]) => typeof count === 'number' && count > 0)
        .map(([key, count]) => `${key}: ${count}`)
        .join(', ');

      const message = summaryLines
        ? `All data wiped successfully! Deleted: ${summaryLines}`
        : 'All data wiped successfully!';

      setWipeSuccess(message);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setWipeSuccess(null);
      }, 5000);
    } catch (error) {
      const err = error as Error;
      setWipeError(err.message || 'An error occurred while wiping test data');
      setIsWiping(false);
    }
  };

  const handleWipeAllEntries = async () => {
    setIsWipingEntries(true);
    setWipeEntriesError(null);

    try {
      const response = await fetch('/api/admin/wipe-all-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to wipe all entries');
      }

      const result = await response.json();
      setShowWipeEntriesDialog(false);

      // Build deletion summary message
      const counts = result.deletedCounts || {};
      const summaryLines = Object.entries(counts)
        .filter(([_, count]) => typeof count === 'number' && count > 0)
        .map(([key, count]) => `${key}: ${count}`)
        .join(', ');

      const message = summaryLines
        ? `All entries and images deleted successfully! Deleted: ${summaryLines}`
        : 'All entries and images deleted successfully!';

      setWipeEntriesSuccess(message);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setWipeEntriesSuccess(null);
      }, 5000);

      // Refresh the page to reflect changes after a short delay
      setTimeout(() => {
        router.reload();
      }, 2000);
    } catch (error) {
      const err = error as Error;
      setWipeEntriesError(err.message || 'An error occurred while wiping all entries');
      setIsWipingEntries(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please sign in to view your settings</h1>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHero
          title="Settings"
          description="View and manage your account information"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserProfile
          userData={userData}
          onDeleteAccountClick={() => setShowDeleteDialog(true)}
        />

            {userIsAdmin && (
          <div className="mt-6">
            <AdminTools
              onWipeTestDataClick={() => {
                      setShowWipeDialog(true);
                      setWipeSuccess(null);
                    }}
              onWipeEntriesClick={() => {
                      setShowWipeEntriesDialog(true);
                      setWipeEntriesSuccess(null);
                    }}
              wipeSuccess={wipeSuccess}
              wipeEntriesSuccess={wipeEntriesSuccess}
            />
          </div>
        )}

        <DeleteAccountDialog
          isOpen={showDeleteDialog}
          isDeleting={isDeleting}
          error={deleteError}
          onConfirm={handleDeleteAccount}
          onCancel={() => {
                    setShowDeleteDialog(false);
                    setDeleteError(null);
                  }}
        />

        <WipeTestDataDialog
          isOpen={showWipeDialog}
          isWiping={isWiping}
          error={wipeError}
          onConfirm={handleWipeTestData}
          onCancel={() => {
                    setShowWipeDialog(false);
                    setWipeError(null);
                  }}
        />

        <WipeEntriesDialog
          isOpen={showWipeEntriesDialog}
          isWiping={isWipingEntries}
          error={wipeEntriesError}
          onConfirm={handleWipeAllEntries}
          onCancel={() => {
                    setShowWipeEntriesDialog(false);
                    setWipeEntriesError(null);
                  }}
        />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export const getServerSideProps: GetServerSideProps<SettingsPageProps> = async (context) => {
  const withI18n = getStaticPropsWithTranslations(pageNamespaces);
  const i18nResult = await withI18n({ locale: context.locale as string });
  
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || !session.discordId) {
    return {
      props: {
        ...(i18nResult.props || {}),
        translationNamespaces: pageNamespaces,
        userData: null,
      },
    };
  }

  try {
    const userData = await getUserDataByDiscordIdServer(session.discordId);
    const serializedUserData = serializeUserData(userData);

    return {
      props: {
        ...(i18nResult.props || {}),
        translationNamespaces: pageNamespaces,
        userData: serializedUserData,
      },
    };
  } catch (error) {
    logError(error as Error, 'Failed to fetch user data', {
      component: 'SettingsPage',
      operation: 'getServerSideProps',
      discordId: session?.discordId,
    });
    return {
      props: {
        ...(i18nResult.props || {}),
        translationNamespaces: pageNamespaces,
        userData: null,
      },
    };
  }
};
