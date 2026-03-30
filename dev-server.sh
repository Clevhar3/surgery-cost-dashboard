#!/bin/bash
export PATH="/c/Program Files/nodejs:$PATH"
cd "$(dirname "$0")"
exec node node_modules/vite/bin/vite.js --host
