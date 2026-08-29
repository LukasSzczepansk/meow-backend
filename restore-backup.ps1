param(
  [Parameter(Mandatory=$true)] [string]$Target,
  [Parameter(Mandatory=$true)] [string]$BackupFolder
)
$ErrorActionPreference = "Stop"
$Target = (Resolve-Path $Target).Path
$BackupFolder = (Resolve-Path $BackupFolder).Path
$files = Get-ChildItem -Path $BackupFolder -Recurse -File
foreach ($file in $files) {
  $relative = $file.FullName.Substring($BackupFolder.Length).TrimStart('\\','/')
  $destination = Join-Path $Target $relative
  New-Item -ItemType Directory -Path (Split-Path $destination -Parent) -Force | Out-Null
  Copy-Item $file.FullName $destination -Force
}
Write-Host "Przywrócono backup plików." -ForegroundColor Green
