#!/usr/bin/env bash
# ==============================================================================
# DevSpeak AI — 5-Environment Read-Only Smoke & Health Verification (POSIX/Bash)
# ==============================================================================
# Executes non-destructive health checks across configured environments.
# Returns exit code 0 if all probed targets return HTTP 200, 1 otherwise.
# ==============================================================================
set -euo pipefail

TARGET_ENV="${1:-all}"
TIMEOUT=10

echo "================================================================================"
echo "DEVSPEAK AI — 5-ENVIRONMENT HEALTH & READINESS PROBE RUNNER (BASH)"
echo "Timestamp (UTC): $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "================================================================================"

declare -A TARGETS=(
    ["compose-web"]="http://localhost:3001"
    ["compose-readyz"]="http://localhost:8000/readyz"
    ["compose-catalog"]="http://localhost:8000/api/v1/questions"
    ["staging-web"]="https://devspeak-web-staging-ygz4gsol4q-as.a.run.app"
    ["staging-readyz"]="https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/readyz"
    ["staging-catalog"]="https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/api/v1/questions"
    ["prod-web"]="https://devspeak-web-prod-ygz4gsol4q-as.a.run.app"
    ["prod-readyz"]="https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz"
    ["prod-catalog"]="https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/api/v1/questions"
    ["kind-web"]="http://localhost/"
    ["kind-readyz"]="http://localhost/readyz"
    ["kind-catalog"]="http://localhost/api/v1/questions"
    ["gke-web"]="https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/"
    ["gke-readyz"]="https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/readyz"
    ["gke-catalog"]="https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/api/v1/questions"
)

PASSED=0
FAILED=0

for KEY in "${!TARGETS[@]}"; do
    URL="${TARGETS[$KEY]}"
    
    # Filter if target env specified
    if [[ "$TARGET_ENV" != "all" && "$KEY" != "$TARGET_ENV"* ]]; then
        continue
    fi

    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" -H "User-Agent: DevSpeak-SmokeRunner/1.0" "$URL" || echo "000")
    if [[ "$HTTP_STATUS" == "200" ]]; then
        echo -e "\033[0;32m[PASS 200]\033[0m $KEY -> $URL"
        ((PASSED++))
    else
        echo -e "\033[0;31m[FAIL $HTTP_STATUS]\033[0m $KEY -> $URL"
        ((FAILED++))
    fi
done

echo "--------------------------------------------------------------------------------"
echo "Summary: Passed=$PASSED | Failed=$FAILED"

if [[ "$FAILED" -gt 0 ]]; then
    exit 1
else
    exit 0
fi
