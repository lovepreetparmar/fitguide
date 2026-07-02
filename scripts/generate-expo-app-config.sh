#!/bin/sh
# Generate EXConstants app.config for release builds.
# Needed when the project path contains spaces (expo-constants pod script skips generation).

set -eo pipefail

if [[ -f "$PODS_ROOT/../.xcode.env" ]]; then
  source "$PODS_ROOT/../.xcode.env"
fi
if [[ -f "$PODS_ROOT/../.xcode.env.local" ]]; then
  source "$PODS_ROOT/../.xcode.env.local"
fi

PROJECT_ROOT="${PROJECT_ROOT:-$PROJECT_DIR/..}"
EXPO_CONSTANTS_DIR="$PROJECT_ROOT/node_modules/expo-constants"
RESOURCE_DEST="$TARGET_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/EXConstants.bundle"

mkdir -p "$RESOURCE_DEST"

"$EXPO_CONSTANTS_DIR/scripts/with-node.sh" \
  "$EXPO_CONSTANTS_DIR/scripts/getAppConfig.js" \
  "$PROJECT_ROOT" \
  "$RESOURCE_DEST"
