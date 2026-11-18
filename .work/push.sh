#!/usr/bin/env bash
# Push the zh-cn translation branch to the user's fork.
# Requires GitHub credentials to be available to git (credential manager / PAT).
set -e
WS="C:/Users/hinkerliu/WorkBuddy/2026-11-17-22-44-38/esp32-field-lab-zh"
cd "$WS"
echo "Current branch: $(git branch --show-current)"
echo "Remote(s):"
git remote -v || true
echo
echo "Attempting push..."
if git push -u origin zh-cn:zh-cn 2>&1; then
  echo "PUSH_OK"
else
  echo "PUSH_FAILED"
  exit 1
fi
