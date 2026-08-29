param(
  [Parameter(Mandatory=$true)][string]$Target
)
$ErrorActionPreference = 'Stop'
$targetPath = (Resolve-Path $Target).Path
$script = Join-Path $targetPath 'tools\install-room-assets.ps1'
if (-not (Test-Path $script)) { throw "Najpierw naloz patch. Brak: $script" }
& powershell -ExecutionPolicy Bypass -File $script -Target $targetPath
