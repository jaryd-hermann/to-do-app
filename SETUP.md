# Mindjoy Setup Guide

## Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- Supabase account and project
- iOS Simulator (for Mac) or Android Emulator

## Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Set Up Supabase Database**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Run the migration file: `supabase/migrations/001_initial_schema.sql`
   - This will create all necessary tables, RLS policies, and constraints

4. **Create App Assets**
   - Create an `assets` folder in the root directory
   - Add the following files (or use Expo's default assets):
     - `icon.png` (1024x1024)
     - `splash.png` (1284x2778)
     - `adaptive-icon.png` (1024x1024)
     - `favicon.png` (48x48)

5. **Start Development Server**
   ```bash
   npm start
   ```

6. **Run on Device/Simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## Database Schema

The app uses the following main tables:
- `users` - User profiles and subscription status
- `principles` - User principles and system templates
- `goals` - User goals (max 5 active)
- `tasks` - Daily tasks (max 4 per day)

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Key Features

- **Authentication**: Email/password authentication via Supabase
- **Subscription**: 7-day free trial, then monthly/annual plans
- **Today Tab**: Daily task management with drag & drop reordering
- **Principles Tab**: Manage personal principles and browse inspiration
- **Goals Tab**: Set and track goals (max 5 active)
- **Progress Tab**: Weekly progress tracking and insights
- **Settings**: Account management, theme toggle, sharing

## Testing In-App Purchases

For testing subscriptions, you'll need to:
1. Set up products in App Store Connect
2. Use sandbox test accounts
3. Configure product IDs in the paywall component

## Troubleshooting

- **Metro bundler issues**: Clear cache with `npx expo start -c`
- **NativeWind not working**: Ensure `global.css` is imported in `app/_layout.tsx`
- **Supabase connection errors**: Verify environment variables are set correctly
- **TypeScript errors**: Run `npx tsc --noEmit` to check for type errors

## Next Steps

1. Add your Supabase credentials to `.env`
2. Run the database migration
3. Start the development server
4. Test the authentication flow
5. Configure in-app purchases for production
