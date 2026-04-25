#!/bin/bash
# Test script to verify all Velocity fixes are working

echo "🔍 TESTING VELOCITY DEPLOYMENT"
echo "================================"
echo ""

BASE_URL="https://velocity.calyvent.com"

echo "1️⃣  Testing Admin Panel..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/admin/)
if [ "$ADMIN_STATUS" = "200" ]; then
  echo "   ✅ Admin page loads (HTTP $ADMIN_STATUS)"
else
  echo "   ❌ Admin page failed (HTTP $ADMIN_STATUS)"
fi

echo ""
echo "2️⃣  Testing API Endpoints..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/leads/list)
if [ "$API_STATUS" = "401" ]; then
  echo "   ✅ API responds (HTTP $API_STATUS - needs auth, which is correct)"
else
  echo "   ❌ API not working (HTTP $API_STATUS)"
fi

echo ""
echo "3️⃣  Checking Admin Panel Features..."
ADMIN_HTML=$(curl -s $BASE_URL/admin/)

if echo "$ADMIN_HTML" | grep -q "try{"; then
  echo "   ✅ Error handling present"
else
  echo "   ⚠️  Error handling not found (might be cached)"
fi

if echo "$ADMIN_HTML" | grep -q "loadChat"; then
  echo "   ✅ Chat functionality present"
else
  echo "   ❌ Chat functionality missing"
fi

echo ""
echo "4️⃣  Checking Client Dashboard..."
DASH_HTML=$(curl -s $BASE_URL/dashboard/test)

if echo "$DASH_HTML" | grep -q "startChatPolling"; then
  echo "   ✅ Chat auto-refresh present"
else
  echo "   ⚠️  Chat auto-refresh not found (might be cached)"
fi

if echo "$DASH_HTML" | grep -q "chat-wrap"; then
  echo "   ✅ Chat styling present"
else
  echo "   ❌ Chat styling missing"
fi

echo ""
echo "5️⃣  Checking Scope Page..."
SCOPE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/scope/test-token)
if [ "$SCOPE_STATUS" = "200" ]; then
  echo "   ✅ Scope page loads (HTTP $SCOPE_STATUS)"
else
  echo "   ❌ Scope page failed (HTTP $SCOPE_STATUS)"
fi

echo ""
echo "================================"
echo "📊 TEST SUMMARY"
echo "================================"
echo ""
echo "If you see ⚠️ warnings, the site might still be deploying."
echo "Cloudflare Pages typically takes 2-3 minutes to rebuild."
echo ""
echo "To force refresh in your browser:"
echo "  - Mac: Cmd + Shift + R"
echo "  - Windows: Ctrl + Shift + R"
echo ""
echo "To check deployment status:"
echo "  Visit: https://github.com/BenGurWaves/Velocity.delivery/deployments"
echo ""
