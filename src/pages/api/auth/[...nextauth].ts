import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { createComponentLogger, logError } from "@/features/infrastructure/logging";

const nextAuthLogger = createComponentLogger('nextauth');

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: {
        params: {
          // Request access to read guild-specific member data (nickname)
          // so we can prefer the user's server nickname when available.
          scope: "identify email guilds guilds.members.read",
          prompt: "consent",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signIn(message) {
      // Use logger for sign-in events (debug level)
      nextAuthLogger.debug('User signed in', { message });
      // User data is saved in the JWT callback to ensure we have complete information
      // including the preferred name from guild nickname if available
    },
  },
  logger: {
    error(code, ...metadata) {
      // Use logger for NextAuth errors
      const meta: Record<string, unknown> = {
        code: String(code),
      };
      if (metadata.length > 0) {
        meta.metadata = metadata;
      }
      nextAuthLogger.error('NextAuth error', undefined, meta);
    },
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      try {
        // On initial sign-in we have both account and profile
        if (account && profile) {
          interface DiscordProfile {
            id: string;
            email?: string;
            name?: string;
            username?: string;
            global_name?: string;
            display_name?: string;
            image_url?: string;
            avatar_url?: string;
            avatar?: string;
          }
          const discordProfile = profile as DiscordProfile;
          token.discordId = discordProfile.id;

          // Prefer guild nickname (if we can fetch it), otherwise Discord display name, then username/name
          let preferredName: string | undefined =
            discordProfile.global_name || discordProfile.display_name || discordProfile.username || profile.name || token.name;

          interface DiscordAccount {
            access_token?: string;
            providerAccountId: string;
          }
          const discordAccount = account as DiscordAccount;

          // If configured, try to fetch the user's nickname from a specific guild
          try {
            const guildId = process.env.DISCORD_GUILD_ID;
            const accessToken = discordAccount.access_token;
            if (guildId && accessToken) {
              const res = await fetch(`https://discord.com/api/v10/users/@me/guilds/${guildId}/member`, {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              if (res.ok) {
                const member = (await res.json()) as { nick?: string };
                if (member?.nick) {
                  preferredName = member.nick;
                }
              }
            }
          } catch {
            // Silently ignore nickname fetch failures and fallback to display name/username
          }

          token.name = preferredName;

          // Try to ensure we have a usable avatar URL
          const existingPicture = token.picture;
          const candidatePicture = discordProfile.image_url || discordProfile.avatar_url || existingPicture;
          const finalAvatarUrl = candidatePicture ||
            (discordProfile.id && discordProfile.avatar
              ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
              : undefined);
          if (finalAvatarUrl) {
            token.picture = finalAvatarUrl;
          }

          // Update user data in Firestore with complete information including preferred name
          // Use dynamic import to avoid pulling Firebase Admin SDK into module initialization
          try {
            const { saveUserDataServer } = await import("@/features/modules/community/users/services/userDataService.server");
            await saveUserDataServer({
              discordId: discordProfile.id || discordAccount.providerAccountId,
              email: discordProfile.email || profile.email,
              name: profile.name,
              preferredName: preferredName,
              avatarUrl: finalAvatarUrl,
              username: discordProfile.username,
              globalName: discordProfile.global_name,
              displayName: discordProfile.display_name,
            });
          } catch (error) {
            // Log error but don't fail the auth process
            // Always log errors to help with debugging
            logError(error as Error, 'Failed to update user data in JWT callback', {
              component: 'nextauth',
              operation: 'jwt',
              discordId: discordProfile.id || discordAccount.providerAccountId,
            });
          }
        }
        return token;
      } catch (error) {
        // Log error but return token to prevent auth failure
        logError(error as Error, 'Failed to process JWT callback', {
          component: 'nextauth',
          operation: 'jwt',
        });
        return token;
      }
    },
    async session({ session, token }) {
      try {
        // Expose Discord ID and ensure session.user fields reflect our JWT
        session.discordId = token.discordId;
        if (session.user) {
          session.user.name = (token.name as string | undefined) || session.user.name || 'User';
          session.user.image = (token.picture as string | undefined) || session.user.image || undefined;
        }
        return session;
      } catch (error) {
        // Log error but return session with fallback values
        logError(error as Error, 'Failed to process session callback', {
          component: 'nextauth',
          operation: 'session',
        });
        // Return minimal valid session to prevent auth failure
        if (session.user) {
          session.user.name = session.user.name || 'User';
        }
        return session;
      }
    },
  },
};

export default NextAuth(authOptions);


