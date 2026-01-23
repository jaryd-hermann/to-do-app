# Supabase Configuration for React Native App

## Required Supabase Settings

### 1. Site URL
**Current:** `http://localhost:3000` (for web development)

**For Production:** This should be set to your app's deep link scheme or a fallback URL.

**Recommended:** Keep `http://localhost:3000` for development, but this doesn't affect React Native apps directly.

### 2. Redirect URLs (CRITICAL)

You need to add redirect URLs that match your app's URL scheme. Based on your app configuration:

**Add these Redirect URLs in Supabase Dashboard:**

1. `mindjoy://` - Main app scheme
2. `com.jarydhermann.mindjoy://` - Bundle identifier scheme  
3. `exp+mindjoy://` - Expo development scheme

**How to add:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Click "Add URL" in the Redirect URLs section
3. Add each URL above, one at a time
4. Click "Save changes"

### 3. Why This Matters

Even though you're using email/password authentication (not OAuth), Supabase may still need redirect URLs configured for:
- Email confirmation links (if enabled)
- Password reset links
- OAuth providers (if you add them later)
- Deep linking callbacks

### 4. Testing

After adding redirect URLs:
1. Rebuild your app (if needed)
2. Test sign-in on device
3. Check device logs for any redirect-related errors

## Alternative: Disable Email Confirmation

If you don't want to deal with redirect URLs, you can disable email confirmation in Supabase:

1. Go to Authentication → Email Templates
2. Disable "Confirm signup" if you don't need email verification
3. This reduces the need for redirect URLs

## Current App Configuration

Your app uses these URL schemes (from `Info.plist`):
- `mindjoy://`
- `com.jarydhermann.mindjoy://`
- `exp+mindjoy://` (for Expo development)

Make sure all of these are added to Supabase Redirect URLs.
