#!/usr/bin/env sh
set -eu

NODE_BIN="${NODE_BIN:-/Users/liuyujie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node}"
if [ ! -x "$NODE_BIN" ]; then
  NODE_BIN="node"
fi

uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

cd frontend
"$NODE_BIN" node_modules/next/dist/bin/next dev -H 127.0.0.1 -p 3000
