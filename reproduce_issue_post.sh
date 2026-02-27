#!/bin/bash

# Test POST /api/sse without body parameters but with correct auth
echo "Testing POST /api/sse with missing params..."
curl -v -X POST "http://localhost:3000/api/sse" \
  -H "Authorization: Bearer testpassword" \
  -H "Content-Type: application/json" \
  -d '{}' \
  > response_post.txt 2>&1

cat response_post.txt
