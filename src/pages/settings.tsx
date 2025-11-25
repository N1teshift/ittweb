import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { getUserDataByDiscordId } from '@/features/shared/lib/userDataService';
import { UserData } from '@/types/userData';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import PageHero from '@/features/shared/components/PageHero';
import { Timestamp } from 'firebase/firestore';

type SerializedUserData = Record<string, unknown> | null;

interface SettingsPageProps {
  userData: SerializedUserData;
}

export default function SettingsPage({ userData }: SettingsPageProps) {
  const { data: session } = useSession();

  const formatDate = (date: Date | Timestamp | string | undefined) => {
    if (!date) return 'N/A';
    try {
      let d: Date;
      if (date instanceof Date) {
        d = date;
      } else if (date && typeof date === 'object' && 'toDate' in date) {
        d = (date as Timestamp).toDate();
      } else if (typeof date === 'string') {
        d = new Date(date);
      } else {
        return 'N/A';
      }
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
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
    <div className="min-h-[calc(100vh-8rem)]">
      <PageHero
        title="Settings"
        description="View and manage your account information"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userData ? (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 space-y-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4 pb-6 border-b border-amber-500/20">
              {'avatarUrl' in userData && Boolean(userData.avatarUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userData.avatarUrl as string}
                  alt={(userData.preferredName as string) || (userData.name as string) || 'User'}
                  className="w-20 h-20 rounded-full border-2 border-amber-500/50"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {(userData.preferredName as string) ||
                    (userData.name as string) ||
                    (userData.username as string) ||
                    'User'}
                </h2>
                {'role' in userData && Boolean(userData.role) && (
                  <span className="inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full bg-amber-600/30 text-amber-300 border border-amber-500/50">
                    {(userData.role as string).charAt(0).toUpperCase() + (userData.role as string).slice(1)}
                  </span>
                )}
              </div>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-400">Discord ID</label>
                <p className="mt-1 text-white font-mono text-sm">{userData.discordId as string}</p>
              </div>

              {'email' in userData && Boolean(userData.email) && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <p className="mt-1 text-white">{userData.email as string}</p>
                </div>
              )}

              {'username' in userData && Boolean(userData.username) && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Discord Username</label>
                  <p className="mt-1 text-white">{userData.username as string}</p>
                </div>
              )}

              {'globalName' in userData && Boolean(userData.globalName) && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Global Name</label>
                  <p className="mt-1 text-white">{userData.globalName as string}</p>
                </div>
              )}

              {'displayName' in userData && Boolean(userData.displayName) && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Display Name</label>
                  <p className="mt-1 text-white">{userData.displayName as string}</p>
                </div>
              )}

              {'preferredName' in userData && Boolean(userData.preferredName) && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Preferred Name</label>
                  <p className="mt-1 text-white">{userData.preferredName as string}</p>
                </div>
              )}

              {'createdAt' in userData && Boolean(userData.createdAt) && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Account Created</label>
                  <p className="mt-1 text-white">{formatDate(userData.createdAt as string)}</p>
                </div>
              )}

              {'lastLoginAt' in userData && Boolean(userData.lastLoginAt) && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Last Login</label>
                  <p className="mt-1 text-white">{formatDate(userData.lastLoginAt as string)}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-amber-500/20">
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 text-center">
            <p className="text-gray-400">No user data found. Your account may not be fully set up yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const serializeUserData = (data: UserData | null): SerializedUserData => {
  if (!data) {
    return null;
  }

  const serialized: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (value instanceof Date) {
      serialized[key] = value.toISOString();
      return;
    }

    if (value && typeof value === 'object' && 'toDate' in value && typeof (value as Timestamp).toDate === 'function') {
      serialized[key] = (value as Timestamp).toDate().toISOString();
      return;
    }

    serialized[key] = value;
  });

  return serialized;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || !session.discordId) {
    return {
      props: {
        userData: null,
      },
    };
  }

  try {
    const userData = await getUserDataByDiscordId(session.discordId);
    const serializedUserData = serializeUserData(userData);

    return {
      props: {
        userData: serializedUserData,
      },
    };
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return {
      props: {
        userData: null,
      },
    };
  }
};

