# MEOW 5.2 backend audio handoff

Patch rozszerza istniejący `couple_tracks` zamiast tworzyć drugi katalog muzyczny.
Dzięki temu aktualne playlisty, „nasza piosenka” i biblioteka nadal wskazują na ten sam rekord.

## Statusy audio

- `youtube_only` — rekord istnieje, ale nie ma własnego audio.
- `requested` — aplikacja poprosiła o przygotowanie; backend czeka na dozwolone źródło/pliki.
- `ready` — `audio_url` jest ustawione i klient może użyć natywnego playera.
- `unavailable` — domyślny status dla innych providerów bez własnego pliku.

## Celowo brak automatycznego downloadera YouTube

`/api/music/prepare` jest tylko sygnałem/kolejką. Nie pobiera ani nie konwertuje treści YouTube.
Pipeline storage może później obsługiwać uploady użytkownika lub inne źródła, które zezwalają
na bezpośrednie przechowywanie/streamowanie.
