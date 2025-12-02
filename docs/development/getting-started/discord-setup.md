# Discord OAuth Setup

Complete guide for setting up Discord OAuth authentication.

## Prerequisites

- **Discord application** (for authentication)

## Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name your application
4. Go to "OAuth2" section

## Configure OAuth2

1. Add redirect URI: `http://localhost:3000/api/auth/callback/discord`
2. Copy **Client ID** → `DISCORD_CLIENT_ID`
3. Copy **Client Secret** → `DISCORD_CLIENT_SECRET`
4. Enable required scopes: `identify`, `email`, `guilds`, `guilds.members.read`

Add to `.env.local`:

```bash
# Discord OAuth (for authentication)
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

## Get Discord Server ID (Optional)

If using guild-specific features:
1. Enable Developer Mode in Discord
2. Right-click server → Copy Server ID
3. Use in application if needed

## Verify Authentication

1. Visit `http://localhost:3000`
2. Click login/sign in
3. Should redirect to Discord OAuth
4. After authorization, should redirect back

## Common Issues

### Authentication Not Working

- **Check**: `NEXTAUTH_SECRET` is set
- **Check**: `NEXTAUTH_URL` matches your dev URL
- **Check**: Discord redirect URI matches exactly
- **Check**: Discord client ID/secret are correct
- **Solution**: Clear browser cookies and try again

## Production Environment

For production, update the redirect URI in Discord Developer Portal:
- Production: `https://your-domain.com/api/auth/callback/discord`
- Update `NEXTAUTH_URL` in production environment variables

## Related Documentation

- [Environment Setup](./setup.md)
- [Authentication & Authorization](../../production/security/authentication-authorization.md)

