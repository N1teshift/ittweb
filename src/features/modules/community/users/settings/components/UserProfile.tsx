import { signOut } from 'next-auth/react';
import { formatDate } from '../utils/formatDate';

type SerializedUserData = Record<string, unknown> | null;

interface UserProfileProps {
  userData: SerializedUserData;
  onDeleteAccountClick: () => void;
}

export function UserProfile({ userData, onDeleteAccountClick }: UserProfileProps) {
  if (!userData) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 text-center">
        <p className="text-gray-400">No user data found. Your account may not be fully set up yet.</p>
      </div>
    );
  }

  return (
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
      <div className="pt-6 border-t border-amber-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            Sign Out
          </button>
          <button
            onClick={onDeleteAccountClick}
            className="px-4 py-2 text-sm rounded-md bg-red-800 hover:bg-red-700 text-white transition-colors border border-red-600"
          >
            Delete Account
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Deleting your account will permanently remove all your data from our system. This action cannot be undone.
        </p>
      </div>
    </div>
  );
}

