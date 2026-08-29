MEOW 3.8 room assets

Run from project root in PowerShell:
  powershell -ExecutionPolicy Bypass -File .\tools\install-room-assets.ps1 -Target .

The script downloads only CC0 assets from Kenney and OpenGameArt.
The room renderer has a built-in fallback, so the app still starts before assets are installed.
