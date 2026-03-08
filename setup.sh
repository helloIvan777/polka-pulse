#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[Polka Pulse] Installing frontend dependencies..."
cd "$ROOT_DIR/frontend"
npm install

echo "[Polka Pulse] Installing contracts dependencies (OpenZeppelin)..."
cd "$ROOT_DIR/contracts"

if ! command -v forge >/dev/null 2>&1; then
  echo "Foundry (forge) not detected. Please install it from https://book.getfoundry.sh/ before building contracts."
else
  forge install openzeppelin/openzeppelin-contracts@v5.0.0 --no-commit
fi

echo "[Polka Pulse] Setup complete."

