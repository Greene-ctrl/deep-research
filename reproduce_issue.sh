#!/bin/bash

# Test GET /api/sse/live without parameters but with correct auth
echo "Testing GET /api/sse/live with missing params..."
curl -v "http://localhost:3000/api/sse/live" \
  -H "Authorization: Bearer testpassword" \
  > response_get.txt 2>&1

cat response_get.txt
