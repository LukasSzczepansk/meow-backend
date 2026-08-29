# MEOW 4.2 — Full Visual UI Rebuild

This patch is intentionally visual. It changes the shared component language rather than only rearranging information.

## Main differences
- warm rose/sand app canvas instead of a mostly white canvas,
- stronger light and dark palettes,
- filled primary buttons with tactile pressed states and depth,
- a dedicated `meow` CTA style,
- filled active bottom-navigation tabs,
- richer surfaces, icon wells and row arrows,
- a larger, more app-like bottom sheet,
- segmented controls,
- redesigned Today, Together, Games, Profile and Onboarding entry experiences,
- stronger visual states for settings, daily question, memories and calm hub,
- all existing Meow business logic remains intact.

## Open-source references
The component/interaction language was adapted from MIT-licensed Couple Connect and Timeless Love patterns. See `THIRD_PARTY_NOTICES.md`.

## Database
No database/schema changes. Do not run `drizzle-kit push` for this patch.

## Install
After applying the patch, run:

```powershell
npm install
npm run typecheck
npm run lint
npm run dev
```

No GitHub clone or additional asset download is required.
