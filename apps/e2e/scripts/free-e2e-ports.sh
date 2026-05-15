#!/usr/bin/env bash
set -euo pipefail

for port in 3010 3011 3020 3021 3030 3031; do
  pids="$(lsof -ti "tcp:${port}" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "${pids}" ]]; then
    # shellcheck disable=SC2086
    kill -9 ${pids} 2>/dev/null || true
    echo "[e2e] Freed port ${port} (stopped stale listener)"
  fi
done
