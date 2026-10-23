# ==============================================================================
# DevSpeak AI - Backend Multi-Stage Dockerfile (Python 3.12)
# Security: Multi-stage, non-root user (UID 10001), minimal attack surface
# ==============================================================================

# Stage 1: Build Dependencies
FROM python:3.12-slim-bookworm AS builder

WORKDIR /build

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage 2: Production Minimal Runner
FROM python:3.12-slim-bookworm AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    PATH="/opt/venv/bin:$PATH"

# Create non-root system group and user
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/sh -m appuser

# Copy installed virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Copy application source code and configuration
COPY alembic.ini ./
COPY alembic/ ./alembic/
COPY src/ ./src/
COPY entrypoint.sh ./entrypoint.sh

# Ensure proper permissions and switch to non-root user
RUN chmod +x ./entrypoint.sh && \
    chown -R appuser:appgroup /app

USER appuser:appgroup

EXPOSE 8000

# Zero-dependency healthcheck via Python stdlib urllib
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request, os; urllib.request.urlopen('http://127.0.0.1:' + str(os.environ.get('PORT', 8000)) + '/readyz')" || exit 1

ENTRYPOINT ["./entrypoint.sh"]

