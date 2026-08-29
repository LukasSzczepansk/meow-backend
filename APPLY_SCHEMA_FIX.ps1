param(
  [Parameter(Mandatory=$true)]
  [string]$ProjectPath
)

$ErrorActionPreference = 'Stop'
$schema = Join-Path $ProjectPath 'src\db\schema.ts'
if (!(Test-Path $schema)) {
  throw "Nie znaleziono src\db\schema.ts w: $ProjectPath"
}

$content = Get-Content $schema -Raw

if ($content -match 'audioUrl:\s*text\("audio_url"\)') {
  Write-Host 'Schema juz zawiera pola audio - nic do zmiany.' -ForegroundColor Yellow
  exit 0
}

$old = @'
  isOurSong: boolean("is_our_song").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
'@

$new = @'
  isOurSong: boolean("is_our_song").notNull().default(false),
  audioUrl: text("audio_url"),
  audioStatus: text("audio_status").notNull().default("unavailable"),
  listenCount: integer("listen_count").notNull().default(0),
  lastPlayedAt: timestamp("last_played_at", { withTimezone: true }),
  preparationRequestedAt: timestamp("preparation_requested_at", { withTimezone: true }),
  audioUpdatedAt: timestamp("audio_updated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
'@

if (-not $content.Contains($old)) {
  throw "Nie znaleziono oczekiwanego fragmentu coupleTracks w schema.ts. Nie zmieniono pliku."
}

$backup = "$schema.before-audio-schema-fix.bak"
Copy-Item $schema $backup -Force
$content = $content.Replace($old, $new)
Set-Content -Path $schema -Value $content -Encoding UTF8

Write-Host 'OK: dopisano pola audio do coupleTracks w src/db/schema.ts' -ForegroundColor Green
Write-Host "Backup: $backup"
