# PROTECTED FILES — DO NOT MODIFY WITHOUT EXPLICIT PERMISSION

The following files are managed exclusively by Claude (claude.ai) under specific prompting.
They must NOT be modified, moved, deleted, or overwritten by Windsurf, Cascade, or any automated process:

## Absolutely Protected
- `website/_onboard.html` — client onboarding SPA (6-phase form)
- `website/_dashboard.html` — client project dashboard
- `website/admin/index.html` — admin panel
- `functions/` — ALL Cloudflare Pages Functions (entire directory)

## Why
These files are the core revenue-generating infrastructure of velocity.calyvent.com.
Unauthorized changes cause direct financial loss (clients cannot submit briefs, admins cannot respond).

## What You CAN Do
- Fix bugs explicitly described in the prompt
- Add features explicitly requested
- Never make changes to these files as a side effect of another task

## Sync Rule
After ANY change to `_onboard.html`, `_dashboard.html`, or `admin/index.html`, ALWAYS run:
  node website/scripts/sync-public.js
Then commit public/ and dist/ together in the same commit.
