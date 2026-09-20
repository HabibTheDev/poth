# Poth (পথ) — Vehicle Navigation & Road Intelligence

A vehicle-aware navigation + community road-intelligence app for Bangladesh, built with
Expo Router, TypeScript, and React Native. This is the **frontend only** — see
[Connecting the backend](#connecting-the-backend) for how to wire up the Node/Express/Prisma
API described in the product spec once it exists.

## What's built

This implements the **Phase 1 MVP** scope from the product spec (section 50), on an
architecture designed so Phases 2–4 (confidence scoring refinements, road-quality history,
weather integration, AI moderation, etc.) can be added without a rewrite:

- Phone + OTP authentication flow (mock)
- Onboarding (3-slide, bilingual)
- Vehicle profiles — multiple vehicles, type/fuel/tank/mileage/odometer
- Home/Map screen — current location, search, incident + fuel-station markers, one-handed
  floating controls, bottom sheet with nearby road reports
- Route preview — fastest/cheapest/safest/best-road options, fuel-reach estimate, trip cost
  estimate (BDT)
- Turn-by-turn navigation screen — glanceable ETA/distance, upcoming-incident alert banner,
  "Still there?" quick confirmation
- Incident reporting — category grid (14 types from the spec), optional note, auto-merge
  with nearby reports of the same type (section 12), confidence + expiry lifecycle
  (sections 10, 13, 15)
- Community posts — feed, post detail, comments
- Trip history, profile/settings, language (English/Bangla) and theme (light/dark) switching

**Explicitly deferred** (per the spec's own phasing rule — don't build every advanced
feature immediately): admin/moderation panel (a separate surface, not mobile), image-based
incident detection, weather-driven road intelligence, accelerometer-based road-condition
detection, automatic accident detection, and real push notifications. The architecture
leaves clean seams for all of these (see `src/services`).

## Getting started

```bash
npm install
npx expo install   # aligns every native package to this Expo SDK's exact versions
npx expo start
```

Requires Node 20+. Run on a device with Expo Go, or build a dev client with
`npx expo run:ios` / `npx expo run:android`.

### Maps setup

`react-native-maps` needs a Google Maps API key for Android (iOS uses Apple Maps by
default, no key needed for basic use). Add yours in `app.json`:

```json
"android": { "config": { "googleMaps": { "apiKey": "YOUR_KEY_HERE" } } }
```

### Location permissions

Already declared in `app.json` (`expo-location` plugin + iOS `Info.plist` strings +
Android permissions). On first launch the app will prompt; if denied, the map falls back
to a Dhaka reference point rather than breaking.

## Project structure

```
app/                      Expo Router file-based routes (screens only — no business logic)
  _layout.tsx              Root layout: fonts, theme/i18n providers, splash screen
  index.tsx                 Entry redirect: onboarding → auth → tabs
  onboarding/
  (auth)/                  login, signup, OTP verify
  (tabs)/                  Home/Map, Community, Trips, Profile (bottom tabs)
  navigation/active.tsx    Full-screen turn-by-turn
  report-incident.tsx      Modal
  route-preview.tsx        Modal
  search.tsx               Modal
  vehicles/                List + add

src/
  theme/                   Design tokens, ThemeProvider, typography scale
  i18n/                    English + Bangla dictionaries, I18nProvider, t()
  types/                   Domain types (Vehicle, Incident, Trip, RouteOption, ...)
  services/                Service interfaces + the ONE registry screens import from
    types.ts                Interface contracts (AuthService, IncidentService, ...)
    mock/                    Current implementations (in-memory + simulated latency)
    index.ts                 `services` export — swap mock → real here, nowhere else
    config.ts                Centralized business constants (fuel prices, alert radii, ...)
  store/                   Zustand stores (auth, vehicles) for cross-screen state
  components/
    ui/                      Design system primitives (Button, Card, Chip, Input, ...)
    brand/                   Logo mark + wordmark (SVG)
    map/                     Incident/place markers, animated user location puck
    incident/                Category metadata, report/confirm cards, nav alert banner
    vehicle/, trip/, route/, community/   Domain-specific cards
  hooks/useLocation.ts     Battery-conscious location hook (spec section 38)
  utils/geo.ts             Haversine distance, relative time formatting
  mocks/dhaka.ts           Seed data grounded in real Dhaka geography, for dev/demo
```

## Design system

Brand: **Poth** (পথ, "path"). Full rationale in-code as comments in `src/theme/tokens.ts`;
summary:

- **Color**: deep jade green (brand/route/positive), indigo-ink night surface, marigold
  (caution), brick (danger only), steel (info, used sparingly) — pulled from Bangladeshi
  road life rather than default SaaS/map-app blue.
- **Type**: Sora (display/glanceable numbers) + Plus Jakarta Sans (UI) for English; Noto
  Sans Bengali at matching weights for Bangla — never a bolted-on afterthought.
- **Layout**: map-first, chrome recedes into translucent floating sheets/pills; radius and
  shadow are hierarchy-driven, not uniform; primary controls sit in the one-handed thumb
  zone (bottom-anchored).
- All screens consume the same `src/components/ui` primitives — no per-screen one-off
  styling.

## Connecting the backend

Every screen and store imports from `src/services` (`import { services } from '@/services'`)
— never a concrete mock module directly. To connect the real backend once it exists:

1. Implement each interface in `src/services/types.ts` under `src/services/real/*`, backed
   by `src/services/apiClient.ts` (already matches the spec's `/api/v1/...` REST contract).
2. In `src/services/index.ts`, flip `USE_MOCK_API` and swap the exported implementations.
3. Set `EXPO_PUBLIC_API_BASE_URL` in your environment.

No screen, store, or component needs to change.

## Known simplifications (by design, for this phase)

- **Routing/geocoding** are mocked (`src/services/mock/navigationService.ts`) — plausible
  distances/durations and a jittered polyline, since no routing provider is connected yet.
  Sits behind a `NavigationService` interface so a real provider (Google/Mapbox/OSRM) drops
  in without touching screens (spec section 44, provider abstraction).
- **Turn-by-turn progress** on the active navigation screen is simulated with a timer, not
  real GPS route-matching — it exists to demonstrate the alert/confirmation UX end-to-end.
- **OTP** always accepts any 4-digit code (mock auth).
- Fuel prices and other business constants live in `src/services/config.ts`, matching spec
  section 33 (centralized, not hard-coded) — swap for a real `/admin/config` fetch later.
