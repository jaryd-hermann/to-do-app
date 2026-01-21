# Apple In-App Subscription Setup Guide

This guide walks you through setting up Apple In-App Subscriptions for Mindjoy.

## Prerequisites

1. **Apple Developer Account** (paid membership required)
2. **App Store Connect** access
3. **App already created** in App Store Connect with bundle ID: `com.jarydhermann.mindjoy`

## Step-by-Step Setup

### 1. Create Subscription Groups in App Store Connect

1. Log into [App Store Connect](https://appstoreconnect.apple.com)
2. Go to **My Apps** → Select **Mindjoy**
3. Navigate to **Features** → **In-App Purchases**
4. Click **+** to create a new subscription group
5. Name it: **"Mindjoy Premium"** (or similar)
6. Click **Create**

### 2. Create Subscription Products

Within your subscription group, create two subscriptions:

#### Annual Subscription
1. Click **Create Subscription**
2. **Reference Name**: `Mindjoy Annual`
3. **Product ID**: `mindjoy_annual` (must match exactly what's in code)
4. **Subscription Duration**: 1 Year
5. **Price**: Set to $100.00 (or your desired price)
6. **Free Trial**: 7 days
7. **Localization**: Add display name and description
   - Display Name: "Mindjoy Annual"
   - Description: "Unlimited principles, goals, and progress tracking"
8. Click **Create**

#### Monthly Subscription
1. Click **Create Subscription** again
2. **Reference Name**: `Mindjoy Monthly`
3. **Product ID**: `mindjoy_monthly` (must match exactly what's in code)
4. **Subscription Duration**: 1 Month
5. **Price**: Set to $15.00 (or your desired price)
6. **Free Trial**: 7 days
7. **Localization**: Add display name and description
   - Display Name: "Mindjoy Monthly"
   - Description: "Unlimited principles, goals, and progress tracking"
8. Click **Create**

### 3. Configure Subscription Group

1. In your subscription group, set the **Display Name** for the group
2. Ensure both subscriptions are **Active** (not in draft)
3. Set up **Subscription Levels** if you want to offer upgrades/downgrades

### 4. Submit for Review (Sandbox Testing First)

**Important**: Before submitting for review, test in sandbox:

1. Go to **Users and Access** → **Sandbox Testers**
2. Create a sandbox tester account (use a different email than your Apple ID)
3. Sign out of your Apple ID on your test device
4. When testing, use the sandbox tester credentials

### 5. Testing in Development

For development/testing:
- Use the "[DEV] Skip Paywall" button in simulator
- For real device testing, use sandbox testers
- Products must be in **"Ready to Submit"** status (not draft) to test

### 6. Handle Purchase Receipts

After a successful purchase, you'll receive a receipt. You should:
1. Verify the receipt with Apple's servers
2. Store the receipt in your backend
3. Update the user's subscription status in Supabase

### 7. Production Release

Once ready:
1. Submit your app for review with subscriptions
2. Apple will review both the app and subscription products
3. Once approved, subscriptions will be live

## Important Notes

- **Product IDs** must match exactly: `mindjoy_annual` and `mindjoy_monthly`
- Subscriptions must be in **"Ready to Submit"** status to test (even in sandbox)
- Free trials are configured in App Store Connect, not in code
- Receipt validation should happen server-side for security
- Test thoroughly in sandbox before production release

## Current Code Status

The app is configured to:
- Use product IDs: `mindjoy_annual` and `mindjoy_monthly`
- Handle free trials (7 days)
- Show paywall only when subscription is expired
- Allow manual paywall access from Settings

## Next Steps

1. Create the subscription products in App Store Connect
2. Test with sandbox testers
3. Implement server-side receipt validation (recommended)
4. Submit for App Review
