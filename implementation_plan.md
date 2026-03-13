# Counselor App — Phase 1: Foundation

Build the project skeleton, design system, and auth flow. Everything after this phase has a solid base to build on.

## Project Location

`x:\MayankCodes\projects\manasya-counselor` — sibling to the web project.

## Tech Stack

| Layer | Package | Version |
|-------|---------|---------|
| Framework | `expo` | SDK 53 |
| Routing | `expo-router` | File-based (like Next.js) |
| Auth Storage | `expo-secure-store` | Android Keystore |
| Backend | `@supabase/supabase-js` | v2 |
| Server State | `@tanstack/react-query` | v5 |
| Local State | `zustand` | v5 |
| Animations | `react-native-reanimated` | v3 |
| Gestures | `react-native-gesture-handler` | v2 |
| Icons | `@expo/vector-icons` | Built-in |

## Proposed Changes

### 1. Project Setup

#### [NEW] Expo project initialization
- `npx create-expo-app@latest ./` in `manasya-counselor`
- Configure `app.json` with Manasya branding (package name: `com.manasya.counselor`)
- Install core dependencies

---

### 2. Design System

#### [NEW] `src/theme/` — Design tokens + reusable components

Premium, consistent design matching the web app's identity:
- **Colors**: Same palette (`primary: #14b8a6`, warm surfaces, dark mode ready)
- **Typography**: Inter (body) + Outfit (headings) via `expo-font`
- **Spacing**: 4px grid system
- **Shadows**: Elevation system matching Material 3
- **Components**: Button, Card, Input, Badge, BottomSheet, SkeletonLoader

---

### 3. Navigation Architecture

#### [NEW] `app/` — Expo Router file structure

```
app/
├── _layout.tsx          ← Root layout (providers, fonts, splash)
├── (auth)/
│   ├── _layout.tsx      ← Auth stack (no tabs)
│   ├── login.tsx        ← Login screen
│   └── signup.tsx       ← Signup screen
└── (main)/
    ├── _layout.tsx      ← Tab navigator
    ├── (dashboard)/
    │   └── index.tsx    ← Dashboard home
    ├── (sessions)/
    │   └── index.tsx    ← Sessions list
    └── (profile)/
        └── index.tsx    ← Profile
```

---

### 4. Auth with Supabase + SecureStore

#### [NEW] `src/lib/supabase.ts` — Client configured for native

Key difference from web: uses `expo-secure-store` instead of cookies.

```typescript
// Token persistence via Android Keystore
const storage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};
```

#### [NEW] `src/stores/auth-store.ts` — Zustand auth state

Manages `user`, `session`, `isLoading`, and role-based navigation guards.

---

### 5. Login Screen

#### [NEW] `app/(auth)/login.tsx`

- Email + password fields with validation
- Role enforcement: calls the **same** `/api/auth/login` endpoint (with `expectedRole: "counselor"`)
- "Forgot Password" link
- Animated transitions, haptic feedback on submit
- Error states with clear messaging

---

### 6. Signup Screen

#### [NEW] `app/(auth)/signup.tsx`

- Multi-step form: Credentials → Professional Info → Invite Code
- Calls the **same** `/api/auth/signup` endpoint
- Invite code verification via existing `/api/counselor/verify-code`
- Progress indicator at the top

---

## Verification Plan

### Automated
- `npx expo start` — verify the dev server runs
- Test on Android emulator via Expo Go or dev build

### Manual
- Login with existing counselor credentials from the web app
- Verify role enforcement (student account cannot log in)
- Verify JWT persists across app restarts
- Verify logout clears SecureStore
