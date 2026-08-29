MEOW BACKEND - AUDIO HANDOFF PATCH
=================================

Co dodaje:
- POST /api/music/listen
  * zapisuje utwor przy odsluchu
  * zwieksza listenCount
  * aktualizuje lastPlayedAt
  * zwraca audioUrl, jesli jest juz dostepne

- POST /api/music/prepare
  * zaznacza utwor jako "requested"
  * NIE pobiera i NIE wyciaga audio z YouTube
  * jest kolejka/znacznik dla przyszlego legalnego storage pipeline

- GET /api/music/status?provider=...&providerTrackId=...
  * tani endpoint pollingowy dla aplikacji
  * gdy audioUrl pojawi sie w bazie, aplikacja moze przelaczyc YouTube -> RNTP

- POST/DELETE /api/music/audio
  * opcjonalny endpoint administracyjny do przypiecia legalnego bezposredniego audioUrl
  * wymaga Vercel env MUSIC_AUDIO_ADMIN_SECRET i naglowka x-meow-music-admin
  * blokuje znane domeny YouTube/googlevideo

- couple_tracks:
  audio_url
  audio_status
  listen_count
  last_played_at
  preparation_requested_at
  audio_updated_at

INSTALACJA
==========

1. Rozpakuj patch.
2. PowerShell w folderze patcha:

   Set-ExecutionPolicy -Scope Process Bypass
   .\APPLY_BACKEND_AUDIO_HANDOFF_PATCH.ps1 -ProjectPath "E:\SCIEZKA\meow-backend"

3. W backendzie:

   cd E:\SCIEZKA\meow-backend
   npm install
   npm run typecheck
   npm run build

4. BAZA NEON - zrob PRZED wdrozeniem endpointow:
   Otworz Neon -> SQL Editor i uruchom caly plik:

   MEOW52_AUDIO_HANDOFF_DB.sql

   Alternatywnie, jesli lokalny .env ma poprawny DATABASE_URL:

   npx drizzle-kit push

5. GitHub/Vercel:

   git status
   git add .
   git commit -m "feat: add music audio handoff backend"
   git push

   Jesli Vercel jest polaczony z repo, deployment ruszy automatycznie.

6. W aplikacji mobilnej NIE trzeba robic nowego EAS Builda.
   Po wdrozeniu backendu wystarczy:

   npx expo start --dev-client --clear

OPCJONALNIE - PRZYPIECIE AUDIO Z CLOUD STORAGE
==============================================

Ustaw w Vercel Environment Variables:

MUSIC_AUDIO_ADMIN_SECRET=<dlugi losowy sekret>

Potem, gdy masz legalny plik np. w R2/S3/Vercel Blob i publiczny/signed HTTPS URL,
mozesz przypiac go do utworu:

PowerShell (przyklad):

$headers = @{ "x-meow-music-admin" = "TWOJ_SEKRET" }
$body = @{
  provider = "youtube"
  providerTrackId = "VIDEO_ID"
  audioUrl = "https://twoj-storage.example/music/track.m4a"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "https://meow-backend.vercel.app/api/music/audio" `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $body

Po tym /api/music/status zwroci audioUrl, a patch mobilny wykryje je przy pollingu.

WAZNE
=====
Ten patch nie implementuje ripowania/pobierania audio z YouTube. YouTube pozostaje
fallbackiem widocznym w aplikacji. audioUrl sluzy do plikow/streamow, ktore masz
prawo przechowywac i odtwarzac bezposrednio.
