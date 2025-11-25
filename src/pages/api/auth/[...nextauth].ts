import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { saveUserData } from "@/lib/userDataService";

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
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[NextAuth signIn]', message);
      }
      // User data is saved in the JWT callback to ensure we have complete information
      // including the preferred name from guild nickname if available
    },
  },
  logger: {
    error(code, ...metadata) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('[NextAuth error]', code, ...metadata);
      }
    },
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // On initial sign-in we have both account and profile
      if (account && profile) {
        const anyProfile = profile as any;
        token.discordId = anyProfile.id;

        // Prefer guild nickname (if we can fetch it), otherwise Discord display name, then username/name
        let preferredName: string | undefined =
          anyProfile.global_name || anyProfile.display_name || anyProfile.username || profile.name || (token as any).name;

        // If configured, try to fetch the user's nickname from a specific guild
        try {
          const guildId = process.env.DISCORD_GUILD_ID;
          const accessToken = (account as any).access_token as string | undefined;
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

        (token as any).name = preferredName;

        // Try to ensure we have a usable avatar URL
        const existingPicture = (token as any).picture as string | undefined;
        const candidatePicture = anyProfile.image_url || anyProfile.avatar_url || existingPicture;
        const finalAvatarUrl = candidatePicture || 
          (anyProfile.id && anyProfile.avatar 
            ? `https://cdn.discordapp.com/avatars/${anyProfile.id}/${anyProfile.avatar}.png`
            : undefined);
        if (finalAvatarUrl) {
          (token as any).picture = finalAvatarUrl;
        }

        // Update user data in Firestore with complete information including preferred name
        try {
          await saveUserData({
            discordId: anyProfile.id || account.providerAccountId,
            email: anyProfile.email || profile.email,
            name: profile.name,
            preferredName: preferredName,
            avatarUrl: finalAvatarUrl,
            username: anyProfile.username,
            globalName: anyProfile.global_name,
            displayName: anyProfile.display_name,
          });
        } catch (error) {
          // Log error but don't fail the auth process
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('[NextAuth JWT] Failed to update user data:', error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Expose Discord ID and ensure session.user fields reflect our JWT
      (session as any).discordId = (token as any).discordId;
      if (session.user) {
        session.user.name = ((token as any).name as string | undefined) || session.user.name || 'User';
        session.user.image = ((token as any).picture as string | undefined) || session.user.image || undefined;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);


