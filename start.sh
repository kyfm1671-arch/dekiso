#!/bin/bash
set -e
cd "$(dirname "$0")"

NODE_DIR=".tools/node/bin"
if [ ! -x "$NODE_DIR/node" ]; then
  echo "Node.js をセットアップ中..."
  mkdir -p .tools
  ARCH="$(uname -m)"
  if [ "$ARCH" = "arm64" ]; then
    NODE_PKG="node-v22.15.0-darwin-arm64"
  else
    NODE_PKG="node-v22.15.0-darwin-x64"
  fi
  curl -fsSL "https://nodejs.org/dist/v22.15.0/${NODE_PKG}.tar.gz" -o /tmp/node.tar.gz
  tar -xzf /tmp/node.tar.gz -C .tools
  mv ".tools/${NODE_PKG}" .tools/node
  rm /tmp/node.tar.gz
fi

export PATH="$(pwd)/.tools/node/bin:$PATH"

if [ ! -d node_modules ]; then
  npm install
fi

echo ""
echo "  http://localhost:5173 をブラウザで開いてください"
echo ""
npm run dev
