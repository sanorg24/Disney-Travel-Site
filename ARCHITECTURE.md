# ARCHITECTURE.md — The Pixie Packed Family

## 🔴 SESSION HANDOFF — 2026-08-24 — READ THIS FIRST (current architecture)

> Everything below this section describes a pure static-HTML, no-build-step architecture. **That
> is no longer accurate.** This section is the current, verified picture. See
> PROJECT-CONTEXT.md's handoff section for the branch/PR/task state; this section is the
> technical "how it actually works now."

### Stack, in one line (current)

**Eleventy (11ty)** static site generator, Nunjucks templates, content authored through
**Sveltia CMS** (a Decap/Netlify-CMS-compatible, git-backed headless CMS), still deployed as a
static build to GitHub Pages. There is now a real build step (`npm run build` runs Eleventy);
the repo has `.github/workflows/` (a production build+deploy workflow triggered on push to
`main`, and a separate CMS auto-PR workflow — see below).

### Sveltia CMS — how content actually gets published

- **Backend:** `github`, `branch: cms-edits` — Sveltia **never commits directly to `main`**.
- **`cms-auto-pr.yml`** workflow: triggers on any push to `cms-edits`. If there is no
  already-open PR from `cms-edits` → `main`, it opens one titled "CMS content updates." If one
  is already open, it does nothing (the same PR just accumulates the new commit) — this is why
  a CMS PR must be **merged promptly** after each session; a long-lived open CMS PR keeps
  absorbing every subsequent save until it's dealt with (this happened once — PR #55 sat open
  for days, went 90+ commits stale relative to `main`, and had to be carefully audited and its
  genuinely-valuable content manually extracted onto a fresh branch rather than merged as-is;
  fully resolved, `cms-edits` was reset to match `main`, see CHANGELOG.md).
- **A human must merge the CMS PR** — nothing auto-merges. After merging, `cms-edits` does
  **not** automatically catch up to `main`; someone must explicitly sync it (delete + recreate
  from `main`, or a force-push) or it starts drifting again.
- **Content lives in Markdown files with YAML front matter** under `content/` — Products,
  Looks, Blog posts, and (as of this session) the full Taxonomy hierarchy are all real, editable
  Sveltia collections, not hard-coded.

### The taxonomy system — three real levels, not two

```
Groups (content/taxonomy/groups/*.md)
  └── Categories (content/taxonomy/categories/*.md)  — category.group references a Group's slug
        └── Subgroups (content/taxonomy/subgroups/*.md) — subgroup.category references a Category's slug
```

All three levels are real, CMS-editable Sveltia collections (`taxonomy_groups`,
`taxonomy_categories`, `taxonomy_subgroups`) with `create`/`delete` enabled. **Products**
reference a Category via `category: <slug>` and, for the 3 categories that use them
(Footwear, Family Halloween, Loungefly), a Subgroup via `subgroup: <slug>`.

**Critical fact for anyone touching this:** taxonomy content files are read by exactly one
thing at build time, `eleventy.config.js`'s `taxonomyValidation` collection — it cross-checks
every Product's `category`/`subgroup` against the real taxonomy files and **fails the build**
(not just a warning) if a Product references a Category whose parent Group doesn't match, or a
Subgroup whose parent Category doesn't match. **This validator is intentional and must not be
weakened or removed** — it caught a real production issue once already (three Ears & Headbands
products had accidentally been assigned a Family Halloween subgroup through Sveltia's
unfiltered relation picker; fixed by clearing the bad subgroup values, see CHANGELOG.md).

**Separately, `_data/categoryPages.js`** is a hand-maintained static JS array that actually
drives each Category's own product-listing page (via `templates/category-page.njk`, a generic
Eleventy-pagination-over-data template used by 15+ Categories). **This file is NOT read from
the taxonomy content files** — adding a new Category through Sveltia alone does not make it
appear on the public site; a matching entry must also be added here by a developer. This is a
known, deliberate architectural gap (documented, not yet closed) — see "Group-level taxonomy
now goes further" below for the one piece of this that *was* closed this session.

