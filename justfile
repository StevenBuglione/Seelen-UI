set shell := ["powershell.exe", "-NoProfile", "-Command"]

setup:
    npm install
    npx playwright install chromium

check:
    deno fmt --check
    deno lint
    npm run type-check
    npm run test
    npm run studio:build

# Browser-only default UI loop. This recipe must never invoke Cargo or Tauri.
studio:
    npm run studio

studio-test:
    npm run studio:test

# Intentional review gate; never called by check, CI, or another recipe.
studio-update-snapshots:
    npm run studio:update-snapshots

harness:
    npm run harness

harness-test:
    npm run harness:verify
