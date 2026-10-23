#!/usr/bin/env sh
set -e

echo "[DevSpeak API] Applying database migrations via Alembic..."
python -m alembic upgrade head

echo "[DevSpeak API] Starting Uvicorn server on port ${PORT:-8000}..."
exec python -m uvicorn src.main:app --host 0.0.0.0 --port "${PORT:-8000}"

