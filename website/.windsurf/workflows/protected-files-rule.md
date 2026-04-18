# VELOCITY PROTECTED FILES

No AI tool may modify these without EXPLICIT permission from Ben:

## NEVER TOUCH:
- website/_onboard.html
- website/_dashboard.html
- website/admin/index.html
- functions/ (entire directory)
- website/public/_onboard.html
- website/public/_dashboard.html
- website/dist/_onboard.html
- website/dist/_dashboard.html

## REQUIRE EXPLICIT CONFIRMATION:
- website/styles.css
- website/public/index.html
- website/dist/index.html
- website/public/terms.html
- website/public/privacy.html
- wrangler.toml
- functions/_lib/security.js
- functions/_lib/supabase.js

## SYNC RULE (MANDATORY):
After changing _onboard.html, _dashboard.html, or admin/index.html:
  node website/scripts/sync-public.js
Then commit public/ and dist/ in the same commit.

## WHY:
These files are live revenue infrastructure.
Unauthorized changes = clients cannot access briefs = money lost.