#!/usr/bin/env sh
# Fix stale Xcode ModuleCache / DerivedData (SwiftGeneratePch, module.modulemap not found).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ -t 0 ] && [ -z "${FITGUIDE_SKIP_ARCHIVE_PROMPT:-}" ]; then
  echo "Quit Xcode first, then press Enter to continue..."
  read -r _
fi
echo "Removing FitGuide DerivedData and ModuleCache..."
rm -rf "$HOME/Library/Developer/Xcode/DerivedData/FitGuide-"*
rm -rf "$ROOT/ios/build"
rm -rf "$ROOT/ios/Pods"
rm -rf "$ROOT/ios/Podfile.lock"
echo "Reinstalling pods (EXPO_USE_PRECOMPILED_MODULES=false)..."
(cd "$ROOT" && sh -c '. ./scripts/native-env.sh && cd ios && pod install')
echo "Done. Open ios/FitGuide.xcworkspace → Product → Clean Build Folder → Build/Archive."
echo "Tip: choose 'Any iOS Device (arm64)' for Archive, not only a plugged-in iPhone."
