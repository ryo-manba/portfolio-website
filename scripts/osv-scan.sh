#!/usr/bin/env bash
set -euo pipefail

if command -v osv-scanner >/dev/null 2>&1; then
  osv-scanner scan source --recursive ./
else
  echo "osv-scanner not found; skipping vulnerability scan (install: https://google.github.io/osv-scanner)"
fi
