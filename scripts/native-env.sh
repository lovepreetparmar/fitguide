#!/bin/sh
# Prepend system tools so XAMPP's broken `head` does not break CocoaPods/Xcode builds.
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:${PATH}"
