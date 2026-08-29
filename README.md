# MEOW 4.2 — Full Visual UI Rebuild

Patch jest przeznaczony na **MEOW 4.1 Product UI Rebuild**.

## Co robi

Tym razem zmiana dotyczy realnego języka wizualnego, a nie tylko układu informacji:

- ciepłe różano-piaskowe tło zamiast prawie białego canvasu,
- mocniejsza paleta w light mode i dopracowany dark mode,
- primary buttons z wypełnieniem, cieniem i pressed state,
- osobny styl CTA dla Miau,
- secondary/outline/ghost buttons,
- bottom navigation z pełnym aktywnym stanem,
- nowe icon wells, list rows i row arrows,
- większy, bardziej app-like Bottom Sheet,
- segmented controls,
- mocniejsze heroes i action surfaces,
- przebudowane Dziś, Razem, Gry, Profil i onboarding,
- wizualny polish Ustawień, Pytania Dnia, Wspomnień i Chwili dla siebie.

## Open source

Interakcje i język komponentów zostały **przepisane pod Meow** na podstawie wzorców z MIT-owych projektów:

- Couple Connect — https://github.com/and3rn3t/couple-connect
- Timeless Love Anniversary App — https://github.com/Navaneeth223/timeless-love-anniversary-app

Nie jest bundlowane żadne obce repo, branding ani assety. Szczegóły: `THIRD_PARTY_NOTICES.md` po nałożeniu patcha.

## Instalacja PowerShell

```powershell
cd E:\folder\meow42-product-ui-full-rebuild-patch
.\apply-patch.ps1 -Target "E:\meow-couple-companion-app-patched"
```

Potem:

```powershell
cd E:\meow-couple-companion-app-patched
npm install
npm run typecheck
npm run lint
npm run dev
```

Nie trzeba robić `git clone` ani pobierać assetów. Patch nie zmienia bazy danych, więc nie uruchamiaj `npx drizzle-kit push`.
