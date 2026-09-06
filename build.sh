#!/bin/sh
ROOT="$(cd "$(dirname "$0")" && pwd)"
NODE="${NODE:-/Applications/Cursor.app/Contents/Resources/app/resources/helpers/node}"
exec "$NODE" "$ROOT/scripts/build.mjs"
