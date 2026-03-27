#!/bin/sh
set -e

echo "Running database migrations..."
node ./node_modules/typeorm/cli.js -d dist/database/data-source.js migration:run

if [ "${RUN_SEEDS:-false}" = "true" ]; then
  echo "Running database seeds..."
  node dist/database/seeds/run-seeds.js
else
  echo "Skipping database seeds. Set RUN_SEEDS=true to enable."
fi

echo "Starting API..."
exec node dist/main
