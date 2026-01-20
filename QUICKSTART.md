# Quick Start Guide

## ✅ Expo Project Status

Your Expo project is **connected** with project ID: `bb5756a3-1b15-49d6-94a4-18cb7297ba59`

## 🔧 Setup Steps

### 1. Create Environment File

Create a `.env` file in the root directory with your Supabase credentials:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://itfzmnvftucjamkaxkjg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_OmOdo7Uyvih2VZgX9jJtiw_gvYc-Lrg
```

**Note**: The `.env` file is gitignored for security. You'll need to create it manually.

### 2. Set Up Database

1. Go to your Supabase dashboard: https://itfzmnvftucjamkaxkjg.supabase.co
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`
4. This creates all tables, RLS policies, and constraints

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm start
```

This will open Expo DevTools in your browser.

## 🚀 Running in iOS Simulator

### Option 1: Using Expo CLI (Recommended for Development)

1. **Start the dev server:**
   ```bash
   npm start
   ```

2. **Press `i` in the terminal** to open iOS Simulator
   - Or click "Run on iOS simulator" in the Expo DevTools browser

3. **First time setup:**
   - Make sure you have Xcode installed
   - The simulator will open automatically
   - The app will build and launch

### Option 2: Using EAS Build (For Production-like Testing)

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Build for iOS Simulator:**
   ```bash
   eas build --profile development --platform ios
   ```

4. **Install the build:**
   - EAS will provide a download link
   - Download and install on your simulator
   - Or use: `eas build:run -p ios`

## 📱 Testing Workflow

### Development Mode (Fast Refresh)
```bash
npm start
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
```

**Benefits:**
- Fast refresh (instant updates)
- Hot reloading
- Easy debugging
- No build time

### Development Build (Closer to Production)
```bash
eas build --profile development --platform ios
```

**Benefits:**
- Native modules work properly
- Closer to production experience
- Can test in-app purchases (sandbox)
- Better performance testing

## 🔍 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
npx expo start -c
```

### Simulator Not Opening
```bash
# Check if Xcode is installed
xcode-select --print-path

# Open simulator manually
open -a Simulator
```

### Environment Variables Not Loading
- Make sure `.env` file exists in root directory
- Restart Metro bundler after creating `.env`
- Check that variables start with `EXPO_PUBLIC_`

### Database Connection Issues
- Verify Supabase URL and key in `.env`
- Check that migration was run successfully
- Verify RLS policies are enabled

## 📦 Building for Production

### iOS App Store
```bash
eas build --profile production --platform ios
eas submit --platform ios
```

### Android Play Store
```bash
eas build --profile production --platform android
eas submit --platform android
```

## 🎯 Next Steps

1. ✅ Create `.env` file with Supabase credentials
2. ✅ Run database migration in Supabase SQL Editor
3. ✅ Start dev server: `npm start`
4. ✅ Press `i` to launch iOS Simulator
5. ✅ Test authentication flow
6. ✅ Test task creation and management
7. ✅ Configure in-app purchases in App Store Connect

## 📝 Notes

- **Development builds** are recommended for testing native features like in-app purchases
- **Expo Go** (development mode) has limitations with some native modules
- Use **EAS Build** for production-like testing before submitting to stores
