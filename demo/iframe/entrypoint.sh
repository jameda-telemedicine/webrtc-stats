#!/bin/sh

INDEX_FILE="/usr/share/nginx/html/index.html"

if [ -n "${BACKEND_URL}" ]; then
  echo "Replacing backend URL…"
  sed -i 's|http://localhost:3000|'"${BACKEND_URL}"'|g' "${INDEX_FILE}"
fi

if [ -n "${JITSI_URL}" ]; then
  echo "Replacing Jitsi Meet URL…"
  sed -i 's|https://localhost:8443|'"${JITSI_URL}"'|g' "${INDEX_FILE}"
fi
