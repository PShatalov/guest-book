#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

copy_env() {
  local source_file="$1"
  local target_file="$2"

  if [[ -e "${target_file}" ]]; then
    echo "skip ${target_file#"$repo_root"/} (already exists)"
    return
  fi

  cp "${source_file}" "${target_file}"
  echo "created ${target_file#"$repo_root"/}"
}

copy_env "${repo_root}/compose.env.example" "${repo_root}/.env"
copy_env "${repo_root}/apps/api/.env.example" "${repo_root}/apps/api/.env"
copy_env "${repo_root}/apps/web/.env.example" "${repo_root}/apps/web/.env.local"
copy_env "${repo_root}/apps/e2e/.env.example" "${repo_root}/apps/e2e/.env"
