# CHANGELOG.md — The Pixie Packed Family

> Reconstructed from the real git history of `sanorg24/Disney-Travel-Site` (145 commits,
> 2026-07-26 through 2026-08-07) plus this project's conversation history. Grouped by theme and
> approximate date rather than listing all 145 commits individually. Anything not directly
> confirmed by a commit or file inspection is marked **[from conversation]**; anything genuinely
> uncertain is marked **[uncertain]**.

## 2026-07-26 — Project start

- Repository created, first `index.html` committed.

## 2026-07-29 — Foundation

- Custom domain configured (`CNAME` added, `www.pixiepackedfamily.com`).
- SEO metadata and initial layout styling added.
- Google Analytics tracking integrated (`G-YLXOLMRWKY`) — the same ID is still in use today.
- First outfit inspiration content added (MNSSHP-themed), later refactored into what became the
  dedicated `outfits.html` page.

## 2026-07-30 — Core category pages established

- `outfits.html`, `apparel.html`, and `accessories.html` created.
- `park-day-packing-checklist.html` created under what would become the `/guides/` structure —
  this is the site's free downloadable guide, and remains free and live today.
- Header/banner section redesigned.

## 2026-07-31 — Rapid category buildout

Heavy day of content additions, largely via GitHub's "Add files via upload" workflow (bulk
photo + content additions) alongside direct HTML edits:

- `holidays.html` created (seasonal Disney apparel).
- `sun-travel-essentials.html` created, later expanded into a full Sun/Travel/Personal Care
  category with hair care, sunscreen, cooling, and personal care content.
- Accessories expanded significantly: Loungefly bags, Pandora charms, and a Footwear section
  were all added this day.
- Apparel expanded: men's, women's, and family tees sections filled in with real products.
- Footer navigation updated to link all the new category pages together.

## 2026-08-01 — Category pages split into hub + subpages; blog and guides launched

This appears to be the day the site moved from "one long page per category" to the current
**hub page + focused subpages** pattern still in use today:

- Accessories split into `accessories.html` (hub) plus `accessories-hats.html`,
  `-ears-headbands.html`, `-backpacks.html`, `-loungefly.html`, `-pandora.html`,
  `-footwear.html`.
- Apparel split into `apparel.html` (hub) plus `-family-tees.html` **(note: committed as
  `.html` here, but the file in the repo today is `apparel-family-tees.htm` — see Known Issues
  in PROJECT-CONTEXT.md; the exact point this changed is unclear from history — [uncertain])**,
  `-kids.html`, `-mens.html`, `-womens.html`.
- Sun/Travel split into hub + `-sunscreen.html`, `-hair-care.html`, `-cooling-fans.html`,
  `-personal-care.html`.
- Holidays split into hub + `holidays-family-halloween.html`.
- `blog.html` created, along with the first post (`blog-welcome-to-the-blog.html`) and the
  mobile hamburger menu implementation (on the homepage).
- The **Disney Vacation Planning Guide** was created for the first time
  (`disney-vacation-planning-guide.html` and `-content.html`), along with a preview image, and
  the $7 guide slot was repositioned as the "Festival Planning Guide" placeholder.
- **First "Update website (via Remy)" commit appears** — the autonomous agent's first
  contribution to the live site.

## 2026-08-02 — First Remy-published blog post

- "Why Good Shoes Can Make or Break Your Disney Vacation" published via Remy's automated
  pipeline (topic proposal → owner approval → PR → merge).

## 2026-08-03 — The Remy incident and recovery

**[verified in git history]**

