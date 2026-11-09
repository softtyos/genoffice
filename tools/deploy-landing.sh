#!/usr/bin/env bash
set -e

DOKPLOY_API_KEY="${DOKPLOY_API_KEY:-pknAnPTLXTpnKABJrkgCNisTsJJYtikQCsfwlhIbofCuuVLajVRfHKWwhbapWbUz}"
APPLICATION_ID="A_6N1Zu_W6vxo3Cdak1Rk"
DOKPLOY_HOST="https://paas.softty.net"

echo "=================================================="
echo "🚀 Softty Office — Deploy Landing to Dokploy PaaS"
echo "Target: $DOKPLOY_HOST"
echo "Application ID: $APPLICATION_ID"
echo "Domain: https://office.softty.net"
echo "=================================================="

echo "📦 1. Triggering deployment via Dokploy API..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $DOKPLOY_API_KEY" \
  "$DOKPLOY_HOST/api/trpc/application.deploy" \
  -d "{\"json\":{\"applicationId\":\"$APPLICATION_ID\"}}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS")

if [ "$HTTP_CODE" -ne 200 ]; then
  echo "❌ Error triggering deploy! HTTP Code: $HTTP_CODE"
  echo "$BODY"
  exit 1
fi

echo "✅ Dokploy deploy triggered successfully!"
echo "🌐 Track progress at: $DOKPLOY_HOST/dashboard/project/KBRTX2HrP0whia5xYyen-/environment/FsNO95unbrk_lD3SDtvFl/application/$APPLICATION_ID"
