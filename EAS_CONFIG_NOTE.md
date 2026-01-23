# EAS Configuration Note

## Why Hardcoded Values in eas.json?

The `${EXPO_PUBLIC_SUPABASE_URL}` syntax in `eas.json` doesn't work reliably because:

1. `app.config.js` runs during the config phase, before EAS fully injects secrets
2. The secret substitution happens too late in the build process
3. `process.env.EXPO_PUBLIC_SUPABASE_URL` is empty when `app.config.js` reads it

## Current Solution

Hardcoded values in `eas.json` work because:
- EAS reads them directly and injects into `process.env` immediately
- `app.config.js` can read them successfully
- The app works correctly

## Security Consideration

**These values are in your repo.** However:
- The Supabase anon key is **public by design** - it's meant to be exposed in client apps
- It's protected by Row Level Security (RLS) policies in Supabase
- The key alone cannot access user data without proper authentication

## If You Need Better Security

1. **Use Supabase RLS policies** (already implemented) - this is the real security layer
2. **Rotate the anon key** if it's ever compromised
3. **Monitor Supabase logs** for suspicious activity

## Alternative Approaches (Not Recommended)

- Gitignoring `eas.json` - Won't work, EAS needs it
- Using EAS secrets with `${}` syntax - Doesn't work reliably
- Reading from a separate config file - Adds complexity

## Bottom Line

Hardcoding in `eas.json` is the most reliable solution for this use case. The security risk is minimal because:
- The anon key is public-facing by design
- RLS policies protect your data
- The key can be rotated if needed
