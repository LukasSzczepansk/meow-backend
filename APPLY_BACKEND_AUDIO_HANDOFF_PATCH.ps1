param(
  [Parameter(Mandatory=$true)]
  [string]$ProjectPath
)

$ErrorActionPreference = "Stop"
$patchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$target = (Resolve-Path $ProjectPath).Path

$schemaPath = Join-Path $target "src\db\schema.ts"
$libraryPath = Join-Path $target "src\app\api\music\library\route.ts"
$packagePath = Join-Path $target "package.json"

foreach ($required in @($schemaPath, $libraryPath, $packagePath)) {
  if (-not (Test-Path $required)) {
    throw "Nie znaleziono wymaganego pliku: $required`nCzy wskazales folder meow-backend?"
  }
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = Join-Path $target ".meow-audio-handoff-backup-$stamp"
New-Item -ItemType Directory -Force -Path (Join-Path $backup "src\db") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $backup "src\app\api\music\library") | Out-Null
Copy-Item $schemaPath (Join-Path $backup "src\db\schema.ts")
Copy-Item $libraryPath (Join-Path $backup "src\app\api\music\library\route.ts")

Write-Host "[1/5] Backup: $backup" -ForegroundColor Cyan

# Patch Drizzle schema idempotently.
$schema = Get-Content $schemaPath -Raw
if ($schema -notmatch 'audioUrl:\s*text\("audio_url"\)') {
  $needle = '    sourcePermalink: text("source_permalink"),'
  if (-not $schema.Contains($needle)) {
    throw "Nie znalazlem pola sourcePermalink w coupleTracks. Repo moglo sie zmienic; przywroc backup i podeslij schema.ts."
  }
  $replacement = @'
    sourcePermalink: text("source_permalink"),
    audioUrl: text("audio_url"),
    audioStatus: text("audio_status").notNull().default("unavailable"),
    listenCount: integer("listen_count").notNull().default(0),
    lastPlayedAt: timestamp("last_played_at", { withTimezone: true }),
    preparationRequestedAt: timestamp("preparation_requested_at", { withTimezone: true }),
    audioUpdatedAt: timestamp("audio_updated_at", { withTimezone: true }),
'@
  $schema = $schema.Replace($needle, $replacement.TrimEnd("`r", "`n"))
  Set-Content -Path $schemaPath -Value $schema -Encoding UTF8
  Write-Host "[2/5] schema.ts: dodano pola audio/status/listen" -ForegroundColor Green
} else {
  Write-Host "[2/5] schema.ts: pola juz istnieja - pomijam" -ForegroundColor Yellow
}

# Extend library GET response so the mobile app can see audioUrl immediately.
$library = Get-Content $libraryPath -Raw
if ($library -notmatch 'audioUrl:\s*coupleTracks\.audioUrl') {
  $needle = '      sourcePermalink: coupleTracks.sourcePermalink,'
  if (-not $library.Contains($needle)) {
    throw "Nie znalazlem sourcePermalink w /api/music/library. Przywroc backup i podeslij route.ts."
  }
  $replacement = @'
      sourcePermalink: coupleTracks.sourcePermalink,
      audioUrl: coupleTracks.audioUrl,
      audioStatus: coupleTracks.audioStatus,
      listenCount: coupleTracks.listenCount,
      lastPlayedAt: coupleTracks.lastPlayedAt,
      preparationRequestedAt: coupleTracks.preparationRequestedAt,
      audioUpdatedAt: coupleTracks.audioUpdatedAt,
'@
  $library = $library.Replace($needle, $replacement.TrimEnd("`r", "`n"))
}

$oldStreamable = '      streamable: row.provider === "soundcloud" || row.provider === "audius" || row.provider === "jamendo" || row.provider === "youtube",'
$newStreamable = '      streamable: Boolean(row.audioUrl) || row.provider === "soundcloud" || row.provider === "audius" || row.provider === "jamendo" || row.provider === "youtube",'
if ($library.Contains($oldStreamable)) {
  $library = $library.Replace($oldStreamable, $newStreamable)
}
Set-Content -Path $libraryPath -Value $library -Encoding UTF8
Write-Host "[3/5] library API: dodano audioUrl/status/licznik" -ForegroundColor Green

# Copy new source files.
$sourceRoot = Join-Path $patchRoot "files"
Get-ChildItem $sourceRoot -Recurse -File | ForEach-Object {
  $relative = $_.FullName.Substring($sourceRoot.Length).TrimStart('\','/')
  $destination = Join-Path $target $relative
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
  Copy-Item $_.FullName $destination -Force
}
Copy-Item (Join-Path $patchRoot "MEOW52_AUDIO_HANDOFF_DB.sql") (Join-Path $target "MEOW52_AUDIO_HANDOFF_DB.sql") -Force
Write-Host "[4/5] Dodano /listen /prepare /status /audio + helper" -ForegroundColor Green

Write-Host "[5/5] Gotowe." -ForegroundColor Green
Write-Host ""
Write-Host "TERAZ wykonaj w meow-backend:" -ForegroundColor Cyan
Write-Host "  npm install"
Write-Host "  npm run typecheck"
Write-Host "  npm run build"
Write-Host ""
Write-Host "Nastepnie uruchom MEOW52_AUDIO_HANDOFF_DB.sql w Neon SQL Editor (albo npx drizzle-kit push)." -ForegroundColor Cyan
Write-Host "Dopiero potem: git add . && git commit && git push, aby Vercel wdrozyl backend." -ForegroundColor Cyan
