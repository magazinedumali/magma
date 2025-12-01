# Security Guidelines

## ⚠️ IMPORTANT: Never Commit Secrets

**NEVER commit the following to the repository:**
- Google OAuth client secrets
- API keys
- Database credentials
- Any `.env` files with real values
- Credential JSON files

## Google OAuth Setup

Google OAuth credentials should be configured directly in the Supabase dashboard, not in this repository.

### Steps to Configure Google OAuth:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** provider
4. Enter your Google OAuth credentials:
   - Client ID
   - Client Secret
5. Configure the redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### Local Development

If you need to test Google OAuth locally, you can:
1. Create a `.env.local` file (already in `.gitignore`)
2. Store credentials there if needed for local testing
3. **Never commit this file**

## File Structure

- `client_secret.example.json` - Template showing the structure (no real secrets)
- `client_secret*.json` - **IGNORED** - Your actual credentials (if needed locally)

## If You Accidentally Committed Secrets

If you've accidentally committed secrets:

1. **Immediately rotate/revoke the exposed credentials**
2. Remove the file from Git history:
   ```bash
   git rm --cached <file>
   git commit -m "Remove secrets"
   ```
3. Consider using `git filter-branch` or BFG Repo-Cleaner to remove from history
4. Force push (coordinate with team first!)

## Best Practices

- Use environment variables for all secrets
- Configure OAuth providers through Supabase dashboard
- Use `.env.example` files to document required variables
- Regularly audit your repository for exposed secrets

