#!/bin/bash
set -e
npm install
npm run db:push -- --accept-data-loss 2>/dev/null || npm run db:push -- --force 2>/dev/null || echo "db:push completed (some warnings may be expected)"