**As of this session, Group-level taxonomy is different: it's no longer purely a hand-maintained
JS array problem.** A new `shopGroups` Eleventy collection resolves the Shop hub's Group-level
cards directly from `content/taxonomy/groups/*.md` (label, description, URL, and a derived
image — see below), and a new generic `templates/group-page.njk` gives any new Group (that
doesn't already have its own dedicated template) a real landing page automatically. This closes
the "new taxonomy entry has zero public effect" gap **at the Group level only** — Category-level
still requires the `categoryPages.js` step described above.

### Dynamic card-image derivation (new this session)

For any Group or Category card that needs a representative image, instead of a hand-picked
image field to maintain: **first active Category in the Group (by `order`) → first published
Product in that Category (by `order`) → that Product's `image` field.** Strict single-path
lookup — if any link in the chain is missing, the card is cleanly omitted from its grid, never
rendered broken. This means changing which Product/Category sits at the lowest `order` value
changes the featured image automatically, with zero code change — **verified against a real
Vanessa CMS change** (see PROJECT-CONTEXT.md's handoff section for the exact before/after).

### Repository structure (current, high level)

```
content/
  products/*.md            → individual Products (Amazon-affiliate items)
  looks/*.md                → curated "Look" collage entries (Outfits page)
  blog/*.md                 → Blog posts (+ blog.11tydata.js for computed permalink/status logic)
  taxonomy/groups/*.md      → top-level Shop areas (Apparel, Accessories, Sun & Park Day
                               Essentials, Holidays, Travel Essentials)
  taxonomy/categories/*.md  → sub-areas within a Group (e.g. Hats, Backpacks/Park Bags,
                               Footwear, Family Halloween, Accessories & Jewelry)
  taxonomy/subgroups/*.md   → finer split within specific Categories (Footwear
                               Men's/Women's/Kids; Family Halloween Unisex/Women's/Youth;
                               Loungefly Backpacks/Wallets)
_data/categoryPages.js      → hand-maintained data driving each Category's own page (see above)
templates/*.njk             → Nunjucks templates; category-page.njk and group-page.njk are
                               generic/reusable; several top-level areas (accessories.njk,
                               apparel.njk, sun-travel-essentials.njk, holidays.njk,
                               accessories-backpacks.njk) are still their own dedicated files
eleventy.config.js           → all Eleventy collections, including taxonomyValidation,
                               allProducts, backpackProducts, blogPosts, shopGroups,
                               dynamicGroupPages
admin/config.yml             → the full Sveltia CMS configuration (every collection/field)
```

### Draft/publish behavior (Blog)

Blog posts have a `status: draft`/`published` field. As of this session's fix (see
CHANGELOG.md), a `draft` post is now correctly excluded from **both** the Blog Hub listing
*and* standalone-page generation (previously, a draft's own page still built and was reachable
via a guessable URL even though it didn't appear on the Hub — this was fixed via
`content/blog/blog.11tydata.js`'s `eleventyComputed.permalink`, conditional on `status`).

---

> **Everything below this point describes the pre-migration, pure static-HTML architecture and
> is now historical.** Useful for brand-era context (the Remy incident, the original hosting
> setup) but not for understanding how the site actually works today.


> Generated by directly cloning and inspecting `sanorg24/Disney-Travel-Site`. Where something
> couldn't be verified from the repository alone (e.g. GitHub Pages dashboard settings, which
> aren't stored in the repo itself), it's marked accordingly.

## Stack, in one line

Pure static HTML/CSS/JS, no build step, no framework, no package manager, no server-side code —
hosted on GitHub Pages with a custom domain. Every page is a fully self-contained `.html` file.

## Hosting & deployment

- **Host:** GitHub Pages, serving directly from the `main` branch (confirmed: repo's default
  branch is `main`; a `CNAME` file exists at the repo root, which is what enables the custom
  domain on GitHub Pages).
- **Custom domain:** `www.pixiepackedfamily.com` (exact content of `CNAME`).
- **The repository must stay public.** **[from conversation]** GitHub Pages on a private
  repository requires a paid GitHub plan — this repo is public specifically so Pages hosting
  stays free. Don't make it private without also solving that trade-off.
- **No build step of any kind** — no `package.json`, no `.github/workflows`, no static site
  generator config anywhere in the repo. What's committed to `main` is exactly what's served.
- **Deployment = merging to `main`.** There is no separate "deploy" action — GitHub Pages
  republishes automatically within roughly a minute of a merge to `main`.
- **Branch protection [from conversation, strongly corroborated by git history]:** `main` is
  protected via a ruleset named **`protect-main`**, with these specific settings as of the
  conversation that set it up:
  - "Require a pull request before merging" — **ON**
  - "Restrict deletions" — **ON**
  - "Block force pushes" — **ON**
  - "Required approvals" — **0**, deliberately (see the "Required-approvals self-block" entry in
    CHANGELOG.md's DO NOT REPEAT section for why 1 was tried and reverted — don't change this
    back to 1 without also solving that underlying problem)
  - Bypass list — **empty** (applies to everyone, including the repo owner)
  This could not be re-verified against the live GitHub API in this pass (rate-limited), but is
  strongly corroborated by git history: every commit after this was set up is a merged PR
  (`sanorg24-patch-N` branches from GitHub's web editor, or `remy-update-<timestamp>` branches
  from the separate Remy agent's publishing code), never a direct commit to `main`. **Do not
  remove or weaken this protection** — it's the safety net that prevents an automated process
  (or a careless direct commit) from silently overwriting real content again; see the Remy
  incident in CHANGELOG.md for exactly what happened before this existed.

## Repository structure

```
/
├── CNAME                                  → custom domain config
├── index.html                             → homepage
├── outfits.html                           → "Shop Disney Outfits" page
├── blog.html                              → blog index/filter page
├── blog-[slug].html                       → one file per blog post
├── apparel.html                           → Apparel hub
├── apparel-{family-tees,mens,womens,kids}.{html,htm}
│                                           → Apparel subpages (NOTE: family-tees is .htm, see
│                                             Known Issues in PROJECT-CONTEXT.md)
├── accessories.html                       → Accessories hub
├── accessories-{hats,ears-headbands,backpacks,loungefly,pandora,footwear}.html
│                                           → Accessories subpages
├── holidays.html                          → Holidays & Festivals hub
├── holidays-family-halloween.html         → currently the only live holiday subpage
├── sun-travel-essentials.html             → Sun/Travel/Personal Care hub
├── sun-travel-{sunscreen,hair-care,cooling-fans,personal-care}.html
│                                           → subpages
├── guides/
│   ├── disney-vacation-planning-guide.html          → public SALES/preview page ($4 guide)
│   ├── disney-vacation-planning-guide-content.html  → the actual 12-page fillable guide
│   │                                                    content (this is what gets built into
│   │                                                    the PDF sold on Gumroad — it is NOT
│   │                                                    linked from the live site directly,
│   │                                                    since the guide is sold as a PDF, not
│   │                                                    browsed as a webpage)
│   └── park-day-packing-checklist.html    → the FREE guide, fully live and linked
└── photos/                                → every image on the site, flat directory, ~180 files
```

**Naming convention:** `{category}-{subcategory}.html`, e.g. `accessories-loungefly.html`,
`sun-travel-hair-care.html`. New subpages should follow this exact pattern so future automated
tooling (including any future admin panel) can reason about the file structure predictably.

## HTML/CSS/JS organization

- **No shared CSS or JS files anywhere.** Every page has its own `<style>` block in the
  `<head>`, and re-declares the same CSS custom properties (`--purple`, `--maroon`, etc.) rather
  than importing a shared stylesheet. This is verified consistent across every page in the repo
  — the same color palette, font stack, and base rules are copy-present in each file. This is a
  deliberate simplicity trade-off (no build step needed) but means **any future palette or
  typography change has to be applied file-by-file**, or a shared-stylesheet refactor would be
  needed first.
- **JavaScript is minimal and inline**, embedded directly in the page that uses it — there are
  no external `.js` files anywhere in the repo. Known JS usage:
  - `index.html` — hamburger/mobile-menu toggle logic.
  - `blog.html` — client-side tag filtering (`.filter-btn` click handlers show/hide `.blog-card`
    elements by matching `data-tag`; also reads a `#tag=` hash from the URL on load so links
    like `blog.html#tag=amazon-finds` land pre-filtered).
  - Guide pages use `window.print()` for the "Print / Save as PDF" buttons (browser-native, no
    JS library involved).
- **No `<form>` submits anywhere that actually works.** The one `<form>` on the site (homepage
  email signup) has no `action` attribute and no JS handler — it's currently decorative.
- **No client-side or server-side APIs, no fetch/XHR/axios calls, no analytics beyond the single
  Google Analytics snippet** (see below). This is a fully static, no-backend site.

## Image/media handling

- All images live flat in `/photos/` — no subfolders by category. Naming follows
  `{category}-{descriptor}-{number}.jpg` (e.g. `accessories-loungefly-07.jpg`,
  `sun-travel-14.jpg`). ~180 image files, ~25MB total.
- No image optimization/CDN/lazy-loading pipeline — images are served as-is via GitHub Pages.
- Guide preview/carousel images follow their own pattern: `vacation-guide-carousel-{1,2,3}.jpg`.

## Analytics

Google Analytics 4 (gtag.js), tracking ID `G-YLXOLMRWKY`, confirmed present and identical in
every page's `<head>`. This is the only third-party tracking/analytics on the site.

## Affiliate & external links

- Amazon product links use `amzn.to/...` short links (affiliate tag embedded server-side by
  Amazon — the visible URL doesn't show a `tag=` parameter, and that's expected/correct).
- The $4 Disney Vacation Planning Guide's "Buy Now" button links directly to a live Gumroad
  checkout: `https://disneylife0.gumroad.com/l/wqgoxx`.
- Social links point to real accounts: TikTok `@thepixiepackedfamily`, Instagram
  `@vanessagronas`, Facebook (The Pixie Packed Family), YouTube `@thepixiepackedfamily`.
- Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`) are the only other external
  dependency — loaded via `<link>`, no self-hosted fonts.

## Environment variables

**None.** This repository has no server-side code, so it has no environment variables of its
own. (There IS a related, separate system — see "Related but separate system" below — which
does have its own environment variables, but those live in that system's deployment, not here.)

## Dependencies

**None.** No `package.json`, no `node_modules`, no CDN-loaded JS frameworks. The only external
resources loaded by any page are Google Fonts and the Google Analytics script.

## Deployment process (how a change actually goes live)

1. A change is made to one or more files — either directly via GitHub's web editor
   ("delete-and-replace" workflow), or via a pull request from the separate Remy system.
2. Because `main` is protected, this always creates a pull request rather than committing
   directly.
3. A human reviews and merges the PR into `main`.
4. GitHub Pages automatically republishes from `main` within roughly a minute.
5. There is no staging environment and no automated testing — review-before-merge is the only
   safety check in this pipeline.

## Related but separate system: "Remy"

**[from conversation, not part of this repository]** There is a separate Node.js/Express
service (repository `sanorg24/Remy`, deployed on Railway) that acts as an autonomous business
agent — it can propose website edits, write blog posts, and more, always via opening a pull
request against this repo (using a GitHub personal access token and the same PR-required
workflow described above). It is a distinct codebase with its own environment variables,
its own `state.json`, its own email-based approval flow, and its own architecture — **not**
part of `Disney-Travel-Site` and out of scope for this document. If a future developer needs to
understand or modify Remy itself, that requires access to the separate Remy repository, not
this one. It's mentioned here only because its PRs are one of the two ways changes reach this
repo.

## What a new developer needs to safely work on this project

1. **Never commit directly to `main`** — always go through a pull request, even for a tiny
   change. This is enforced by branch protection, and exists specifically because of a past
   incident (see PROJECT-CONTEXT.md).
2. **Match the existing CSS variable palette and font pairing exactly** when touching any page
   — see PROJECT-CONTEXT.md's Design System section for the literal values.
3. **Follow the existing `{category}-{subcategory}.html` naming convention** for any new
   subpage, and use `.html` (not `.htm` — see the one existing exception, which is a bug, not a
   pattern to repeat).
4. **Don't introduce a shared stylesheet or JS bundle without a clear plan** for updating every
   existing page consistently — right now, "no shared files" is simple but means every page
   carries its own copy of the same CSS.
5. **Amazon links must stay as `amzn.to` short links** — don't "clean them up" into full
   `amazon.com` URLs; the short links are the correct, working format already in use.
6. Guide content sold as a paid download (the $4 guide) is built and delivered as a **PDF via
   Gumroad**, not as a live webpage the buyer visits — `disney-vacation-planning-guide-content.html`
   in `/guides/` is the source material for that PDF, not a page meant to be browsed directly.
[ARCHITECTURE.md](https://github.com/user-attachments/files/30876269/ARCHITECTURE.md)
# ARCHITECTURE.md — The Pixie Packed Family

> Generated by directly cloning and inspecting `sanorg24/Disney-Travel-Site`. Where something
> couldn't be verified from the repository alone (e.g. GitHub Pages dashboard settings, which
> aren't stored in the repo itself), it's marked accordingly.

## Stack, in one line

Pure static HTML/CSS/JS, no build step, no framework, no package manager, no server-side code —
hosted on GitHub Pages with a custom domain. Every page is a fully self-contained `.html` file.

## Hosting & deployment

- **Host:** GitHub Pages, serving directly from the `main` branch (confirmed: repo's default
  branch is `main`; a `CNAME` file exists at the repo root, which is what enables the custom
  domain on GitHub Pages).
- **Custom domain:** `www.pixiepackedfamily.com` (exact content of `CNAME`).
- **The repository must stay public.** **[from conversation]** GitHub Pages on a private
  repository requires a paid GitHub plan — this repo is public specifically so Pages hosting
  stays free. Don't make it private without also solving that trade-off.
- **No build step of any kind** — no `package.json`, no `.github/workflows`, no static site
  generator config anywhere in the repo. What's committed to `main` is exactly what's served.
- **Deployment = merging to `main`.** There is no separate "deploy" action — GitHub Pages
  republishes automatically within roughly a minute of a merge to `main`.
- **Branch protection [from conversation, strongly corroborated by git history]:** `main` is
  protected via a ruleset named **`protect-main`**, with these specific settings as of the
  conversation that set it up:
  - "Require a pull request before merging" — **ON**
  - "Restrict deletions" — **ON**
  - "Block force pushes" — **ON**
  - "Required approvals" — **0**, deliberately (see the "Required-approvals self-block" entry in
    CHANGELOG.md's DO NOT REPEAT section for why 1 was tried and reverted — don't change this
    back to 1 without also solving that underlying problem)
  - Bypass list — **empty** (applies to everyone, including the repo owner)
  This could not be re-verified against the live GitHub API in this pass (rate-limited), but is
  strongly corroborated by git history: every commit after this was set up is a merged PR
  (`sanorg24-patch-N` branches from GitHub's web editor, or `remy-update-<timestamp>` branches
  from the separate Remy agent's publishing code), never a direct commit to `main`. **Do not
  remove or weaken this protection** — it's the safety net that prevents an automated process
  (or a careless direct commit) from silently overwriting real content again; see the Remy
  incident in CHANGELOG.md for exactly what happened before this existed.

## Repository structure

```
/
├── CNAME                                  → custom domain config
├── index.html                             → homepage
├── outfits.html                           → "Shop Disney Outfits" page
├── blog.html                              → blog index/filter page
├── blog-[slug].html                       → one file per blog post
├── apparel.html                           → Apparel hub
├── apparel-{family-tees,mens,womens,kids}.{html,htm}
│                                           → Apparel subpages (NOTE: family-tees is .htm, see
│                                             Known Issues in PROJECT-CONTEXT.md)
├── accessories.html                       → Accessories hub
├── accessories-{hats,ears-headbands,backpacks,loungefly,pandora,footwear}.html
│                                           → Accessories subpages
├── holidays.html                          → Holidays & Festivals hub
├── holidays-family-halloween.html         → currently the only live holiday subpage
├── sun-travel-essentials.html             → Sun/Travel/Personal Care hub
├── sun-travel-{sunscreen,hair-care,cooling-fans,personal-care}.html
│                                           → subpages
├── guides/
│   ├── disney-vacation-planning-guide.html          → public SALES/preview page ($4 guide)
│   ├── disney-vacation-planning-guide-content.html  → the actual 12-page fillable guide
│   │                                                    content (this is what gets built into
│   │                                                    the PDF sold on Gumroad — it is NOT
│   │                                                    linked from the live site directly,
│   │                                                    since the guide is sold as a PDF, not
│   │                                                    browsed as a webpage)
│   └── park-day-packing-checklist.html    → the FREE guide, fully live and linked
└── photos/                                → every image on the site, flat directory, ~180 files
```

**Naming convention:** `{category}-{subcategory}.html`, e.g. `accessories-loungefly.html`,
`sun-travel-hair-care.html`. New subpages should follow this exact pattern so future automated
tooling (including any future admin panel) can reason about the file structure predictably.

## HTML/CSS/JS organization

- **No shared CSS or JS files anywhere.** Every page has its own `<style>` block in the
  `<head>`, and re-declares the same CSS custom properties (`--purple`, `--maroon`, etc.) rather
  than importing a shared stylesheet. This is verified consistent across every page in the repo
  — the same color palette, font stack, and base rules are copy-present in each file. This is a
  deliberate simplicity trade-off (no build step needed) but means **any future palette or
  typography change has to be applied file-by-file**, or a shared-stylesheet refactor would be
  needed first.
- **JavaScript is minimal and inline**, embedded directly in the page that uses it — there are
  no external `.js` files anywhere in the repo. Known JS usage:
  - `index.html` — hamburger/mobile-menu toggle logic.
  - `blog.html` — client-side tag filtering (`.filter-btn` click handlers show/hide `.blog-card`
    elements by matching `data-tag`; also reads a `#tag=` hash from the URL on load so links
    like `blog.html#tag=amazon-finds` land pre-filtered).
  - Guide pages use `window.print()` for the "Print / Save as PDF" buttons (browser-native, no
    JS library involved).
- **No `<form>` submits anywhere that actually works.** The one `<form>` on the site (homepage
  email signup) has no `action` attribute and no JS handler — it's currently decorative.
- **No client-side or server-side APIs, no fetch/XHR/axios calls, no analytics beyond the single
  Google Analytics snippet** (see below). This is a fully static, no-backend site.

## Image/media handling

- All images live flat in `/photos/` — no subfolders by category. Naming follows
  `{category}-{descriptor}-{number}.jpg` (e.g. `accessories-loungefly-07.jpg`,
  `sun-travel-14.jpg`). ~180 image files, ~25MB total.
- No image optimization/CDN/lazy-loading pipeline — images are served as-is via GitHub Pages.
- Guide preview/carousel images follow their own pattern: `vacation-guide-carousel-{1,2,3}.jpg`.

## Analytics

Google Analytics 4 (gtag.js), tracking ID `G-YLXOLMRWKY`, confirmed present and identical in
every page's `<head>`. This is the only third-party tracking/analytics on the site.

## Affiliate & external links

- Amazon product links use `amzn.to/...` short links (affiliate tag embedded server-side by
  Amazon — the visible URL doesn't show a `tag=` parameter, and that's expected/correct).
- The $4 Disney Vacation Planning Guide's "Buy Now" button links directly to a live Gumroad
  checkout: `https://disneylife0.gumroad.com/l/wqgoxx`.
- Social links point to real accounts: TikTok `@thepixiepackedfamily`, Instagram
  `@vanessagronas`, Facebook (The Pixie Packed Family), YouTube `@thepixiepackedfamily`.
- Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`) are the only other external
  dependency — loaded via `<link>`, no self-hosted fonts.

## Environment variables

**None.** This repository has no server-side code, so it has no environment variables of its
own. (There IS a related, separate system — see "Related but separate system" below — which
does have its own environment variables, but those live in that system's deployment, not here.)

## Dependencies

**None.** No `package.json`, no `node_modules`, no CDN-loaded JS frameworks. The only external
resources loaded by any page are Google Fonts and the Google Analytics script.

## Deployment process (how a change actually goes live)

1. A change is made to one or more files — either directly via GitHub's web editor
   ("delete-and-replace" workflow), or via a pull request from the separate Remy system.
2. Because `main` is protected, this always creates a pull request rather than committing
   directly.
3. A human reviews and merges the PR into `main`.
4. GitHub Pages automatically republishes from `main` within roughly a minute.
5. There is no staging environment and no automated testing — review-before-merge is the only
   safety check in this pipeline.

## Related but separate system: "Remy"

**[from conversation, not part of this repository]** There is a separate Node.js/Express
service (repository `sanorg24/Remy`, deployed on Railway) that acts as an autonomous business
agent — it can propose website edits, write blog posts, and more, always via opening a pull
request against this repo (using a GitHub personal access token and the same PR-required
workflow described above). It is a distinct codebase with its own environment variables,
its own `state.json`, its own email-based approval flow, and its own architecture — **not**
part of `Disney-Travel-Site` and out of scope for this document. If a future developer needs to
understand or modify Remy itself, that requires access to the separate Remy repository, not
this one. It's mentioned here only because its PRs are one of the two ways changes reach this
repo.

## What a new developer needs to safely work on this project

1. **Never commit directly to `main`** — always go through a pull request, even for a tiny
   change. This is enforced by branch protection, and exists specifically because of a past
   incident (see PROJECT-CONTEXT.md).
2. **Match the existing CSS variable palette and font pairing exactly** when touching any page
   — see PROJECT-CONTEXT.md's Design System section for the literal values.
3. **Follow the existing `{category}-{subcategory}.html` naming convention** for any new
   subpage, and use `.html` (not `.htm` — see the one existing exception, which is a bug, not a
   pattern to repeat).
4. **Don't introduce a shared stylesheet or JS bundle without a clear plan** for updating every
   existing page consistently — right now, "no shared files" is simple but means every page
   carries its own copy of the same CSS.
5. **Amazon links must stay as `amzn.to` short links** — don't "clean them up" into full
   `amazon.com` URLs; the short links are the correct, working format already in use.
6. Guide content sold as a paid download (the $4 guide) is built and delivered as a **PDF via
   Gumroad**, not as a live webpage the buyer visits — `disney-vacation-planning-guide-content.html`
   in `/guides/` is the source material for that PDF, not a page meant to be browsed directly.

## CMS Content Architecture (local prototype, Checkpoint 3 closed — not yet in production)

**[from conversation]** This section documents the CMS/admin upgrade's data model and prototype
stack as of the close of Checkpoint 3. Everything described here exists only in an isolated local
prototype (Eleventy + Sveltia CMS, built and tested outside this repository's actual deployment)
— none of it has touched `Disney-Travel-Site` itself, GitHub Pages, GitHub Actions, or OAuth. See
CHANGELOG.md "CMS Upgrade — Checkpoint History" for the checkpoint-by-checkpoint narrative.
Checkpoint 4 (production connection) has not begun and requires Vanessa's separate, explicit
approval to start — closing Checkpoint 3 is not that approval.

### Chosen stack

- **Eleventy (11ty)** as the static site generator — turns structured content files into the
  same flat HTML pages GitHub Pages already serves, preserving existing URLs exactly.
- **Sveltia CMS** as the content editor — a git-based, browser-only CMS requiring no server of
  its own; content edits are just files.
- **GitHub Actions** for the eventual build/deploy step, deliberately kept separate from Remy's
  Railway environment — Actions builds Eleventy and deploys the built artifact directly to Pages
  (via the "GitHub Actions" Pages source, not "deploy from a branch"), so generated HTML is never
  committed back into source control.
- **Markdown + YAML frontmatter** for structured content — chosen over JSON for human
  readability, PR-diff clarity, and better fit for long-form fields like blog/Look descriptions.

### Data model

- **Products** — a master, reusable Product Library. One entry per shoppable item: name, image
  (**optional** — some existing real products, like the individual items inside the Minnie in
  Pink look, have no per-item photo on the live site today, only a name + Amazon link), alt
  text, Amazon affiliate URL, `image_source` (currently `uploaded` or `amazon` — the `amazon`
  value exists in the schema now specifically so a future approved Amazon-image integration
  doesn't require a schema redesign, even though no Amazon fetching exists yet), and `status`
  (`draft` / `published` / `hidden`).
- **Collections** — top-level shopping/content sections (e.g. "Accessories", "Shop Disney
  Outfits"). Modeled as data (not as separate hand-authored pages, and not as Sveltia schema)
  specifically so Vanessa can eventually create a new Collection herself without a
  developer/Claude editing config files.
- **Categories** — belong to one Collection. Two content types:
  - **Type A** — contains Products directly (e.g. Backpacks). Simple grid, no intermediate
    layer.
  - **Type B** — contains Looks (e.g. Disney Characters). A curated multi-product entry per
    Look, not individual products directly.
  Vanessa's explicit instruction: keep Type A and Type B conceptually distinct in the CMS — a
  Product is one shoppable item, a Look is a curated entry containing multiple Products. Don't
  collapse them into one generic form just to reduce template count.
- **Looks** — shop-the-look / inspiration entries (e.g. "Minnie in Pink"). One collage/
  inspiration image, optional description/tips (Vanessa's own voice, always optional), optional
  Pinterest title/description, `status`, and an ordered list of **references** to Products in
  the master library (not copies of product data).

### Product reuse — two distinct, deliberately separate actions

- **Edit the master Product** → updates it everywhere it's referenced (Category grids and every
  Look that includes it). Verified working in the Checkpoint 3 prototype, including across two
  different content types referencing the same product simultaneously.
- **Replace/remove a Product within one specific Look** → changes only that Look's reference
  list; the master Product record and every *other* place referencing it are untouched. Also
  verified working — a swapped-out product's master record was confirmed byte-for-byte
  unchanged after the swap.

### Draft / Published / Hidden

Draft and Hidden are technically the same build behavior (excluded from the generated site) —
they differ only in intent/labeling for Vanessa (Draft = not ready yet, Hidden = was live,
pulled temporarily). Important, verified behavior: **a hidden Product disappears from a
published Look's shoppable list without hiding or breaking the Look itself** — the Look page
keeps rendering normally with just that one item silently omitted. Not yet built: cascading
status across Collection→Category→Look→Product ancestry (e.g. a draft Category doesn't yet
force its child Looks to also be excluded) — deliberately deferred, not forgotten; the data
model doesn't prevent adding this later.

### Stable Look URLs

A Look's URL-generating slug is set once at creation and is never regenerated from the title.
Verified in the Checkpoint 3 prototype: renaming a Look's title and moving it to a different
Category, then rebuilding, left its generated URL completely unchanged. This matters because
Pinterest/social posts will link directly to a specific Look's page and may keep sending traffic
long after the title or category changes.

### RESOLVED — Category ↔ Look relationship sync

**Discovered during Checkpoint 3 stable-URL testing, resolved later the same checkpoint via an
architecture change, not a config patch.** The original problem: a Category's membership of a
given Look was represented in *two* places — the Category held an ordered list of Look
references, and the Look separately held its own `category` field pointing back. Moving a Look
updated only one side, leaving stale references.

**Fix — the Look is now the single source of truth for the relationship.** Categories no longer
store any list of Looks at all (`look_items` was removed from the schema entirely). Category
pages derive their Look membership at Eleventy build time, by filtering all published Looks down
to the ones whose own `category` field matches — a pure query, never a maintained list, so there
is nothing left to go stale. Verified in local testing: moving a Look between two Categories (a
one-field edit) correctly removed it from the old Category's rendered page and added it to the
new one, with zero manual cleanup and zero stale references. The Look's generated URL was
confirmed byte-identical before and after the move — moving or reordering a Look never touches
its slug.

**Ordering within a Category — Display Position field.** Sveltia's native `reorder` +
`view_groups` options (drag-and-drop reordering, grouped by Category in the list view) were
tried first per current Sveltia documentation, but did not work in real browser testing —
Vanessa saw a flat, ungrouped list with no functioning drag control, despite correct
configuration. Do not reintroduce these options without new evidence they've been fixed
upstream. The adopted solution instead: a plain **Display Position** number field on each Look
(internal field name `order`), combined with Sveltia's `sortable_fields` option set to default-
sort the Looks list ascending by that field. This is a different, simpler Sveltia feature than
`reorder` — a pre-set sort, not drag-and-drop — and it works correctly: the CMS list opens
already in true website order, and re-saving a Look with a new position live-updates the visible
list order automatically. Blank Display Position values sort to the end (not the front — the
original sort logic had this backwards and was fixed). Duplicate values don't crash the build,
they just fall back to file order among the tied entries — accepted as a low-consequence edge
case rather than solved with validation, since Sveltia has no native "unique value" field
option.

**Viewing one Category's Looks in order:** Sveltia's list search bar, searching the exact
Category name, reliably narrows the Looks list to just that Category (verified). The search does
*not* preserve the Display Position sort automatically — Vanessa needs to re-select "Display
Position / Ascending" from the sort control after searching. This two-click sequence (search,
then re-apply sort) is the accepted permanent workflow, not a bug to keep chasing — verified
working end-to-end.

**Position numbering convention: spaced integers (10, 20, 30…), not consecutive 1, 2, 3.**
Decimal positions were considered and explicitly rejected — Vanessa found number sequences like
`1.5`, `1.75` too confusing to maintain over time. Spaced integers solve the real underlying
problem (inserting a Look between two existing ones, e.g. moving something from near the bottom
of a 20-Look Category to near the top) without decimals: a new value like `15` slots cleanly
between `10` and `20`, touching only the one Look being moved. The Display Position field's hint
text should read: "Controls the order Looks appear in this Category. Use 10, 20, 30, etc. so
there's room to insert a Look later—for example, use 15 to place something between 10 and 20."

### RESOLVED — Product Library thumbnails not appearing

**Root cause, found through a sequence of isolation tests, not a single fix.** Two independent
problems were compounding:

1. **Media path convention mismatch.** The prototype's `media_folder`/`public_folder` config used
   a Netlify/Decap-era relative convention (`media_folder: "../photos"`, `public_folder:
   "photos"`) that doesn't match Sveltia's current documented requirement (`media_folder` must be
   absolute/repo-root-relative; `public_folder` requires a leading slash). Corrected to
   `media_folder: "/src/photos"` and `public_folder: "/photos"`. Existing Product records
   pre-dating this fix stored `image:` values in the old no-leading-slash form
   (`photos/example.jpg`), which the corrected config could no longer resolve — those specific
   records were excluded from the Products list entirely (not just missing a thumbnail, the
   whole entry). **This is the correct, permanent convention going forward** — confirmed by a
   single-record isolation test (fixing one Product's path resolved only that one record, leaving
   the other two — with unmodified paths — still absent, cleanly isolating the cause), then
   applied to all existing Product records. **Any new Product/Look image path must use this
   leading-slash form.**
2. **`type="module"` on Sveltia's script tag.** Sveltia's current docs show this attribute being
   explicitly removed as a correction (it's unnecessary for the distributed `.js` build, which is
   not an ES module, and "may lead to unexpected behavior"). Removing it resolved a second,
   separate problem: new Products created via clipboard-paste were saving to disk as orphaned
   `.sveltia-tmp-*` files (confirmed by direct inspection — the temp files contained complete,
   valid Product data that simply never got renamed/finalized to their real filename) instead of
   finalizing normally. **`type="module"` must not be re-added.**

**Current confirmed-working image-import workflows** (all human-tested in the local prototype,
after both fixes above):
- Existing/migrated Product images (`/photos/...` convention): **PASS**
- Amazon/browser right-click → Copy Image → paste into Sveltia's Image field (Vanessa's real
  workflow): **PASS**, no orphaned temp files
- Local image file dragged from Windows File Explorer directly onto the field: **PASS**
- New Product created with no image at all: **PASS**
- Lorem Picsum / external stock photo selection: **PASS**
- Dragging an image directly from a webpage/browser tab (e.g. straight off Amazon's product
  page) into the field: **FAIL, unsupported/unreliable** — explicitly **not** a workflow Vanessa
  needs; deferred, not a blocker.

**Sveltia version note:** the CDN URL used (`unpkg.com/@sveltia/cms/dist/sveltia-cms.js`) is
intentionally unversioned per Sveltia's own recommended install pattern, and resolved to
`0.183.0` at the time these fixes were verified. This isn't pinned, so a future session may see a
different version — if behavior ever contradicts what's documented here, check the actual
resolved version before assuming the config regressed.

### Amazon Associates integration — deferred, schema-ready

Vanessa's real Associates dashboard was checked directly: the Creators API (Amazon's current,
non-deprecated affiliate data API — the older Product Advertising API is retired) is visible
under Tools, but the account does not yet meet the eligibility bar to create an application
(requires 10+ qualifying sales in the trailing 30 days, per the FAQ shown directly in her
dashboard). **Decision: Amazon API integration is deferred, not abandoned.** Do not scrape
Amazon, do not attempt a workaround for the eligibility requirement. The `image_source` field
described above exists specifically so the Product schema doesn't need to change again once
eligibility is met. Manual product entry (uploading a photo, pasting an Amazon link by hand)
must remain a **permanent** fallback even after any future Amazon integration exists, since API
eligibility isn't guaranteed to stay met indefinitely. Amazon's image-storage/hotlinking
compliance rules (their license terms prohibit storing their product images locally — they must
be served live from Amazon's own URLs) are a separate, real constraint to design around whenever
this integration is actually built, not yet solved.

### Known latent concern — Type A (Product-only) Categories, not currently a blocker

Type A Categories (e.g. Backpacks) still hold their Products via a parent-held list, the same
general shape as the Category↔Look relationship that had to be redesigned above. This was
deliberately **not** touched during the Checkpoint 3 Look↔Category redesign — Products have never
needed to move between Categories in testing, and nothing has actually broken. Recorded here so a
future session isn't surprised: if Products ever gain their own `category` relation field, or
moving a Product between Categories becomes a real workflow, the same class of sync bug is
structurally possible and would need the same fix (Product-owns-the-relationship, Category
derives its list at build time). Not a current blocker — do not expand scope to fix this now.

### Local testing safety pattern

Every local CMS test package (Checkpoint 2 onward) is built the same way: a standalone git
repository with **no remote configured** (so nothing can be pushed even by accident), a
`config.yml` pointing at a placeholder, nonexistent repo name (Sveltia's "Work with Local
Repository" mode never actually reads this value — verified against their docs — so this is
purely a safety belt-and-suspenders measure), and no `base_url`/OAuth proxy configured at all
(meaning a "Login with GitHub" click has no way to complete even if clicked by accident). This
pattern should be reused for any future local package.

**Stale-handle discovery:** running successive local packages at the same `localhost` origin
caused Sveltia/Chrome to silently reuse a previously-granted folder handle via the File System
Access API, making a new package appear to load correctly (its `config.yml` fetches fine over
plain HTTP, unrelated to the file-handle issue) while actually reading stale content from an
old package's folder. Moving to a fresh port each time (used so far: 8080 → 8081 → 8082) forces
a new folder-picker prompt and resolves this. Use a fresh port for any future local retest.
