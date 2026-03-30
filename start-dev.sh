#!/bin/bash
export PATH="/c/Program Files/nodejs:$PATH"
cd "$(dirname "$0")"
exec npx vite --host
