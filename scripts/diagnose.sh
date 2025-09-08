#!/usr/bin/env bash
set -e
echo "### Versions"
node -v || true
npm -v || true
firebase --version || true
gcloud --version || true
echo
if [ -d functions ]; then
  echo "### functions diagnostics"
  (cd functions && echo "# npm ls (top level)" && npm ls --depth=0 || true)
  (cd functions && echo "# tsc (no emit)" && npx tsc -p . || true)
fi
echo
echo "### repo tree (top)"
find . -maxdepth 2 -type f | sed 's|^\./||'
