#!/usr/bin/env sh
set -euo pipefail
cd "$(dirname "$0")/.."

APP_ID="com.fitguide.app"
SIMULATOR_ID="${SIMULATOR_ID:-booted}"
if [ -z "${APP_PATH:-}" ]; then
  APP_PATH=""
  while IFS= read -r candidate; do
    APP_PATH="$candidate"
    break
  done <<EOF
$(find "$HOME/Library/Developer/Xcode/DerivedData" -path "*Debug-iphonesimulator/FitGuide.app" -not -path "*Index.noindex*" 2>/dev/null)
EOF
fi

if [ -z "$APP_PATH" ] || [ ! -d "$APP_PATH" ]; then
  echo "run-auth-e2e: FitGuide.app not found. Run npm run ios first." >&2
  exit 1
fi

export JAVA_HOME="${JAVA_HOME:-$(brew --prefix openjdk@17 2>/dev/null)/libexec/openjdk.jdk/Contents/Home}"
export PATH="$JAVA_HOME/bin:$PATH:${HOME}/.maestro/bin"

echo "run-auth-e2e: reinstalling $APP_PATH"
xcrun simctl uninstall "$SIMULATOR_ID" "$APP_ID" 2>/dev/null || true
xcrun simctl install "$SIMULATOR_ID" "$APP_PATH"
sleep 2

maestro test .maestro/auth-smoke.yaml
