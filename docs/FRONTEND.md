# Frontend
The frontend is a react-native app built off expo. 

# Getting Started

Make sure to copy or rename .env.example to .env.local, filling in the expected variables. This allows the frontend to communicate with the backend server.

Once created, navigate to /backend and start the backend services

```bash
docker compose up -d
```

In /frontend/Lecturelink, run either

```bash
npx expo start          // build via Expo-Go
npx expo run:ios        // build for IOS emulator
npx expo run:android    // build for Android emulator
```

# Structure Overview

## Organization

```md
frontend/
│
├── app/                         ← ROUTING
│   ├── index.tsx
│   ├── register.tsx
│   ├── profile.tsx
│   └── matches.tsx
│
└── src/
    ├── screens/                 ← FULL SCREENS
    │   ├── LoginScreen.tsx
    │   ├── RegisterScreen.tsx
    │   ├── ProfileScreen.tsx
    │   └── MatchesScreen.tsx
    │
    ├── components/              ← REUSABLE UI
    │   ├── Buttons.tsx
    │   ├── InputField.tsx
    │   └── ProfileCard.tsx
    │
    └── services/                ← API
        ├── auth.ts
        ├── profile.ts
        └── matches.ts
```

Navigation is handled file-based via Expo Router. For clear, intuitive management of tabs and nested screens, I followed a general recommended directory structure:

```md
Lecturelink/
└── app/
    ├── _layout.tsx              # Root Layout (Root Stack, Auth Context Provider)
    ├── (auth)/                  # Auth Group (Hidden from URL)
    │   ├── login.tsx            # /login
    │   └── register.tsx         # /register
    ├── (tabs)/                  # Main Application Tabs Group
    │   ├── _layout.tsx          # Defines the Bottom Tab Bar Navigation
    │   ├── index.tsx            # First Tab: Home Screen (/index)
    │   ├── explore.tsx          # Second Tab: Explore Screen
    │   └── profile/             # Third Tab: Profile Stack (Handles nested screens)
    │       ├── _layout.tsx      # Profile Stack Layout (Inner Stack)
    │       ├── index.tsx        # Profile Main Screen
    │       └── settings.tsx     # Nested Profile Screen (/profile/settings)
    └── +not-found.tsx           # Fallback 404 Screen
```