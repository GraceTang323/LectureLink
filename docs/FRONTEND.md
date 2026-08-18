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