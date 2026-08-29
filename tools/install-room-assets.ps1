param(
  [string]$Target = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$project = (Resolve-Path $Target).Path
$public = Join-Path $project 'public\assets\room-pack'
$furnitureDir = Join-Path $public 'furniture'
$texturesDir = Join-Path $public 'textures'
$catsDir = Join-Path $public 'cats'
$tmp = Join-Path ([System.IO.Path]::GetTempPath()) ('meow-room-assets-' + [guid]::NewGuid().ToString('N'))

New-Item -ItemType Directory -Force -Path $furnitureDir,$texturesDir,$catsDir,$tmp | Out-Null

function Download([string]$Url,[string]$OutFile) {
  Write-Host "Pobieram: $Url"
  Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing
}

try {
  $furnitureZip = Join-Path $tmp 'furniture.zip'
  Download 'https://opengameart.org/sites/default/files/furniture_-_crimelike_-_extradave.zip' $furnitureZip
  $furnitureExtracted = Join-Path $tmp 'furniture'
  Expand-Archive -Path $furnitureZip -DestinationPath $furnitureExtracted -Force
  $wantedFurniture = @('sofa_up_1.png','sofa_up_2.png','desk1.png','hifi.png','speaker.png','oven1.png','bed_wooden_s.png')
  foreach ($name in $wantedFurniture) {
    $source = Get-ChildItem $furnitureExtracted -Recurse -File -Filter $name | Select-Object -First 1
    if ($source) { Copy-Item $source.FullName (Join-Path $furnitureDir $name) -Force }
  }

  Download 'https://opengameart.org/sites/default/files/Wood%20Floor.png' (Join-Path $texturesDir 'wood-floor.png')

  $animalsZip = Join-Path $tmp 'animals.zip'
  Download 'https://kenney.nl/media/pages/assets/animal-pack-remastered/54a307a369-1774771709/kenney_animal-pack-remastered.zip' $animalsZip
  $animalsExtracted = Join-Path $tmp 'animals'
  Expand-Archive -Path $animalsZip -DestinationPath $animalsExtracted -Force

  $catFiles = Get-ChildItem $animalsExtracted -Recurse -File -Filter '*.png' |
    Where-Object { $_.Name -match '(?i)cat' } |
    Sort-Object FullName

  if ($catFiles.Count -eq 0) {
    Write-Warning 'Nie znalazlem plikow kota w paczce Kenney. Domek nadal zadziala z fallbackiem.'
  } else {
    $limit = [Math]::Min(8, $catFiles.Count)
    for ($i = 0; $i -lt $limit; $i++) {
      Copy-Item $catFiles[$i].FullName (Join-Path $catsDir ("cat-{0}.png" -f ($i + 1))) -Force
    }
  }

  @"
MEOW 3.8 room art

Furniture: Crimelike - Furniture by extradave, CC0
https://opengameart.org/content/crimelike-furniture

Floor: Wood Floor by DavidRStudios, CC0
https://opengameart.org/content/wood-floor

Cats: Kenney Animal Pack Remastered, CC0
https://kenney.nl/assets/animal-pack-remastered
"@ | Set-Content -Path (Join-Path $public 'ASSET_SOURCES.txt') -Encoding UTF8

  Write-Host ''
  Write-Host 'Gotowe. Assety pokoju sa w public/assets/room-pack.' -ForegroundColor Green
  Write-Host 'Uruchom ponownie npm run dev, jezeli serwer byl wlaczony.'
}
finally {
  Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
