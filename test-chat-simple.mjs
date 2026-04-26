#!/usr/bin/env node
import { chromium } from 'playwright';

const BASE_URL = 'https://e1562334.aiwebagency.pages.dev';
const ADMIN_SECRET = 'velocity2024';

async function createRealLead() {
  console.log('Creating real lead via API...');
  const r = await fetch(`${BASE_URL}/api/leads/create`, {
    method: 'POST',
    headers: { 
      'X-Admin-Secret': ADMIN_SECRET, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ 
      client_email: 'test' + Date.now() + '@test.com',
      client_name: 'Test User' 
    })
  });
  
  if (!r.ok) {
    console.error('Failed to create lead:', r.status, await r.text());
    return null;
  }
  
  const data = await r.json();
  console.log('✅ Created lead, token:', data.token.substring(0, 16) + '...');
  return data.token;
}

async function testClientChat(token) {
  console.log('\n=== CLIENT CHAT TEST ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Chat]')) console.log('  📱', text);
  });
  
  // Load dashboard
  const url = `${BASE_URL}/dashboard/${token}`;
  console.log('  Loading:', url);
  await page.goto(url);
  await page.waitForTimeout(3000);
  
  // Check chat button exists and is visible
  const btn = await page.locator('#chatFloatBtn');
  const visible = await btn.isVisible().catch(() => false);
  console.log('  Chat button visible:', visible);
  
  if (!visible) {
    const html = await page.content();
    console.log('  Page contains chat-float-btn:', html.includes('chat-float-btn'));
    await browser.close();
    return { passed: false, error: 'Chat button not visible' };
  }
  
  // Click to open
  console.log('  Clicking chat button...');
  await btn.click();
  await page.waitForTimeout(500);
  
  // Check drawer opened
  const drawer = await page.locator('#chatDrawer.open');
  const drawerOpen = await drawer.isVisible().catch(() => false);
  console.log('  Drawer opened:', drawerOpen);
  
  if (!drawerOpen) {
    await browser.close();
    return { passed: false, error: 'Drawer did not open' };
  }
  
  // Type and send message
  const testMsg = 'Hello from test ' + Date.now();
  console.log('  Typing:', testMsg.substring(0, 30) + '...');
  await page.fill('#chatTextarea', testMsg);
  
  // Count messages before
  const before = await page.locator('.chat-bubble').count();
  console.log('  Messages before:', before);
  
  // Send
  console.log('  Sending...');
  await page.click('#chatSendBtn');
  
  // Wait for optimistic render
  await page.waitForTimeout(300);
  
  // Check if message appeared
  const after = await page.locator('.chat-bubble').count();
  console.log('  Messages after send:', after);
  
  const pageText = await page.textContent('#chatMessagesArea');
  const msgVisible = pageText.includes(testMsg);
  console.log('  Message visible immediately:', msgVisible);
  
  // Wait for server sync
  console.log('  Waiting 1s for server sync...');
  await page.waitForTimeout(1000);
  
  // Check again
  const afterSync = await page.locator('.chat-bubble').count();
  const pageText2 = await page.textContent('#chatMessagesArea');
  const msgStillVisible = pageText2.includes(testMsg);
  console.log('  Messages after sync:', afterSync);
  console.log('  Message still visible:', msgStillVisible);
  
  await browser.close();
  
  return {
    passed: msgVisible && msgStillVisible,
    appearedImmediately: msgVisible,
    survivedSync: msgStillVisible,
    before,
    after,
    afterSync
  };
}

async function testAdminChat(token) {
  console.log('\n=== ADMIN CHAT TEST ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[AdminChat]')) console.log('  💼', text);
  });
  
  // Login
  console.log('  Logging in...');
  await page.goto(`${BASE_URL}/admin/`);
  await page.fill('#secretInput', ADMIN_SECRET);
  await page.click('#authBtn');
  await page.waitForTimeout(2000);
  
  // Find chat button for our lead
  const btns = await page.locator('.chat-btn').all();
  console.log('  Found', btns.length, 'chat buttons');
  
  if (btns.length === 0) {
    await browser.close();
    return { passed: false, error: 'No chat buttons found' };
  }
  
  // Click first one
  console.log('  Clicking Messages button...');
  await btns[0].click();
  await page.waitForTimeout(500);
  
  // Check modal
  const modal = await page.locator('#chatModalOverlay.open');
  const modalOpen = await modal.isVisible().catch(() => false);
  console.log('  Modal opened:', modalOpen);
  
  if (!modalOpen) {
    await browser.close();
    return { passed: false, error: 'Modal did not open' };
  }
  
  // Type message
  const testMsg = 'Admin test ' + Date.now();
  await page.fill('#chatModalTextarea', testMsg);
  
  const before = await page.locator('.chat-bubble').count();
  console.log('  Messages before:', before);
  
  // Send
  console.log('  Sending...');
  await page.click('#chatModalSend');
  await page.waitForTimeout(300);
  
  const after = await page.locator('.chat-bubble').count();
  const pageText = await page.textContent('#chatModalBody');
  const msgVisible = pageText.includes(testMsg);
  console.log('  Messages after:', after);
  console.log('  Message visible:', msgVisible);
  
  // Wait for sync
  await page.waitForTimeout(1000);
  const afterSync = await page.locator('.chat-bubble').count();
  const pageText2 = await page.textContent('#chatModalBody');
  const msgStillVisible = pageText2.includes(testMsg);
  console.log('  After sync:', afterSync, 'still visible:', msgStillVisible);
  
  await browser.close();
  
  return {
    passed: msgVisible && msgStillVisible,
    appearedImmediately: msgVisible,
    survivedSync: msgStillVisible
  };
}

async function main() {
  console.log('=== CHAT TEST SUITE ===\n');
  
  const token = await createRealLead();
  if (!token) {
    console.error('❌ Cannot test without real lead');
    process.exit(1);
  }
  
  const client = await testClientChat(token);
  const admin = await testAdminChat(token);
  
  console.log('\n=== RESULTS ===');
  console.log('Client:', client.passed ? '✅ PASS' : '❌ FAIL');
  if (!client.passed) console.log('  Error:', client.error || client);
  
  console.log('Admin:', admin.passed ? '✅ PASS' : '❌ FAIL');
  if (!admin.passed) console.log('  Error:', admin.error || admin);
  
  process.exit(client.passed && admin.passed ? 0 : 1);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
