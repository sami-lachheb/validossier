#!/bin/sh
set -e

if [ "$(id -u)" = '0' ]; then
    chown -R node:node /usr/src/app
    exec su-exec node "$@"
fi

exec "$@"
