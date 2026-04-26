#!/usr/bin/env node
import { chromium } from 'playwright';
import { execSync } from 'child_process';

const BASE_URL = 'https://e1562334.aiwebagency.pages.dev';

// Create a test lead first via API
async function createTestLead() {
  console.log('Creating test lead...');
  try {
    const r = await fetch(`${BASE_URL}/api/leads/admin-update`, {
      method: 'POST',
      headers: { 'X-Admin-Secret': 'velocity2024', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testchat@example.com', name: 'Test Chat User' })
    });
    if (!r.ok) throw new Error(`Failed: ${r.status}`);
    const data = await r.json();
    console.log('Created lead with token:', data.token.substring(0, 12) + '...');
    return data.token;
  } catch (e) {
    console.error('Could not create lead:', e.message);
    console.log('Using fallback token...');
    return null;
  }
}

async function testClientChat(token) {
  console.log('\n=== TESTING CLIENT CHAT ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console
  page.on('console', msg => console.log('[CLIENT CONSOLE]', msg.text()));
  
  // Go to dashboard
  const url = `${BASE_URL}/dashboard/${token}`;
  console.log('Opening:', url);
  await page.goto(url);
  await page.waitForTimeout(2000);
  
  // Open chat
  console.log('Clicking chat button...');
  await page.click('#chatFloatBtn');
  await page.waitForTimeout(500);
  
  // Type message
  const testMsg = 'Test message ' + Date.now();
  console.log('Typing message:', testMsg);
  await page.fill('#chatTextarea', testMsg);
  
  // Get initial message count
  const initialCount = await page.locator('.chat-bubble').count();
  console.log('Initial message count:', initialCount);
  
  // Send
  console.log('Sending message...');
  await page.click('#chatSendBtn');
  
  // Wait a moment
  await page.waitForTimeout(500);
  
  // Check if message appeared
  const newCount = await page.locator('.chat-bubble').count();
  console.log('Message count after send:', newCount);
  
  // Check if our message is visible
  const pageContent = await page.content();
  const hasMessage = pageContent.includes(testMsg);
  console.log('Message visible in DOM:', hasMessage);
  
  // Wait for server sync (1 second)
  console.log('Waiting for server sync...');
  await page.waitForTimeout(1500);
  
  // Check again
  const afterSync = await page.locator('.chat-bubble').count();
  console.log('Message count after sync:', afterSync);
  
  await browser.close();
  
  return {
    passed: hasMessage && newCount > initialCount,
    messageAppeared: hasMessage,
    initialCount,
    newCount,
    afterSync
  };
}

async function testAdminChat(token) {
  console.log('\n=== TESTING ADMIN CHAT ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('[ADMIN CONSOLE]', msg.text()));
  
  // Login
  console.log('Logging into admin...');
  await page.goto(`${BASE_URL}/admin/`);
  await page.fill('#secretInput', 'velocity2024');
  await page.click('#authBtn');
  await page.waitForTimeout(2000);
  
  // Wait for leads to load
  console.log('Waiting for leads...');
  await page.waitForSelector('.chat-btn', { timeout: 10000 });
  
  // Find and click Messages button for our test lead
  console.log('Looking for Messages button...');
  const chatBtns = await page.locator('.chat-btn').all();
  console.log('Found', chatBtns.length, 'chat buttons');
  
  if (chatBtns.length === 0) {
    console.error('No chat buttons found!');
    await browser.close();
    return { passed: false, error: 'No chat buttons' };
  }
  
  // Click first Messages button
  console.log('Clicking first Messages button...');
  await chatBtns[0].click();
  await page.waitForTimeout(500);
  
  // Check modal is open
  const modalVisible = await page.locator('#chatModalOverlay.open').isVisible().catch(() => false);
  console.log('Modal visible:', modalVisible);
  
  if (!modalVisible) {
    console.error('Modal did not open!');
    await browser.close();
    return { passed: false, error: 'Modal did not open' };
  }
  
  // Type message
  const testMsg = 'Admin reply ' + Date.now();
  console.log('Typing admin message:', testMsg);
  await page.fill('#chatModalTextarea', testMsg);
  
  // Get initial count
  const initialCount = await page.locator('.chat-bubble').count();
  console.log('Initial message count:', initialCount);
  
  // Send
  console.log('Sending admin message...');
  await page.click('#chatModalSend');
  
  // Wait
  await page.waitForTimeout(500);
  
  // Check
  const newCount = await page.locator('.chat-bubble').count();
  console.log('Message count after send:', newCount);
  
  const pageContent = await page.content();
  const hasMessage = pageContent.includes(testMsg);
  console.log('Admin message visible:', hasMessage);
  
  // Wait for sync
  await page.waitForTimeout(1500);
  const afterSync = await page.locator('.chat-bubble').count();
  console.log('After sync:', afterSync);
  
  await browser.close();
  
  return {
    passed: hasMessage && newCount > initialCount,
    modalOpened: modalVisible,
    messageAppeared: hasMessage,
    initialCount,
    newCount,
    afterSync
  };
}

async function main() {
  console.log('=== CHAT TEST SUITE ===\n');
  
  let token = await createTestLead();
  
  // Test client
  const clientResult = await testClientChat(token || 'test-token-123');
  
  // Test admin  
  const adminResult = await testAdminChat(token);
  
  console.log('\n=== RESULTS ===');
  console.log('Client chat:', clientResult.passed ? '✅ PASS' : '❌ FAIL');
  if (!clientResult.passed) console.log('  Details:', clientResult);
  
  console.log('Admin chat:', adminResult.passed ? '✅ PASS' : '❌ FAIL');
  if (!adminResult.passed) console.log('  Details:', adminResult);
  
  if (!clientResult.passed || !adminResult.passed) {
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
