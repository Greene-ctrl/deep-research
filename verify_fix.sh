#!/bin/bash

echo "=== Test 1: GET /api/sse/live (Missing Params) ==="
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/sse/live" \
  -H "Authorization: Bearer testpassword"
echo ""

echo "=== Test 2: POST /api/sse (Missing Params) ==="
curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/sse" \
  -H "Authorization: Bearer testpassword" \
  -H "Content-Type: application/json" \
  -d '{}'
echo ""

# Note: We can't easily simulate a *successful* full run without valid API keys for external providers (Google, OpenAI, etc.),
# as that would trigger the actual DeepResearch logic which calls external APIs.
# However, we have verified that we are now blocking invalid requests before they crash the server.
