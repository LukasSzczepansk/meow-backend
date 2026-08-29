#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-}"
if [ -z "$TARGET" ]; then echo "Usage: ./apply-patch.sh /path/to/meow"; exit 1; fi
SOURCE="$(cd "$(dirname "$0")/files" && pwd)"
TARGET="$(cd "$TARGET" && pwd)"
if [ ! -f "$TARGET/package.json" ]; then echo "package.json not found in $TARGET"; exit 1; fi
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP="$TARGET/.meow-patch-backups/meow41-$STAMP"
mkdir -p "$BACKUP"
while IFS= read -r -d '' f; do
  rel="${f#$SOURCE/}"
  dest="$TARGET/$rel"
  mkdir -p "$(dirname "$dest")"
  if [ -f "$dest" ]; then mkdir -p "$BACKUP/$(dirname "$rel")"; cp "$dest" "$BACKUP/$rel"; fi
  cp "$f" "$dest"
done < <(find "$SOURCE" -type f -print0)
echo "MEOW 4.1 applied. Backup: $BACKUP"
