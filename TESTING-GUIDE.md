# 🧪 Admin Panel Testing Guide

## Quick Test Checklist

### 1️⃣ Test Admin Login
**URL:** `https://velocity.calyvent.com/admin/`

**Steps:**
1. Open the URL in your browser
2. Enter your admin password (the one you set in Cloudflare secrets)
3. Click "Login" or press Enter

**Expected Result:**
- ✅ Should see dashboard with statistics
- ✅ Should see list of leads
- ✅ Should see filter buttons (Active, Pending, etc.)
- ✅ Should see "New Lead" button

**If it fails:**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Check browser console (F12) for errors
- Verify you're using the correct password from Cloudflare dashboard

---

### 2️⃣ Test Lead Creation

**Steps:**
1. Click the **"New Lead"** button (top right)
2. A modal should appear
3. Enter test data:
   - **Email:** `test@example.com`
   - **Name:** `Test Client`
4. Click **"Generate Link →"**

**Expected Result:**
- ✅ Button should show "Generating…" while processing
- ✅ Should display the onboarding link
- ✅ Should show "Copied" toast when you click copy
- ✅ Lead should appear in the list immediately
- ✅ No error messages

**Test Error Handling:**
1. Try creating a lead with an email that already exists
2. Should show a clear error message (not "internal error")
3. Error should be in red in the modal

**What to Check in Browser Console (F12):**
```javascript
// Should see NO red errors
// If you see errors, screenshot them and share
```

---

### 3️⃣ Test Chat UI (Admin Side)

**Steps:**
1. Click on any lead card to expand it
2. Scroll down to the **"Messages"** section
3. You should see:
   - A chat message area (might say "No messages yet" or "Loading…")
   - A text input field
   - A "Send" button

**Test Sending a Message:**
1. Type a test message: "Hello from admin!"
2. Click **"Send"**

**Expected Result:**
- ✅ Button should show "Sending…" while processing
- ✅ Message should appear in the chat area immediately
- ✅ Your message should be on the **right side** (styled differently)
- ✅ Input field should clear after sending
- ✅ Should see a timestamp on the message

**Test Error Handling:**
1. Turn off your internet briefly
2. Try to send a message
3. Should show a toast notification: "Network error"
4. Button should re-enable after error

**Chat UI Should Look Like:**
```
┌─────────────────────────────────────┐
│  Messages                           │
├─────────────────────────────────────┤
│                      Hello client!  │
│                       Admin · 2:30PM│
│                                     │
│ Hi admin!                           │
│ Client · 2:31PM                     │
├─────────────────────────────────────┤
│ [Type a message...]    [Send]       │
└─────────────────────────────────────┘
```

- Admin messages: Right-aligned, brass background
- Client messages: Left-aligned, lighter background
- Clear visual distinction
- Smooth scrollbar if many messages

---

### 4️⃣ Test Chat UI (Client Side)

**Get a Token:**
1. In admin panel, find any lead
2. Click **"Copy Dashboard"** button
3. The URL will be like: `https://velocity.calyvent.com/dashboard/[TOKEN]`

**Test:**
1. Open the dashboard URL
2. Scroll down to **"Messages"** section
3. Send a message from client side

**Expected Result:**
- ✅ Chat container should have a nice background and border
- ✅ Messages should be styled as chat bubbles
- ✅ Client messages on right, admin messages on left
- ✅ **Wait 10 seconds** - chat should auto-refresh!
- ✅ No need to reload the page to see new messages

**Test Auto-Refresh:**
1. Send a message from admin panel
2. Go to client dashboard
3. Wait up to 10 seconds
4. Message should appear automatically!

---

### 5️⃣ Visual Quality Checks

**Admin Panel Should Look:**
- ✅ Clean, minimal design
- ✅ All text readable
- ✅ Proper spacing between elements
- ✅ Cards expand/collapse smoothly
- ✅ Buttons have hover effects
- ✅ No overlapping elements
- ✅ Scrollbar styled (not default browser style)

**Chat Messages Should:**
- ✅ Have rounded corners (like iMessage/WhatsApp)
- ✅ Different colors for admin vs client
- ✅ Clear timestamps
- ✅ Proper word wrapping for long messages
- ✅ Smooth scrolling when new messages appear

---

## 🐛 Common Issues & Solutions

### Issue: "Leads not loading"
**Solution:**
1. Check browser console (F12) for errors
2. Verify API is responding:
   ```bash
   curl https://velocity.calyvent.com/api/leads/list
   ```
   Should return `{"error":"Unauthorized"}` (not 404)
3. Hard refresh the page

### Issue: "Create lead shows internal error"
**Solution:**
1. Check browser console for the actual error
2. Verify Supabase is connected
3. Check Cloudflare deployment is complete

### Issue: "Chat doesn't auto-refresh"
**Solution:**
1. Hard refresh client dashboard
2. Check browser console - should see no errors
3. Wait 10 seconds (polling interval)
4. Verify `startChatPolling()` is in the page source

### Issue: "Chat looks broken/messy"
**Solution:**
1. Hard refresh: `Cmd+Shift+R`
2. Clear browser cache
3. Check if CSS is loading (view page source, look for `<style>` tag)

---

## 📸 What to Screenshot If There Are Issues

1. **Browser Console** (F12 → Console tab) - Show any red errors
2. **Network Tab** (F12 → Network tab) - Show API responses
3. **The actual UI** - Show what looks broken
4. **Page source** - Right-click → View Page Source

---

## ✅ Success Criteria

You should be able to:
- [ ] Login to admin panel
- [ ] See all leads loaded
- [ ] Create a new lead without errors
- [ ] See the new lead appear in the list
- [ ] Expand a lead card
- [ ] Send a chat message from admin
- [ ] See the message appear in chat UI
- [ ] Open client dashboard
- [ ] Send message from client
- [ ] See messages auto-refresh (no page reload)
- [ ] Chat UI looks clean and professional

---

## 🎯 Quick Commands

**Test if API is working:**
```bash
curl -I https://velocity.calyvent.com/api/leads/list
# Should return HTTP 401 (Unauthorized) - this is correct!
```

**Test if admin page loads:**
```bash
curl -I https://velocity.calyvent.com/admin/
# Should return HTTP 200
```

**Check deployment status:**
```bash
./test-deployment.sh
```

---

**If everything passes:** Your admin panel is production-ready! 🚀
**If something fails:** Take screenshots and share the errors.
