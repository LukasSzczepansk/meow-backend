# MEOW Cloud Backend 1.0

Cel: po jednorazowym wdrożeniu laptop nie jest potrzebny do działania aplikacji mobilnej.

## Architektura

React Native -> HTTPS -> Vercel / Next.js API -> Neon Postgres + YouTube Data API

## Co robi patch

- wszystkie istniejące endpointy korzystające z `getCurrentMember()` akceptują teraz:
  `Authorization: Bearer <opaque-session-token>`
- webowa aplikacja nadal używa bezpiecznego httpOnly cookie
- onboarding zwraca token tylko klientowi, który wysyła:
  `X-Meow-Client: native`
- baza jest przygotowana pod małą pulę połączeń w środowisku serverless
- `drizzle.config.ts` czyta `DATABASE_URL` z env
- sekrety YouTube i bazy pozostają wyłącznie na backendzie

## Wdrożenie

1. Załóż bazę PostgreSQL w Neon i skopiuj pooled connection string.
2. W projekcie backendu utwórz `.env.local` na czas migracji:

   DATABASE_URL=...
   YOUTUBE_API_KEY=...

3. Wykonaj:

   npx drizzle-kit push

4. Wdróż projekt Next.js do Vercel.
5. W Vercel -> Settings -> Environment Variables dodaj:
   - DATABASE_URL
   - YOUTUBE_API_KEY
   - PG_POOL_MAX=3
   - opcjonalne zmienne Audius/MusicBrainz

6. Po deployu dostaniesz adres w stylu:
   https://twoj-projekt.vercel.app

7. Ten adres wpisujesz w React Native:
   EXPO_PUBLIC_DEMO_MODE=false
   EXPO_PUBLIC_API_URL=https://twoj-projekt.vercel.app

Od tego momentu telefon rozmawia z chmurą, a nie z laptopem.

## Ważne

Nie wkładaj `DATABASE_URL` ani `YOUTUBE_API_KEY` do aplikacji React Native.
