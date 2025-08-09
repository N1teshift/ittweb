import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

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
        if (candidatePicture) {
          (token as any).picture = candidatePicture;
        } else if (anyProfile.id && anyProfile.avatar) {
          // Construct from CDN if raw fields are present
          (token as any).picture = `https://cdn.discordapp.com/avatars/${anyProfile.id}/${anyProfile.avatar}.png`;
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


