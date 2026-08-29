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

$startMarker = 'export const coupleTracks = pgTable('
$nextMarker = 'export const musicPlaylists = pgTable('
$start = $content.IndexOf($startMarker)
if ($start -lt 0) {
  throw 'Nie znaleziono bloku: export const coupleTracks = pgTable('
}
$next = $content.IndexOf($nextMarker, $start)
if ($next -lt 0) {
  throw 'Nie znaleziono końca bloku coupleTracks (musicPlaylists).'
}

$block = $content.Substring($start, $next - $start)

if ($block -match 'audioUrl\s*:\s*text\("audio_url"\)') {
  Write-Host 'OK: coupleTracks juz zawiera pola audio. Nic nie zmieniono.' -ForegroundColor Yellow
  exit 0
}

# Znajdź createdAt WYŁĄCZNIE wewnątrz coupleTracks i użyj jego wcięcia.
$createdPattern = '(?m)^(?<indent>[ \t]*)createdAt\s*:\s*timestamp\("created_at"\s*,\s*\{\s*withTimezone\s*:\s*true\s*\}\)\.notNull\(\)\.defaultNow\(\),[ \t]*$'
$m = [regex]::Match($block, $createdPattern)
if (-not $m.Success) {
  throw 'Nie znaleziono linii createdAt wewnątrz coupleTracks. Nie zmieniono pliku.'
}

$indent = $m.Groups['indent'].Value
$nl = if ($content.Contains("`r`n")) { "`r`n" } else { "`n" }

$insert = @(
  ($indent + 'audioUrl: text("audio_url"),'),
  ($indent + 'audioStatus: text("audio_status").notNull().default("unavailable"),'),
  ($indent + 'listenCount: integer("listen_count").notNull().default(0),'),
  ($indent + 'lastPlayedAt: timestamp("last_played_at", { withTimezone: true }),'),
  ($indent + 'preparationRequestedAt: timestamp("preparation_requested_at", { withTimezone: true }),'),
  ($indent + 'audioUpdatedAt: timestamp("audio_updated_at", { withTimezone: true }),')
) -join $nl
$insert += $nl

$newBlock = $block.Insert($m.Index, $insert)
$newContent = $content.Substring(0, $start) + $newBlock + $content.Substring($next)

$backup = "$schema.before-audio-schema-fix-v2.bak"
Copy-Item $schema $backup -Force

# UTF-8 bez BOM, bez zmiany reszty pliku.
[System.IO.File]::WriteAllText($schema, $newContent, [System.Text.UTF8Encoding]::new($false))

Write-Host 'OK: dopisano pola audio do coupleTracks.' -ForegroundColor Green
Write-Host "Backup: $backup"
Write-Host ''
Write-Host 'Teraz uruchom:' -ForegroundColor Cyan
Write-Host '  Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue'
Write-Host '  npm run typecheck'
