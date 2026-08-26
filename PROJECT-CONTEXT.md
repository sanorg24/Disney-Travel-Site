# PROJECT-CONTEXT.md — The Pixie Packed Family

## 🔴 SESSION HANDOFF — 2026-08-24 — READ THIS FIRST

> Everything in this section is current, directly verified against the live repository as of
> this handoff, and supersedes any conflicting statement in the older content below. The
> content below this section predates a major architecture migration (see note at the boundary)
> and is preserved for brand/voice/historical value, not as a description of the current stack.

**This project no longer matches the "pure static HTML, no build step" description in the rest
of this file.** The site now runs on **Eleventy (11ty) with a Sveltia CMS** authoring layer.
Vanessa creates/edits Products, Looks, Blog posts, and (as of this session) Taxonomy entries
herself through Sveltia — the CMS usability goal described later in this document has been
substantially achieved. See ARCHITECTURE.md's new handoff section for the full technical
picture (Eleventy collections, the three-level taxonomy system, the CMS→GitHub PR workflow).

### Current `main`

- **HEAD:** `9121aaa4ce3a202478048c2452531ea0992fe8de` (PR #78 merged)
- PR #78 was a routine Sveltia CMS product-order change: **Polka Dots Sling Bag for Women
  Crossbody Bag** is now `order: 1` in the `backpacks` (publicly labeled "Park Bags") category;
  the previous order-1 product, the Maelstrom 40L backpack, moved to `order: 5`.
- `main` is stable, deployed, and not the subject of any pending work.

### Active unmerged branch — `taxonomy-driven-shop-hub`

- **Current HEAD:** `be209c0cb25db91cb17ef221874455326f833316`
- **Status: committed locally, NOT pushed, NOT merged, NOT yet opened as a PR.**
- Based on current `main` (already includes PR #78 via a clean merge integration — see below).

**What this branch implements**, in full:

1. **Corrected two malformed taxonomy slugs** that had been saved through Sveltia with their
   display-label text as the slug value instead of a proper slug (`"Accessories & Jewelry"` →
   `accessories-jewelry`; `"Travel Essentials"` → `travel-essentials`). Both were unreferenced
   by any Product at the time, so this was safe to do without any migration risk.
2. **Extended the Group taxonomy schema** (`content/taxonomy/groups/*.md`) with two new fields:
   `permalink_path` (each Group's real public URL — necessary because the `sun-travel` Group's
   actual URL, `sun-travel-essentials.html`, does not match a slug-derived convention) and
   `description` (the short blurb shown on its Shop hub card). All 4 pre-existing Groups kept
   their exact existing URLs; only `travel-essentials` is new.
3. **Approved display-label updates** applied to Group labels: `accessories` → "Park Day
   Accessories", `holidays` → "Holidays & Festivals" (Apparel and Sun & Park Day Essentials
   already matched their approved public titles).
4. **Made the Shop hub (`shop.html`) taxonomy-driven.** A new Eleventy collection,
   `shopGroups` (in `eleventy.config.js`), resolves every active Group into card-ready data
   (label, description, URL, and a derived image — see #6 below) and `templates/shop.njk` now
   loops over it instead of hard-coding each Group's card. The "Shop Disney Outfits" card stays
   as an explicit, separately-coded entry, since Looks/Outfits are not part of the
   Group→Category→Product taxonomy at all.
5. **New generic `templates/group-page.njk`**, paginated over a second collection
   (`dynamicGroupPages`, same underlying data minus the 4 Groups that already have their own
   dedicated hand-built templates). This means any *new* Group — starting with
   `travel-essentials` — automatically gets a real landing page with zero new template code, the
   same way new Categories already get a page for free via the existing `category-page.njk`. It
   correctly shows a graceful "Items coming soon — check back shortly!" message when a Group
   has no Categories yet (currently true for Travel Essentials — it has zero Categories, so its
   Shop hub card is also correctly omitted, not rendered broken).
6. **Dynamic Group/Category-card image derivation — no new image field anywhere.** For any Group
   or Category card that needs a representative image, the build walks: first active Category
   in the Group (by `order`) → first published Product in that Category (by `order`) → that
   Product's `image` field. This is a strict single-path lookup (not a fallback search across
   multiple items) — if any link in that chain is missing, the card is cleanly **omitted**, never
   rendered broken. This means Vanessa can change a Group's or Category's featured image purely
   by reordering Products/Categories through Sveltia — **this has now been proven against a real
   CMS change**, see below.
7. **Also converted the Park Day Accessories hub's own Backpacks card** (`templates/accessories.njk`)
   to this same dynamic mechanism — it now reads live from the same `shopGroups` data instead of
   being separately hard-coded, so its title and image can never drift out of sync with the
   taxonomy again the way "Backpacks" vs. the already-renamed "Park Bags" label just had.
8. **8 subgroup CMS display labels disambiguated** (`content/taxonomy/subgroups/*.md`) — e.g.
   "Women's" → "Footwear — Women's" vs. "Family Halloween — Women's" — since Sveltia shows all
   subgroups in one flat, unfiltered list with no way to filter by the parent Category selected
   on the same Product. Confirmed this field is read in exactly one place in code (a build-time
   console warning), never in any public template — purely a CMS-editing-experience fix, zero
   public-site rendering impact.
9. **Added `pattern` regex validation** to both the Group and Category slug fields in
   `admin/config.yml` (confirmed supported by Sveltia's own current documentation), rejecting
   spaces/capitals/symbols going forward — directly preventing a repeat of the malformed-slug
   issue fixed in #1.
10. **URL preservation, confirmed throughout:** every existing Group/Category/Product/Look/Blog
    URL is unchanged. The only new URL introduced anywhere is `travel-essentials.html`.

### 🟢 Proven: dynamic image selection responds correctly to a real CMS change

This is the most important thing to know about this branch's core mechanism, because it's now
been validated against something Vanessa actually did, not just a hypothetical: she reordered
Products in Sveltia (PR #78) → that PR merged to `main` → this branch was integrated with the
new `main` (clean merge, zero conflicts, zero file overlap between the two) → **the Park Day
Accessories Shop hub card automatically switched its image to the new order-1 product, with
zero code change required.**

- Selected image: `/photos/pasted-image-1787597341183.png`
- Dimensions: `749×1380` (a meaningful resolution upgrade from the previous order-1 product's
  135×135px image, which had been flagged as a real, if non-blocking, visual-quality concern
  in the branch's own implementation report before this CMS change happened)

### 🟡 Open item — do NOT lose this, not yet approved

The most recent commit on this branch (`be209c0`) intentionally left the Park Day Accessories
hub's Backpacks/Park Bags card with an **empty `<p></p>`** where a description used to be — the
old hard-coded text ("Comfortable, practical bags built for a full day of walking.") was
dropped because Category taxonomy data has no `description` field (only Group does). This was a
deliberate trade-off, not an oversight, but **it has not been approved as final.**

**Proposed next change, for review — NOT yet implemented:** restore a short visitor-facing
description for this card:

> "Backpacks, crossbody bags, slings, and small park bags for carrying the essentials
> comfortably."

Implementing this would most likely mean adding a `description` field to the Category taxonomy
schema (mirroring what Group already has), or a narrower single-card fix — either way, treat
this as the next decision to bring back to Troy/Vanessa, not something to implement without
sign-off.

### Current validation state (this session, on `be209c0`, after PR #78 integration)

- Clean Eleventy build: **0 errors**
- Taxonomy validation: **0 errors, 0 warnings**
- Internal links: **0 broken** (site-wide checker)
- Product count: **237** (unchanged by this branch)
- Look count: **22** (unchanged by this branch)
- Affiliate-link count: **355** (unchanged by this branch, confirmed via precise regex count)
- Full recursive diff of the entire generated site against a pre-branch baseline: **exactly 5
  pages differ anywhere on the whole site** — `admin/config.yml`, `shop.html`,
  `accessories.html`, `accessories-backpacks.html` (product-grid reorder from PR #78 only), and
  the new `travel-essentials.html`. Every other page — all other Category pages, every Product,
  every Look, every Blog post, the homepage — confirmed byte-for-byte identical.
- **Not yet visually reviewed in an actual browser** (no browser/screenshot capability was
  available in the session that built this) — recommended before merging, especially the new
  dynamic cards on `shop.html` and `accessories.html` at both desktop and mobile widths.

### Established workflow for this project — do not skip steps

**AUDIT → RECOMMEND → APPROVE → IMPLEMENT → TEST**, every time, for anything touching taxonomy,
templates, or CMS configuration. Every batch of work this session followed this exact sequence:
a read-only audit/report first, explicit approval from Troy/Vanessa, then implementation on a
dedicated branch, then a full validation pass, then a written report — never skipping ahead to
implementation without an explicit go-ahead, and never claiming something is "done" without
having actually run the validation. Continue this pattern.

### DO NOT BREAK — additions from this session

- **`sun-travel` Group's real URL is `sun-travel-essentials.html`, not a slug-derived
  `sun-travel.html`.** This is why the Group schema needed a real `permalink_path` field rather
  than assuming a naming convention — don't reintroduce a slug-based URL assumption for Groups.
- **The 4 pre-existing Groups (`accessories`, `apparel`, `sun-travel`, `holidays`) keep their
  own dedicated, hand-built templates** (`accessories.njk`, `apparel.njk`,
  `sun-travel-essentials.njk`, `holidays.njk`) — they are deliberately *not* migrated to the new
  generic `group-page.njk`, to avoid touching already-live, already-approved pages. Only new
  Groups going forward use the generic template.
- **The dynamic image-derivation algorithm is a strict single-path lookup, not a fallback
  search.** If the first Category's first Product has no image, the card is omitted — the
  system does not search further down the list for a product that happens to have one. This is
  intentional (it's what makes "change the #1 item to change the featured image" work
  predictably) — don't quietly change this to a more forgiving search without approval.
- **Do not retrofit the dynamic image mechanism onto the 4 existing Groups' own hub-card images**
  without explicit approval — this was a deliberate scope decision to avoid silently changing
  already-curated, already-live imagery on Apparel/Sun-Travel/Holidays's own top-level cards
  (only their taxonomy-driven *Shop hub* card became dynamic; their own internal category-card
  grids were left alone except for the one explicit Park Bags fix described above).

---

> **Everything below this point was written before the Eleventy + Sveltia CMS migration and
> describes an earlier, now-superseded static-HTML architecture.** Brand identity, voice,
> design-system colors/fonts, and historical incidents (e.g. the Remy incident) are still
> accurate and worth reading. Anything describing file structure, specific page counts, "no
> build step," or the CMS as a "future upgrade" is out of date — see the handoff section above
> and ARCHITECTURE.md for the current picture.

[PROJECT-CONTEXT.md](https://github.com/user-attachments/files/30876370/PROJECT-CONTEXT.md)
[PROJECT-CONTEXT.md](https://github.com/user-attachments/files/30864898/PROJECT-CONTEXT.md)
# PROJECT-CONTEXT.md — The Pixie Packed Family

> This document was generated by directly inspecting the live `sanorg24/Disney-Travel-Site`
> repository (cloned fresh) plus the full conversation history that produced it. Anything not
> directly verifiable from the repository is marked **[from conversation, unverified in code]**.
> Last generated: see CHANGELOG.md "Documentation generated" entry for the date.

## What this is

The Pixie Packed Family is a real, live Disney vacation planning and family travel content
brand, run by Vaness# PROJECT-CONTEXT.md — The Pixie Packed Family

> This document was generated by directly inspecting the live `sanorg24/Disney-Travel-Site`
> repository (cloned fresh) plus the full conversation history that produced it. Anything not
> directly verifiable from the repository is marked **[from conversation, unverified in code]**.
> Last generated: see CHANGELOG.md "Documentation generated" entry for the date.

## What this is

The Pixie Packed Family is a real, live Disney vacation planning and family travel content
brand, run by Vanessa (with her husband Troy and their kids) at **pixiepackedfamily.com**. It's
a static HTML affiliate/content site — not an app, not a CMS, no backend of its own. Revenue
comes from Amazon affiliate links, a small number of paid digital downloads (via Gumroad, not
built into the site itself), and (planned) an Etsy shop link and ad revenue.

**[from conversation]** The business goal is to grow from a $100 starting budget toward a real,
sustaining income, initially through affiliate content, then diversifying into digital products
and other revenue streams. Growing a social media following (TikTok, Instagram, Facebook,
YouTube) and funneling that traffic to the website is the current top priority.

## Brand identity — preserve exactly

- **Name:** The Pixie Packed Family (also written "Pixie Packed Family")
- **Tagline:** "Packing Magic. Creating Memories."
- **Voice:** warm, authentic, family-focused, magical but not corporate or oversales-y — like a
  trusted Disney-loving friend sharing real tips.
- **Founder story [from conversation, and present verbatim on the site's About/Our Story
  section]:** Vanessa is a mom of four, former culinary/baking instructor, now full-time
  caregiver to her son Seth (who has Down syndrome, autism, and retinal degeneration). The
  family moved from Ohio to a fifth-wheel camper, then to Kissimmee, FL, where husband Troy
  works for Disney. Their first Disney trip in 2023 is what started this business. This story is
  real, personal, and already live on the homepage — never rewrite or genericize it.
- **Legal/compliance line, present in every page footer, must stay:** "As an Amazon Associate,
  The Pixie Packed Family earns from qualifying purchases. This site is not affiliated with,
  endorsed by, or sponsored by The Walt Disney Company."

## Design system (verified identical across every page in the repo)

CSS custom properties, defined fresh in every file's own `<style>` block (no shared stylesheet —
see ARCHITECTURE.md):

```
--purple: #7b5fe0;  --magenta: #c23f97;  --coral: #e76e8c;  --orange: #eda268;
--maroon: #5c2a38;  --pink-bg: #fbe0ec;  --gold: #e8c468;   --cream: #fff8f3;
--gray: #7a6f78;    --ink: #3a2733;      --white: #ffffff;
```

Fonts: **Fredoka** (500/600/700) for headings, **Quicksand** (400–700) for body text, both
loaded from Google Fonts. Whimsical/pastel/magical feel, rounded corners, soft shadows, sparkle
accents (✦ ✧ ⋆). No copyrighted Disney character art anywhere — evoke the magic through
color/whimsy/language instead. This rule is followed consistently across the whole site.

## Site sections (verified from the live repo)

- **Homepage (`index.html`)** — hero, mission/about, family story, "Shop the Parks" category
  grid, "Downloadable Trip Guides" section, social follow section, Etsy teaser, email signup
  form (form has no real backend — see Known Limitations), footer.
- **Apparel** — hub page (`apparel.html`) linking to Family Tees, Men's, Women's, Kids subpages.
  Kids subpage is intentionally "coming soon" (real placeholder, verified in the file).
- **Accessories** — hub page (`accessories.html`) linking to 6 subpages: Hats, Ears &
  Headbands, Backpacks, Loungefly, Pandora, Footwear (Footwear has Men's/Women's subgroups).
- **Sun, Travel & Personal Care** — hub page linking to 4 subpages: Sunscreen, Hair Care,
  Cooling & Fans, Travel & Personal Care.
- **Holidays & Festivals** — hub page (`holidays.html`) currently linking to one live subpage,
  Family Halloween/MNSSHP.
- **Shop Disney Outfits** (`outfits.html`) — themed outfit inspiration, organized by category:
  Park Day Outfits (currently: Animal Kingdom Lion King, Her's and His, 5 Amazon links each),
  Disney Characters (Minnie-themed outfits), and Mickey's Not-So-Scary Halloween Party outfits.
- **Blog** (`blog.html` + individual `blog-[slug].html` pages) — filterable by 5 tags:
  `travel-tips`, `disney-news`, `amazon-finds`, `outfit-inspiration`, `family-accessibility`.
  Filtering is done client-side with plain JavaScript (see ARCHITECTURE.md).
- **Guides** (under `/guides/`) — one free (Park Day Packing Checklist) and one paid (Disney
  Vacation Planning Guide, $4, sold via Gumroad, delivered as a PDF — see Known Limitations for
  what's still placeholder here).

## Affiliate-link behavior (verified)

**Amazon Associates tag:** `thepixiepacke-20` **[from conversation]**

The overwhelming majority of Amazon product links (218 of 222, verified directly against the
repository on 2026-08-08) use **`amzn.to`** shortened links (Amazon's own link shortener, with
the affiliate tag embedded server-side) — this is the established, correct pattern; don't "fix"
these into full URLs. **Correction to an earlier version of this document, which stated 230 of
234:** a direct count against the live repository found 222 total Amazon product links, not
234 — the earlier figure was inaccurate. Re-verify with a fresh count if this matters for a
specific task, since new links are added frequently as content grows. `outfits.html`
specifically has 4 links written as full `https://www.amazon.com/dp/{ASIN}?tag=thepixiepacke-20`
URLs instead (2
distinct products: Halloween Minnie Ears, and the "On Cloud Shoes" link, which is intentionally
reused 3 times across different outfit entries since it's the same physical product **[from
conversation, verified consistent in the current repo]**). This inconsistency is real and
currently live, but not broken — both link formats work correctly as affiliate links. Worth
normalizing to `amzn.to` for consistency at some point, but not urgent.

Every affiliate link opens in the same tab currently (no `target="_blank"` on the `amzn.to`
links — note the 4 full-form links in `outfits.html` DO use `target="_blank"`, another small
inconsistency between the two formats). Don't change link-opening behavior without being asked.

## Design/branding rules that must be preserved

- The exact CSS variable palette and font pairing above, on every page, no exceptions.
- **No copyrighted Disney character artwork anywhere on the site — this was tested and
  explicitly rejected once already.** **[from conversation]** The original brand banner
  included Tinker Bell/fairy character artwork; this was specifically identified as a
  copyright/trademark risk on a commercial site and rejected. Only the banner's
  fireworks/sparkle background (with the character removed) was approved and is what's in use
  today (`photos/brand-banner.jpg`). Don't reintroduce licensed Disney character art in any
  future generated content, guide, or marketing image.
- **The real banner image is used directly as a plain `<img>`, never recreated with CSS, and
  never has text overlaid on top of it.** **[from conversation]** This was tried once (dynamic
  title text positioned over the banner) and caused a visible collision, since the banner's own
  baked-in text sits at an unpredictable position depending on crop height. Any new title/heading
  goes in a separate section below the image, not on top of it.
- **The Apparel page's "Men's" category must stay named "Men's" — do not rename it to
  "Unisex."** **[from conversation]** This was tried once and explicitly reversed by the owner.
  Note this is page-specific: the separate Holidays & Festivals page intentionally uses a
  different labeling convention (Unisex / Women's / Youth) — that convention applies only to
  Holidays, not Apparel.
- The Amazon Associate disclosure line in the footer of every page.
- The real family photos and story on the homepage — never replaced with stock/generic content.
- The `amzn.to` link format for Amazon products (with a known small exception — see
  Affiliate-link behavior above).
- Category hub pages linking out to focused subpages, rather than one giant page per category
  (this is the established, intentional pattern — see ARCHITECTURE.md for which categories have
  and haven't been split this way yet).
- Category/hub card icons use real product photos rather than emoji, site-wide — the one
  exception is where no product photo exists yet (currently: Apparel → Kids). **[from
  conversation]**

## Known limitations / things that are intentionally incomplete right now

Verified directly in the live HTML (search for `data-placeholder="true"`):

- **Festival Planning Guide ($7)** on the homepage — card exists, priced, marked "coming soon,"
  button is a non-functional placeholder (`href="#"`). No content has been written for this yet.
- **Etsy Shop link** — appears in the homepage header dropdown and footer, both still
  placeholders (`href="#"`). No Etsy integration exists yet.
- **Apparel → Kids subpage** — intentionally shows "Items coming soon" with no products yet.
- **Email signup form** on the homepage — plain HTML `<form>` with no `action`, no JS handler,
  and no backend. Currently decorative only; submitting it does nothing.
- **"Complete Packing List" page for the $4 Disney Vacation Planning Guide was never built.**
  **[from conversation, confirmed absent in the current guide content file]** The guide's 12
  built pages are Cover, Vacation Overview, Trip at a Glance, Outfit Planner, Travel Day, one
  page per park day (4), Park-Hopping Day, 4 Parks/1 Day, and Rest/Resort Day — there is no
  separate dedicated packing-list page, only a short "Pre-Packing List" field inside the
  Vacation Overview page. This was blocked on the owner providing a Canva reference design that
  was never sent.

## Known issues found during inspection (verified directly in the live repo)

- **Broken link:** `apparel.html` links to `apparel-family-tees.html`, but the actual file in
  the repo is named `apparel-family-tees.htm` (missing the final "l"). Clicking "Matching Family
  Tees" from the Apparel hub page currently 404s on the live site. This should be fixed by
  either renaming the file to `.html` or correcting the link — see CHANGELOG.md.
- **Stale footer label:** `outfits.html` was renamed from "Themed Outfit Inspiration" to "Shop
  Disney Outfits" (both the page's own heading and its homepage card), but the footer link text
  pointing to it on other pages still says **"Themed Outfits"**. **Correction to an earlier
  version of this document, which said "19 other pages":** a direct count against the live
  repository (2026-08-08) found the old label on **22 pages** — 20 top-level `.html` pages, plus
  `apparel-family-tees.htm`, plus `guides/disney-vacation-planning-guide.html`. The link itself
  still works (correct `href="outfits.html"`) on all of these; this is a label-only
  inconsistency, not a broken link. Separately, **5 pages have no footer outfits-nav link at
  all, in either the old or new wording** — the 3 blog post pages
  (`blog-welcome-to-the-blog.html`,
  `blog-why-good-shoes-can-make-or-break-your-disney-vacation-for-ev.html`,
  `blog-6-ways-our-disney-loving-family-actually-saves-money-at-walt.html`) and 2 guide pages
  (`guides/disney-vacation-planning-guide-content.html` and
  `guides/park-day-packing-checklist.html`) use a different footer/page structure without that
  nav link. This isn't part of the stale-label inconsistency — it's a structural difference
  worth knowing about if someone standardizes footers later. Low priority, but a quick fix once
  someone's editing footers anyway.

## Known past incident — for context, not currently a problem

**[verified in git history]** On 2026-08-03, an autonomous AI agent ("Remy," a separate system —
see ARCHITECTURE.md) misinterpreted an approval and overwrote `index.html` with its own
self-branded placeholder version ("Remy's Magic Totes"). This was caught and reverted the same
day (commit `7659745`, "Restore homepage - revert unauthorized rewrite"). Branch protection on
`main` requiring pull-request review was put in place afterward specifically to prevent this
from being able to happen again without a human reviewing the diff first. This is resolved and
is not an active issue, but it's why the PR-based publishing workflow described in
ARCHITECTURE.md exists and must not be relaxed.

## Development priorities, in the order they've come up

1. ~~Build out remaining apparel/accessories/outfit categories with real Amazon links~~ (ongoing,
   most categories now have substantial real content)
2. ~~Get the $4 Disney Vacation Planning Guide fully sellable~~ (done — real Gumroad checkout is
   live and linked)
3. Fix the broken Family Tees link (see above)
4. Write and price the Festival Planning Guide ($7) — currently just a placeholder card
5. Add real Etsy shop link once available
6. Add real content to the Apparel → Kids subpage
7. **[from conversation]** Next major planned upgrade: separate website content from website
   code with a browser-based admin/content-management system, so Vanessa (non-technical) can
   manage products, images, blog posts, guides, and affiliate links without manually editing
   files in GitHub. **Status as of this writing: in progress, local prototype through
   Checkpoint 3, not yet connected to production.** See "CMS Usability Requirements" below for
   what Vanessa needs from it, and ARCHITECTURE.md's "CMS Content Architecture" /
   CHANGELOG.md's "CMS Upgrade — Checkpoint History" for the full technical status and two
   currently-unresolved issues blocking Checkpoint 4.

## CMS Usability Requirements (from human usability testing, Checkpoints 2–3)

**[from conversation]** Requirements and results gathered directly from Vanessa (and Troy)
actually using the local CMS prototype, not just from planning conversations:

- **Creating a Collection: PASS, easy.** **Adding a Product: PASS, easy.** **Overall CMS
  usability: PASS.** The core workflow — logging in, adding a Collection, adding a Product —
  made sense to Vanessa without technical/GitHub/Markdown knowledge.
- **Vanessa wants to be able to create new Collections and Categories herself, without code**,
  as a durable requirement, not a nice-to-have. The CMS architecture (see ARCHITECTURE.md) was
  deliberately built around this from the start — Collections/Categories are modeled as data,
  not hard-coded pages — specifically so this stays possible without another redesign later.
- **The CMS needs to genuinely support curated "Look" content** like "Minnie in Pink" — one
  collage/inspiration image plus multiple individual affiliate products, kept conceptually
  distinct from a plain single-product listing (see ARCHITECTURE.md, Type A vs. Type B
  Categories). This isn't just a technical modeling choice — it reflects how Vanessa actually
  thinks about her own content.
- **Future blog/content workflow should support an optional personal photo and, preferably, a
  responsive embedded short video** (not an uploaded video file) on Look/blog-style entries.
  Scope for the video piece has been deliberately limited for now to YouTube and Vimeo only
  (Instagram/TikTok/Facebook embeds are less consistent and need their own research pass before
  being promised) — not yet built, but the requirement is real and durable.
- **The Product Library must be visually scannable — this is an important usability
  requirement, not a cosmetic one.** Vanessa's own framing: with 20 luggage sets in the
  library, she needs to recognize the red one vs. the green one visually, not by opening or
  reading every product's title. **Achieved and human-verified by the close of Checkpoint 3** —
  see ARCHITECTURE.md for the full root-cause history (a media path convention mismatch, and a
  `type="module"` script-tag issue) and the final confirmed set of working image-import
  workflows (existing/migrated images, Amazon-copy-paste, local file drag-and-drop, no-image
  Products, and stock photo selection all PASS; only dragging directly off a webpage/browser tab
  is unsupported, and that's explicitly not a workflow Vanessa needs).
- **Looks within a Category need a simple, understandable way to control display order.**
  Achieved via a plain "Display Position" number field (not Sveltia's native drag-and-drop
  reorder, which didn't work reliably in testing) — see ARCHITECTURE.md for the full ordering
  approach, including the spaced-integer (10, 20, 30…) convention Vanessa preferred over
  decimal positions.
a (with her husband Troy and their kids) at **pixiepackedfamily.com**. It's
a static HTML affiliate/content site — not an app, not a CMS, no backend of its own. Revenue
comes from Amazon affiliate links, a small number of paid digital downloads (via Gumroad, not
built into the site itself), and (planned) an Etsy shop link and ad revenue.

**[from conversation]** The business goal is to grow from a $100 starting budget toward a real,
sustaining income, initially through affiliate content, then diversifying into digital products
and other revenue streams. Growing a social media following (TikTok, Instagram, Facebook,
YouTube) and funneling that traffic to the website is the current top priority.

## Brand identity — preserve exactly

- **Name:** The Pixie Packed Family (also written "Pixie Packed Family")
- **Tagline:** "Packing Magic. Creating Memories."
- **Voice:** warm, authentic, family-focused, magical but not corporate or oversales-y — like a
  trusted Disney-loving friend sharing real tips.
- **Founder story [from conversation, and present verbatim on the site's About/Our Story
  section]:** Vanessa is a mom of four, former culinary/baking instructor, now full-time
  caregiver to her son Seth (who has Down syndrome, autism, and retinal degeneration). The
  family moved from Ohio to a fifth-wheel camper, then to Kissimmee, FL, where husband Troy
  works for Disney. Their first Disney trip in 2023 is what started this business. This story is
  real, personal, and already live on the homepage — never rewrite or genericize it.
- **Legal/compliance line, present in every page footer, must stay:** "As an Amazon Associate,
  The Pixie Packed Family earns from qualifying purchases. This site is not affiliated with,
  endorsed by, or sponsored by The Walt Disney Company."

## Design system (verified identical across every page in the repo)

CSS custom properties, defined fresh in every file's own `<style>` block (no shared stylesheet —
see ARCHITECTURE.md):

```
--purple: #7b5fe0;  --magenta: #c23f97;  --coral: #e76e8c;  --orange: #eda268;
--maroon: #5c2a38;  --pink-bg: #fbe0ec;  --gold: #e8c468;   --cream: #fff8f3;
--gray: #7a6f78;    --ink: #3a2733;      --white: #ffffff;
```

Fonts: **Fredoka** (500/600/700) for headings, **Quicksand** (400–700) for body text, both
loaded from Google Fonts. Whimsical/pastel/magical feel, rounded corners, soft shadows, sparkle
accents (✦ ✧ ⋆). No copyrighted Disney character art anywhere — evoke the magic through
color/whimsy/language instead. This rule is followed consistently across the whole site.

## Site sections (verified from the live repo)

- **Homepage (`index.html`)** — hero, mission/about, family story, "Shop the Parks" category
  grid, "Downloadable Trip Guides" section, social follow section, Etsy teaser, email signup
  form (form has no real backend — see Known Limitations), footer.
- **Apparel** — hub page (`apparel.html`) linking to Family Tees, Men's, Women's, Kids subpages.
  Kids subpage is intentionally "coming soon" (real placeholder, verified in the file).
- **Accessories** — hub page (`accessories.html`) linking to 6 subpages: Hats, Ears &
  Headbands, Backpacks, Loungefly, Pandora, Footwear (Footwear has Men's/Women's subgroups).
- **Sun, Travel & Personal Care** — hub page linking to 4 subpages: Sunscreen, Hair Care,
  Cooling & Fans, Travel & Personal Care.
- **Holidays & Festivals** — hub page (`holidays.html`) currently linking to one live subpage,
  Family Halloween/MNSSHP.
- **Shop Disney Outfits** (`outfits.html`) — themed outfit inspiration, organized by category:
  Park Day Outfits (currently: Animal Kingdom Lion King, Her's and His, 5 Amazon links each),
  Disney Characters (Minnie-themed outfits), and Mickey's Not-So-Scary Halloween Party outfits.
- **Blog** (`blog.html` + individual `blog-[slug].html` pages) — filterable by 5 tags:
  `travel-tips`, `disney-news`, `amazon-finds`, `outfit-inspiration`, `family-accessibility`.
  Filtering is done client-side with plain JavaScript (see ARCHITECTURE.md).
- **Guides** (under `/guides/`) — one free (Park Day Packing Checklist) and one paid (Disney
  Vacation Planning Guide, $4, sold via Gumroad, delivered as a PDF — see Known Limitations for
  what's still placeholder here).

## Affiliate-link behavior (verified)

**Amazon Associates tag:** `thepixiepacke-20` **[from conversation]**

The overwhelming majority of Amazon product links (218 of 222, verified directly against the
repository on 2026-08-08) use **`amzn.to`** shortened links (Amazon's own link shortener, with
the affiliate tag embedded server-side) — this is the established, correct pattern; don't "fix"
these into full URLs. **Correction to an earlier version of this document, which stated 230 of
234:** a direct count against the live repository found 222 total Amazon product links, not
234 — the earlier figure was inaccurate. Re-verify with a fresh count if this matters for a
specific task, since new links are added frequently as content grows. `outfits.html`
specifically has 4 links written as full `https://www.amazon.com/dp/{ASIN}?tag=thepixiepacke-20`
URLs instead (2
distinct products: Halloween Minnie Ears, and the "On Cloud Shoes" link, which is intentionally
reused 3 times across different outfit entries since it's the same physical product **[from
conversation, verified consistent in the current repo]**). This inconsistency is real and
currently live, but not broken — both link formats work correctly as affiliate links. Worth
normalizing to `amzn.to` for consistency at some point, but not urgent.

Every affiliate link opens in the same tab currently (no `target="_blank"` on the `amzn.to`
links — note the 4 full-form links in `outfits.html` DO use `target="_blank"`, another small
inconsistency between the two formats). Don't change link-opening behavior without being asked.

## Design/branding rules that must be preserved

- The exact CSS variable palette and font pairing above, on every page, no exceptions.
- **No copyrighted Disney character artwork anywhere on the site — this was tested and
  explicitly rejected once already.** **[from conversation]** The original brand banner
  included Tinker Bell/fairy character artwork; this was specifically identified as a
  copyright/trademark risk on a commercial site and rejected. Only the banner's
  fireworks/sparkle background (with the character removed) was approved and is what's in use
  today (`photos/brand-banner.jpg`). Don't reintroduce licensed Disney character art in any
  future generated content, guide, or marketing image.
- **The real banner image is used directly as a plain `<img>`, never recreated with CSS, and
  never has text overlaid on top of it.** **[from conversation]** This was tried once (dynamic
  title text positioned over the banner) and caused a visible collision, since the banner's own
  baked-in text sits at an unpredictable position depending on crop height. Any new title/heading
  goes in a separate section below the image, not on top of it.
- **The Apparel page's "Men's" category must stay named "Men's" — do not rename it to
  "Unisex."** **[from conversation]** This was tried once and explicitly reversed by the owner.
  Note this is page-specific: the separate Holidays & Festivals page intentionally uses a
  different labeling convention (Unisex / Women's / Youth) — that convention applies only to
  Holidays, not Apparel.
- The Amazon Associate disclosure line in the footer of every page.
- The real family photos and story on the homepage — never replaced with stock/generic content.
- The `amzn.to` link format for Amazon products (with a known small exception — see
  Affiliate-link behavior above).
- Category hub pages linking out to focused subpages, rather than one giant page per category
  (this is the established, intentional pattern — see ARCHITECTURE.md for which categories have
  and haven't been split this way yet).
- Category/hub card icons use real product photos rather than emoji, site-wide — the one
  exception is where no product photo exists yet (currently: Apparel → Kids). **[from
  conversation]**

## Known limitations / things that are intentionally incomplete right now

Verified directly in the live HTML (search for `data-placeholder="true"`):

- **Festival Planning Guide ($7)** on the homepage — card exists, priced, marked "coming soon,"
  button is a non-functional placeholder (`href="#"`). No content has been written for this yet.
- **Etsy Shop link** — appears in the homepage header dropdown and footer, both still
  placeholders (`href="#"`). No Etsy integration exists yet.
- **Apparel → Kids subpage** — intentionally shows "Items coming soon" with no products yet.
- **Email signup form** on the homepage — plain HTML `<form>` with no `action`, no JS handler,
  and no backend. Currently decorative only; submitting it does nothing.
- **"Complete Packing List" page for the $4 Disney Vacation Planning Guide was never built.**
  **[from conversation, confirmed absent in the current guide content file]** The guide's 12
  built pages are Cover, Vacation Overview, Trip at a Glance, Outfit Planner, Travel Day, one
  page per park day (4), Park-Hopping Day, 4 Parks/1 Day, and Rest/Resort Day — there is no
  separate dedicated packing-list page, only a short "Pre-Packing List" field inside the
  Vacation Overview page. This was blocked on the owner providing a Canva reference design that
  was never sent.

## Known issues found during inspection (verified directly in the live repo)

- **Broken link:** `apparel.html` links to `apparel-family-tees.html`, but the actual file in
  the repo is named `apparel-family-tees.htm` (missing the final "l"). Clicking "Matching Family
  Tees" from the Apparel hub page currently 404s on the live site. This should be fixed by
  either renaming the file to `.html` or correcting the link — see CHANGELOG.md.
- **Stale footer label:** `outfits.html` was renamed from "Themed Outfit Inspiration" to "Shop
  Disney Outfits" (both the page's own heading and its homepage card), but the footer link text
  pointing to it on other pages still says **"Themed Outfits"**. **Correction to an earlier
  version of this document, which said "19 other pages":** a direct count against the live
  repository (2026-08-08) found the old label on **22 pages** — 20 top-level `.html` pages, plus
  `apparel-family-tees.htm`, plus `guides/disney-vacation-planning-guide.html`. The link itself
  still works (correct `href="outfits.html"`) on all of these; this is a label-only
  inconsistency, not a broken link. Separately, **5 pages have no footer outfits-nav link at
  all, in either the old or new wording** — the 3 blog post pages
  (`blog-welcome-to-the-blog.html`,
  `blog-why-good-shoes-can-make-or-break-your-disney-vacation-for-ev.html`,
  `blog-6-ways-our-disney-loving-family-actually-saves-money-at-walt.html`) and 2 guide pages
  (`guides/disney-vacation-planning-guide-content.html` and
  `guides/park-day-packing-checklist.html`) use a different footer/page structure without that
  nav link. This isn't part of the stale-label inconsistency — it's a structural difference
  worth knowing about if someone standardizes footers later. Low priority, but a quick fix once
  someone's editing footers anyway.

## Known past incident — for context, not currently a problem

**[verified in git history]** On 2026-08-03, an autonomous AI agent ("Remy," a separate system —
see ARCHITECTURE.md) misinterpreted an approval and overwrote `index.html` with its own
self-branded placeholder version ("Remy's Magic Totes"). This was caught and reverted the same
day (commit `7659745`, "Restore homepage - revert unauthorized rewrite"). Branch protection on
`main` requiring pull-request review was put in place afterward specifically to prevent this
from being able to happen again without a human reviewing the diff first. This is resolved and
is not an active issue, but it's why the PR-based publishing workflow described in
ARCHITECTURE.md exists and must not be relaxed.

## Development priorities, in the order they've come up

1. ~~Build out remaining apparel/accessories/outfit categories with real Amazon links~~ (ongoing,
   most categories now have substantial real content)
2. ~~Get the $4 Disney Vacation Planning Guide fully sellable~~ (done — real Gumroad checkout is
   live and linked)
3. Fix the broken Family Tees link (see above)
4. Write and price the Festival Planning Guide ($7) — currently just a placeholder card
5. Add real Etsy shop link once available
6. Add real content to the Apparel → Kids subpage
7. **[from conversation]** Next major planned upgrade: separate website content from website
   code with a browser-based admin/content-management system, so Vanessa (non-technical) can
   manage products, images, blog posts, guides, and affiliate links without manually editing
   files in GitHub. See NEXT PLANNED UPGRADE in ARCHITECTURE.md for the full framing of this.
