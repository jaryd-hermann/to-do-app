# Building Mindjoy as a Standalone App

## Why Expo Go vs Development Build?

- **Expo Go** (`npm start`): Quick development, but limited native features
- **Development Build**: Full native features, installs as standalone app on simulator/device

## Creating a Development Build for iOS Simulator

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Build for iOS Simulator
```bash
eas build --profile development --platform ios
```

This will:
- Build your app with all native dependencies
- Create an `.ipa` file for iOS Simulator
- Take about 10-15 minutes the first time

### Step 4: Install on Simulator

**Option A: Automatic (Recommended)**
```bash
eas build:run -p ios
```

**Option B: Manual**
1. Wait for build to complete
2. Download the `.ipa` file from EAS dashboard
3. Drag and drop onto iOS Simulator

### Step 5: Start Development Server
```bash
npm start -- --dev-client
```

This starts Metro bundler for your development build (not Expo Go).

## Quick Development Workflow

### For UI Development (Fast Iteration)
```bash
npm start
# Press 'i' for iOS simulator
# Uses Expo Go - fastest for UI changes
```

### For Native Features Testing (In-App Purchases, etc.)
```bash
# 1. Build once (takes 10-15 min)
eas build --profile development --platform ios

# 2. Install on simulator
eas build:run -p ios

# 3. Start dev server
npm start -- --dev-client

# 4. App appears on simulator home screen!
```

## Building for Production

### Auto-Incrementing Build Numbers

**IMPORTANT:** Build numbers are automatically incremented and committed before each build. 

**Always use one of these methods (never run `eas build` directly):**

**Option 1: Use npm scripts (Recommended)**
```bash
npm run build:ios      # iOS production build (auto-increments & commits)
npm run build:android  # Android production build (auto-increments & commits)
```

**Option 2: Use the wrapper script directly**
```bash
npm run eas:build -- --platform ios --profile production
npm run eas:build -- --platform android --profile production
npm run eas:build -- --platform ios --profile development  # For dev builds
```

**Option 3: Manual increment (if you need more control)**
```bash
npm run increment-build
git add app.json ios/Mindjoy/Info.plist ios/Mindjoy.xcodeproj/project.pbxproj
git commit -m "chore: increment build number"
eas build --platform ios --profile production
```

**Note:** The wrapper script automatically commits build number changes to git. If you don't want auto-commit, use `--no-commit` flag:
```bash
npm run eas:build -- --platform ios --profile production --no-commit
```

### iOS App Store
```bash
npm run build:ios
eas submit --platform ios
```

### Android Play Store
```bash
npm run build:android
eas submit --platform android
```

### Development Builds
```bash
npm run eas:build -- --platform ios --profile development
```

## Troubleshooting

### "Expo Go" keeps opening instead of your app
- Make sure you ran `npm start -- --dev-client` (not just `npm start`)
- Verify the development build is installed on simulator
- Check that you're using the correct bundle identifier

### Build fails
- Check EAS dashboard for detailed error logs
- Ensure all dependencies are compatible with Expo SDK 54
- Verify app.json configuration is correct

### App doesn't connect to Metro
- Make sure Metro bundler is running: `npm start -- --dev-client`
- Check that simulator and computer are on same network
- Try clearing Metro cache: `npx expo start -c --dev-client`

## Asset Requirements

Before building, ensure you have:
- `assets/icon.png` (1024x1024) - App icon
- `assets/splash.png` (1284x2778) - Splash screen
- `assets/adaptive-icon.png` (1024x1024) - Android adaptive icon
- `assets/favicon.png` (48x48) - Web favicon

Placeholder assets have been created, but replace them with actual designs before production builds.
