MEOW BACKEND - SCHEMA FIX V2

Naprawia błąd TypeScript, w którym Drizzle nie zna pól:
- audioUrl
- audioStatus
- listenCount
- lastPlayedAt
- preparationRequestedAt
- audioUpdatedAt

Uruchom z folderu, w którym znajduje się APPLY_SCHEMA_FIX_V2.ps1:

Set-ExecutionPolicy -Scope Process Bypass
.\APPLY_SCHEMA_FIX_V2.ps1 -ProjectPath "E:\meow-couple-companion-app-patched"

Potem:
cd E:\meow-couple-companion-app-patched
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run typecheck

Nie uruchamiaj ponownie migracji Neon, jeżeli MEOW52 została już wykonana.
