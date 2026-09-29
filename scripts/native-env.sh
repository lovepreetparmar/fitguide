#!/bin/sh
# Prepend system tools so XAMPP's broken `head` does not break CocoaPods/Xcode builds.
if [ -f "${PWD}/scripts/native-env.sh" ]; then
  SCRIPT_DIR="${PWD}/scripts"
else
  SCRIPT_DIR="$(CDPATH= cd "$(dirname "$0")" && pwd)"
fi
export PATH="${SCRIPT_DIR}/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:${PATH}"
