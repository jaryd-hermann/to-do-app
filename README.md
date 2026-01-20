# Mindjoy

A principle-driven daily to-do list app for ambitious people who want to focus on the most important things each day, aligned with their principles and goals.

## Features

- **Constrained Task Management**: Maximum 4 tasks per day with one primary task
- **Principle Alignment**: Every task must connect to a user-defined principle
- **Goal Tracking**: Up to 5 active goals with action tracking
- **Weekly Progress**: Track completion rates and principle focus
- **Story-Based Onboarding**: Interactive stories explaining the app philosophy
- **Dark Mode**: Beautiful dark theme (default) with light mode option
- **Subscription Management**: 7-day free trial with monthly/annual plans

## Tech Stack

- **Frontend**: Expo SDK 54, React 19, React Native 0.81, TypeScript
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind CSS)
- **Backend**: Supabase (Auth, Database, RLS)
- **State Management**: React Context API
- **Payments**: Expo In-App Purchases

## Getting Started

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Project Structure

```
/app
  /(auth)          # Authentication flow
  /(tabs)          # Main app tabs
  /story           # Story screens
/components        # Reusable components
/contexts          # React contexts
/hooks             # Custom hooks
/lib               # Utilities and services
/types             # TypeScript types
/supabase          # Database migrations
```

## License

Private - All rights reserved