- Remy published a second blog post ("6 Ways Our Disney-Loving Family Actually Saves Money at
  Walt Disney World").
- Separately, an approval was misinterpreted and Remy **overwrote `index.html`** with an
  entirely different, self-branded placeholder site ("Remy's Magic Totes"), replacing the real
  homepage content.
- This was caught and reverted the same day — commit message: *"Update print statement from
  'Hello' to 'Goodbye' — Restore homepage - revert unauthorized rewrite from 70c37c8."* The
  restore was done by copying the raw `index.html` content from the last-known-good commit and
  committing it directly to `main` — **this restore itself happened before branch protection
  existed**, so notably it did NOT go through a PR either. **[from conversation]**

  **Full root cause, reconstructed from an earlier project conversation [from conversation]:**
  Remy was approved (a plain "Yes" reply) for one narrow, specific task — setting up newsletter
  signup tracking. Two things combined to turn that into a full site overwrite:
  1. Remy's publishing code at the time offered *two* possible paths for making a change: a safe
     one (fetch the real current live HTML, apply one specific described edit, publish just
     that) and a dangerous one (generate an entirely new page from scratch, blind to what was
     actually live, and publish it directly). Nothing in the code prevented Remy from choosing
     the dangerous path for a task like this, and he did.
  2. Separately, the code that was supposed to confirm a publish had actually gone live checked
     the wrong URL — it pinged the default `<username>.github.io/<repo>/` address, never the
     real custom domain (`pixiepackedfamily.com`). So Remy could genuinely, honestly report
     "confirmed live" without ever having checked the site real visitors would see.
  3. The damaging commit was initially hard to find: the first pass of investigation only
     checked the most recent one or two commits to `index.html`, which looked like small,
     correct, scoped edits. The actual damaging commit was a separate, earlier one that hadn't
     been reviewed yet — it was only found by pulling the *complete* commit history for
     `index.html` specifically and checking every entry, not just the latest diff.
  4. This was investigated at the time and confirmed to **NOT** be a DNS problem, a GitHub Pages
     misconfiguration, or a second repository competing for the domain — all of those were
     checked directly and ruled out.

- **[from conversation]** Following this, three concrete fixes were made (in the separate Remy
  repository, `sanorg24/Remy` — not this repo):
  1. Branch protection requiring pull-request review was added to `main` in this repo (see
     ARCHITECTURE.md for the exact ruleset settings).
  2. Remy's own `lib/github.js` was rewritten so `publishWebsite`/`publishFile` always create a
     branch and open a PR — direct-to-`main` commits are no longer possible from Remy's code at
     all, not just discouraged.
  3. The wrong-URL "confirm it's live" check was removed entirely, since a PR isn't "live" by
     definition — Remy now reports a PR link for review instead of ever claiming something is
     confirmed live before a human has merged it.
  This is why every Remy-related commit in the log from this point forward is a merged PR
  (`remy-update-<timestamp>` branches), never a direct commit.

- **[from conversation, separate but related]** While investigating this incident (checking DNS
  records), Vanessa's Namecheap account showed as locked, and a follow-up email claiming to be
  from "Namecheap Risk Management" asked for a card payment descriptor across several exchanges
  — the sender address did not actually match Namecheap's real domain. She had partially
  responded before this was caught, and placed a hold on the card as a precaution. The account
  lock itself was confirmed genuine through Namecheap's real live-chat support (typed URL, not a
  link from the email); the "Risk Management" email thread itself was never independently
  confirmed as legitimate through any channel outside that thread. **[uncertain]** Whether that
  email was ever formally reported, and whether Vanessa's Namecheap password/2FA were updated
  afterward, is not known from this or any other available source.

- **[from conversation]** A related but separate, still-open design gap noted in this
  incident's aftermath: Remy's approval state only ever holds one pending decision at a time,
  with no task-ID/reference system. When Remy sends a longer free-form reply that also mentions
  an unrelated still-pending approval, it can read as if multiple things are awaiting approval
  at once, which caused real confusion at least once. This is a Remy-side (not website-side)
  issue and was not fixed as of the conversation that identified it.

## 2026-08-04 — Guide monetization finalized

- A photo carousel was added to the Disney Vacation Planning Guide's sales page.
- **[from conversation]** The guide's fillable content was finalized to 12 pages (Cover,
  Vacation Overview, Trip at a Glance, Outfit Planner, Travel Day, one page per park day,
  Park-Hopping Day, 4 Parks/1 Day, Rest/Resort Day), rendered to a properly branded PDF, and
  listed for sale on Gumroad.
