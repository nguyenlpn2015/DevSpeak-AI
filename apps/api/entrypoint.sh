#!/usr/bin/env sh
set -e

# If a custom command is provided to docker run (e.g., id, sh, python), execute it directly
if [ "$#" -gt 0 ] && [ "$1" != "uvicorn" ]; then
  exec "$@"
fi

if [ "${AUTO_MIGRATE:-true}" = "true" ]; then
  echo "[DevSpeak API] Applying database migrations via Alembic..."
  python -m alembic upgrade head
else
  echo "[DevSpeak API] Skipping database migrations (AUTO_MIGRATE=false)..."
fi

echo "[DevSpeak API] Starting Uvicorn server on port ${PORT:-8000}..."
exec python -m uvicorn src.main:app --host 0.0.0.0 --port "${PORT:-8000}"
