param(
  [Parameter(Mandatory=$true)]
  [string]$ProjectPath
)

$ErrorActionPreference = "Stop"

$patchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path $ProjectPath)) {
  throw "Nie znaleziono projektu: $ProjectPath"
}

$required = @(
  "src\db\schema.ts",
  "src\lib\server\session.ts",
  "package.json"
)

foreach ($rel in $required) {
  $path = Join-Path $ProjectPath $rel
  if (-not (Test-Path $path)) {
    throw "To nie wygląda na właściwy backend. Brakuje: $rel"
  }
}

$schema = Get-Content (Join-Path $ProjectPath "src\db\schema.ts") -Raw
foreach ($field in @("audioUrl", "audioStatus", "audioUpdatedAt")) {
  if ($schema -notmatch [regex]::Escape($field)) {
    throw "schema.ts nie zawiera pola '$field'. Najpierw zastosuj poprzedni schema fix."
  }
}

$targets = @(
  "src\lib\server\r2.ts",
  "src\app\api\music\r2\health\route.ts",
  "src\app\api\music\r2\upload-url\route.ts",
  "src\app\api\music\r2\complete\route.ts",
  "R2_SETUP.md"
)

$backupRoot = Join-Path $ProjectPath (".patch-backup-r2-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null

foreach ($rel in $targets) {
  $source = Join-Path $patchRoot $rel
  $dest = Join-Path $ProjectPath $rel

  if (Test-Path $dest) {
    $backup = Join-Path $backupRoot $rel
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $backup) | Out-Null
    Copy-Item $dest $backup -Force
  }

  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dest) | Out-Null
  Copy-Item $source $dest -Force
}

Write-Host ""
Write-Host "OK: dodano backend Cloudflare R2." -ForegroundColor Green
Write-Host "Backup: $backupRoot"
Write-Host ""
Write-Host "Teraz wykonaj:" -ForegroundColor Cyan
Write-Host "  cd `"$ProjectPath`""
Write-Host "  npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner"
Write-Host "  Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue"
Write-Host "  npm run typecheck"
Write-Host "  npm run build"
