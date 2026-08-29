# MEOW — Cloudflare R2

## Wymagane zmienne Vercel

Ustaw w Vercel → Project → Settings → Environment Variables:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME=meow-music`
- `R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
- `R2_PUBLIC_BASE_URL=https://<twoj-publiczny-adres>.r2.dev`

Po zmianie zmiennych zrób Redeploy.

## Endpointy

### GET /api/music/r2/health
Sprawdza, czy backend potrafi połączyć się z bucketem.

### POST /api/music/r2/upload-url

Body:

```json
{
  "trackId": "UUID_REKORDU_Z_COUPLE_TRACKS",
  "contentType": "audio/mpeg",
  "sizeBytes": 1234567
}
```

Zwraca czasowy `uploadUrl`. Plik wysyłasz bezpośrednio do Cloudflare:

```js
await fetch(uploadUrl, {
  method: "PUT",
  headers: { "Content-Type": contentType },
  body: fileBytes
});
```

### POST /api/music/r2/complete

Po udanym PUT:

```json
{
  "trackId": "UUID_REKORDU_Z_COUPLE_TRACKS",
  "objectKey": "music/..."
}
```

Backend wykonuje HEAD obiektu w R2, a następnie ustawia w Neon:

- `audio_url`
- `audio_status = ready`
- `audio_updated_at`

## Ważne

Ten patch nie pobiera i nie kopiuje audio z YouTube. Endpoint uploadu jest przeznaczony dla
plików, które masz prawo przechowywać i streamować.
