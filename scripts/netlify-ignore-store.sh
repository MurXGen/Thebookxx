#!/usr/bin/env bash
# Netlify "ignore" command for the STORE site (thebookx.in).
# Exit 0 = skip this build, exit 1 = build.
# Skips production deploys (15 credits each) when a push only touches the
# Manage Orders admin, which now deploys separately to admin.thebookx.in on Vercel.

# No previous build to compare against (first build, cache cleared, manual
# re-deploy of the same commit) → always build.
if [ -z "$CACHED_COMMIT_REF" ] || [ "$CACHED_COMMIT_REF" = "$COMMIT_REF" ]; then
  exit 1
fi

git diff --quiet "$CACHED_COMMIT_REF" "$COMMIT_REF" -- . \
  ':(exclude)src/app/manage-orders' \
  ':(exclude)src/components/manage-orders' \
  ':(exclude)src/components/AdminLock.jsx' \
  ':(exclude)src/components/AdminLock.styles.css' \
  ':(exclude)scripts/netlify-ignore-store.sh' \
  ':(exclude)vercel.json'
status=$?

if [ "$status" -eq 0 ]; then
  echo "Only Manage Orders (admin) files changed since the last deploy: skipping the store build."
  exit 0
fi
# 1 = store files changed; anything else (e.g. 128 = ref missing) → build to be safe.
exit 1
