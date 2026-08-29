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
$BackupDir = Join-Path $Target (".meow-patch-backups\cloud-backend-" + $Stamp)
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$OldDrizzle = Join-Path $Target "drizzle.config.json"
if (Test-Path $OldDrizzle) {
    Copy-Item -Force $OldDrizzle (Join-Path $BackupDir "drizzle.config.json")
    Remove-Item -Force $OldDrizzle
}

$Copied = 0
Get-ChildItem -Path $FilesRoot -Recurse -File | ForEach-Object {
    $Relative = $_.FullName.Substring($FilesRoot.Length).TrimStart('\','/')
    $Destination = Join-Path $Target $Relative
    $DestinationDir = Split-Path -Parent $Destination

    if (Test-Path $Destination) {
        $BackupFile = Join-Path $BackupDir $Relative
        $BackupFileDir = Split-Path -Parent $BackupFile
        New-Item -ItemType Directory -Force -Path $BackupFileDir | Out-Null
        Copy-Item -Force $Destination $BackupFile
    }

    New-Item -ItemType Directory -Force -Path $DestinationDir | Out-Null
    Copy-Item -Force $_.FullName $Destination
    $Copied++
}

Write-Host ("MEOW Cloud Backend patch applied. Files copied: " + $Copied)
Write-Host ("Backup: " + $BackupDir)