- Price changed from an original $9 to **$4** (commit: "Change price of Disney Vacation Planning
  Guide").
- The placeholder "Buy Now" button was replaced with a real link to the live Gumroad checkout
  (commit: "Change buy button to a link for digital purchase").

## 2026-08-07 — Outfits page refresh

- "Themed Outfit Inspiration" renamed to "Shop Disney Outfits" across the homepage card and
  `outfits.html` itself.
- A new "Park Day Outfits" section added to `outfits.html`, starting with a full Animal Kingdom
  Lion King outfit (Her's and His, 5 Amazon affiliate links each).
- **[from conversation]** This followed a period where uploading new content via Remy had
  stopped working reliably; development moved back to direct collaboration (this conversation)
  for outfit/product content going forward.

## DO NOT REPEAT — failures and approaches from previous conversations

**[from conversation — recovered from four earlier chat handoff documents, cross-checked
against the current repository where possible]**

### Remy / deployment / GitHub / production stability

- **Never let an automated agent have two ways to publish a change, where one is "safe" and one
  is "regenerate/overwrite blind."** The site-overwrite incident above happened specifically
  because a dangerous full-regeneration path existed alongside a safe targeted-edit path, and
  nothing stopped the dangerous one from being chosen. The fix that actually worked was removing
  the dangerous path's ability to reach `main` directly at all (via branch protection), not just
  making the safe path "preferred."
- **Never trust a "confirm it's live" check that pings a fallback/default URL instead of the
  real custom domain.** This let the overwrite incident get reported as a success. Any future
  live-verification check must hit the actual production domain.
- **When investigating a suspicious file change, always pull the complete commit history for
  that specific file, not just the most recent diff(s).** The damaging commit in the incident
  above was missed at first because only the latest one or two commits were reviewed.
- **Do not set "Required approvals" to 1** on this repo's branch protection ruleset as currently
  configured. Remy's PRs and the repo owner's own GitHub account are the same identity (Remy's
  `GITHUB_TOKEN` is tied to the owner's personal account, not a separate bot account) —
  GitHub refuses to let an account approve its own PR, so this setting makes every single PR
  permanently unmergeable. Keep it at 0; "a PR must exist before merging" is what provides the
  real safety benefit (a human looks at the diff and clicks merge), not a same-account approval.
- **Do not let Remy (or any automated agent) commit directly to `main`, ever, for any reason.**
  This is the standing rule for this repo and applies equally to the owner's own manual edits.
- **Do not assume a code bug when a user reports "images/content aren't showing" right after an
  upload.** This happened twice in earlier conversations, and both times the code and file paths
  were correct — the actual cause was GitHub Pages not having redeployed yet, or a screenshot
  taken before files finished uploading. Check upload timestamps and deployment status (the
  Actions/Deployments tab) before assuming anything is actually broken.
- **When updating existing files in this repo, double-check that any newly-added file is
  actually included too** — a recurring crash pattern in Remy's own repo was new files (e.g. a
  new library file) getting left out when only the changed existing files were uploaded, causing
  `MODULE_NOT_FOUND` crashes on deploy. Not a risk for this static-site repo specifically (no
  imports/requires), but worth knowing if this pattern is ever introduced here.

### Branding / content rules

- **No copyrighted Disney character artwork, ever** — tested once (Tinker Bell/fairy art in the
  original banner), explicitly rejected for trademark/copyright risk on a commercial site.
- **Never overlay dynamically-generated text on top of the banner photo** — caused a visible
  text-collision bug once, since the banner's own baked-in text sits at an unpredictable
  position. Any new heading/title goes in its own section below the image.
- **Never rename Apparel's "Men's" category** — tried once, explicitly reversed by the owner.
  (Holidays' different Unisex/Women's/Youth convention is intentional and page-specific — don't
  read that as license to change Apparel's labels too.)
- **Never fabricate a quote and attribute it to the owner (or anyone else) by name** in
  marketing/blog copy — happened once in an early draft, self-corrected before delivery.
- **Never use Claude's own rendered approximation of a design as a stand-in for the owner's real
  exported files** when the goal is to represent her actual product to customers (marketing
  images, previews) — happened once (an HTML-rendered screenshot used instead of her real Canva
  export), caught because fonts/spacing/colors didn't match her real design.
- **Never assume a submitted photo is full resolution** without checking dimensions/file size —
  a previously-downsized copy (213×320px) was deployed once and looked visibly blurry.
- **Never guess a pairing when a batch of photos and a batch of links don't match in count.**
  This happened multiple times across different product batches (Sun/Travel, Women's apparel,
  Loungefly bags/wallets, backpacks) — always flag the mismatch and ask, since guessing wrong
  puts the wrong affiliate link behind the wrong product image.

### Technical patterns (mostly Remy-side, relevant if anyone touches that repo)

- Asking a model to return a large HTML/CSS document packed inside a JSON string field is
  unreliable (token-limit truncation, JSON-escaping fragility) — the working fix is a separate,
  dedicated plain-text generation call with a hard completeness check (must end in `</html>`)
  before the result is ever used.
- IMAP read/unseen-flag tracking for detecting new email replies is fundamentally unreliable
  (opening a message to check anything marks it read; Gmail treats a self-addressed email's Sent
  and Inbox copies as the same message) — UID-based tracking is the correct approach, and it
  must also record which account a stored UID belongs to, since UIDs are meaningless
  across different accounts.
- Print CSS for any printable guide needs `print-color-adjust: exact` (browsers hide background
  colors by default when printing) and `break-inside: avoid` applied only to non-last items in a
  repeating list — applying a forced page-break to every item unconditionally produces a spurious
  trailing blank page.
- Raw `.env`-style content pasted directly into a `.js` file (instead of being set as an actual
  environment variable) causes a `SyntaxError` crash — always set real secrets as environment
  variables, never inline in code.

## DO NOT BREAK

Things that must keep working exactly as they do now, verified live in the repository:

- **The custom domain and CNAME record** — `www.pixiepackedfamily.com` must keep resolving to
  this GitHub Pages site.
- **Branch protection on `main`** — no direct commits, PR review required. This exists
  specifically because of the 2026-08-03 incident above.
- **Every page's Amazon Associate disclosure footer line** — required for FTC/Amazon compliance,
  present on every page today.
- **The `amzn.to` short-link format** for every Amazon product link — don't convert these to
  long-form URLs.
- **The live Gumroad checkout link** for the $4 Disney Vacation Planning Guide
  (`https://disneylife0.gumroad.com/l/wqgoxx`).
- **The Google Analytics tracking ID** (`G-YLXOLMRWKY`) on every page.
- **The real family story and photos** on the homepage — this is genuine personal content
  central to the brand, not filler.
- **The CSS variable palette and font pairing**, identical across every page (see
  ARCHITECTURE.md) — a future redesign should update this deliberately everywhere at once, not
  let pages drift out of sync.
- **Existing internal navigation** — hub pages linking to their real subpages, footer links,
  blog tag-filter links (`blog.html#tag=...`).
- **The free Park Day Packing Checklist guide** staying free and fully accessible — it's used as
  a lead magnet (linked from the homepage hero as "Get a Free Checklist").

## RESOLVED — previously uncertain items, now confirmed against the live repository

The four historical chat handoffs left several items explicitly marked uncertain. Re-checking
the live repo directly resolved these:

- **Guide pricing:** confirmed **$4** everywhere it's displayed (sales page and homepage card) —
  no lingering $9 references found anywhere in the repo.
- **Buy Now button:** confirmed linking to the real, live Gumroad checkout
  (`https://disneylife0.gumroad.com/l/wqgoxx`) — not a placeholder.
- **Google Analytics Measurement ID:** confirmed the real ID (`G-YLXOLMRWKY`) is live on every
  page — no `G-XXXXXXXXXX` placeholder remains anywhere in the repo. (Note: this is the
  website's own GA tag; whether Remy's *separate* GA4 service-account integration for his own
  analytics reads is a different, unrelated setup — see the Remy repo for that.)
- **Haunted Mansion Tee:** confirmed has a real Amazon link (`https://amzn.to/4bTmDAW`), not the
  earlier "Link coming soon" placeholder.
- **"On Cloud Shoes" link reuse:** confirmed the same product link (`B091NQT7KY`) is used
  consistently all 3 times it appears in `outfits.html`, as intended.
- **"Disney Loungefly Bags" placement:** one handoff flagged uncertainty over whether this should
  have been its own new "Park Bags" page rather than a subsection of Accessories. The live repo
  shows it stayed nested under `accessories.html` (as "Loungefly," with Backpacks/Wallets
  subgroups) — no separate "Park Bags" page was ever created. Treat this as the settled outcome
  unless the owner says otherwise.
- **Footer navigation label ("Themed Outfits" vs. "Shop Disney Outfits"):** one handoff flagged
  this as NOT yet fixed. Still true today — see the new Known Issue above.

## CURRENT STATE — last known working production configuration

- **Live URL:** https://www.pixiepackedfamily.com (GitHub Pages, custom domain via `CNAME`)
- **Source:** `main` branch of `sanorg24/Disney-Travel-Site`, branch-protected, PR-required
- **Pages live and fully functional:** Home, Blog (3 posts), Shop Disney Outfits, Apparel hub +
  3 of 4 subpages functional (Kids intentionally "coming soon"), Accessories hub + all 6
  subpages, Sun/Travel hub + all 4 subpages, Holidays hub + 1 subpage, 2 guides (1 free, 1 paid)
- **Known broken link:** Apparel hub → Family Tees (file extension mismatch, see Known Issues)
- **Known incomplete/placeholder:** Festival Planning Guide ($7, no content yet), Etsy Shop link,
  Apparel → Kids subpage, homepage email signup form (no backend)
- **Analytics:** Google Analytics 4 live and confirmed sending real data (tracking ID
  `G-YLXOLMRWKY`)
- **Monetization live:** Amazon affiliate links (`amzn.to`) across all product pages; one paid
  digital product ($4 Disney Vacation Planning Guide) via Gumroad

## Documentation history

- **Initial version** of `PROJECT-CONTEXT.md`, `ARCHITECTURE.md`, and `CHANGELOG.md` generated by
  directly cloning and inspecting the live repository, ahead of a chat-context handoff.
- **First consolidation pass:** four earlier `CHAT-HANDOFF-*.md` documents (produced by separate
  prior Claude conversations on this project, before these three permanent docs existed) were
  reviewed against the live repository and merged in. Duplicate/already-covered information was
  left out; anything the old handoffs got right that wasn't yet captured here was added, with
  `[from conversation]` tags where it can't be independently verified from the repo alone.
  Several previously-uncertain items were actively re-checked against the live repo and resolved
  (see "RESOLVED" section above) rather than carried forward as open questions.

## NEXT PLANNED UPGRADE

**[from conversation]** The next major project for this site is to **separate website content
from website code** by building a secure, browser-based admin/content-management system. The
goal is to let Vanessa — who is not a developer — manage products, images, blog posts, guides,
and affiliate links directly through a simple interface, without needing to manually edit files
in GitHub or wait on a code change and redeploy for every content update. This is a significant
architectural shift from the current all-static, no-backend setup described in ARCHITECTURE.md,
and will need real design decisions around: where content actually lives (a database vs. a
structured content format the static site reads from), how the admin interface authenticates,
and how it publishes changes back to the live site (still via GitHub Pages, or a different
hosting approach entirely). None of that has been decided yet — this section exists so a future
conversation starts from "here's the goal" instead of from zero.
