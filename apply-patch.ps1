param(
    [Parameter(Mandatory=$true)]
    [string]$Target
)

$ErrorActionPreference = "Stop"
$PatchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$FilesRoot = Join-Path $PatchRoot "files"

if (-not (Test-Path (Join-Path $Target "package.json"))) {
    throw "package.json not found in target: $Target"
}

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupDir = Join-Path $Target (".meow-patch-backups\cloud-event-types-" + $Stamp)
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$Relative = "src\lib\server\events.ts"
$Source = Join-Path $FilesRoot $Relative
$Destination = Join-Path $Target $Relative
$Backup = Join-Path $BackupDir $Relative
$BackupParent = Split-Path -Parent $Backup

New-Item -ItemType Directory -Force -Path $BackupParent | Out-Null
if (Test-Path $Destination) {
    Copy-Item -Force $Destination $Backup
}
Copy-Item -Force $Source $Destination

Write-Host "MEOW Cloud Backend 1.0.1 event types hotfix applied."
Write-Host ("Backup: " + $BackupDir)
