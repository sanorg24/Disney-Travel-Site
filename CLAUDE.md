[CLAUDE.md](https://github.com/user-attachments/files/30876328/CLAUDE.md)
# CLAUDE.md

This repository is the production codebase for The Pixie Packed Family.

Before making changes:

- Read `PROJECT-CONTEXT.md`, `ARCHITECTURE.md`, and `CHANGELOG.md`.
- Inspect the current repository and treat the current codebase as the source of truth for what
  is actually implemented.
- Do not assume prior chat context is complete or current.
- Do not redesign the site unless explicitly requested.
- Preserve current branding, navigation, URLs, affiliate behavior, SEO structure, and existing
  working functionality.
- Do not make destructive changes without explaining the risk first.
- Prefer small, reversib# CLAUDE.md

This repository is the production codebase for The Pixie Packed Family.

Before making changes:

- Read `PROJECT-CONTEXT.md`, `ARCHITECTURE.md`, and `CHANGELOG.md`.
- Inspect the current repository and treat the current codebase as the source of truth for what
  is actually implemented.
- Do not assume prior chat context is complete or current.
- Do not redesign the site unless explicitly requested.
- Preserve current branding, navigation, URLs, affiliate behavior, SEO structure, and existing
  working functionality.
- Do not make destructive changes without explaining the risk first.
- Prefer small, reversible changes over large rewrites.
- Do not deploy or modify production automatically unless specifically instructed.
- When adding new functionality, preserve backward compatibility where practical.
- If an existing URL must change, create a redirect rather than breaking links.
- Keep secrets out of source code and client-side files. Use environment variables.
- Before finishing a significant development session, update the relevant project documentation
  and `CHANGELOG.md`.
- If documentation conflicts with current code, report the discrepancy rather than silently
  changing the code.
- AI-generated content or code changes should be treated as drafts until verified.

Current major priority: build a secure browser-based admin/content-management system so a
non-technical user can manage products, images, blog posts, guides, downloads, and affiliate
links without manually editing GitHub or redeploying the website.

## CMS upgrade — standing rules (in progress as of Checkpoint 3)

See CHANGELOG.md "CMS Upgrade — Checkpoint History" for full status, ARCHITECTURE.md "CMS
Content Architecture" for the data model, and PROJECT-CONTEXT.md "CMS Usability Requirements"
for what Vanessa actually needs from this. All CMS work so far is a local-only prototype — read
these before continuing, don't rely on any single prior chat's memory.

- **Do not proceed to Checkpoint 4 (production connection) until the unresolved issues listed in
  ARCHITECTURE.md are addressed and Vanessa has explicitly approved.** As of Checkpoint 3, two
  things are open: the Category↔Look relationship-sync bug, and the Product Library thumbnail
  issue (see ARCHITECTURE.md for both).
- **If a fix doesn't work, don't stack workarounds on top of it — stop and investigate the actual
  cause first.** This happened once already: an explicit `thumbnail: image` config change,
  correctly applied per Sveltia's own documentation, did not resolve the real observed browser
  behavior. The next step is investigating Sveltia's specific version/behavior, not adding
  further config guesses.
- **Local CMS test packages must never contain real GitHub credentials, OAuth config, or the
  real repo name.** Every local test package so far uses a placeholder repo name and has no
  `base_url`/`auth_endpoint` configured, specifically so a "Login with GitHub" click cannot
  reach production even by accident. Preserve this pattern for any future local package.
- **When testing successive local CMS packages, use a fresh port each time.** Chrome's File
  System Access API can silently reuse a previously-granted folder handle at the same `localhost`
  origin, causing a new package to appear to load (config fetches fine over HTTP) while actually
  reading stale content from the old package's folder. This already caused one full debugging
  cycle before the cause was found — see CHANGELOG.md.
- **No production, GitHub Pages settings, GitHub Actions, OAuth, or Remy changes may happen as
  part of CMS prototype work** unless a checkpoint explicitly authorizes it. Through Checkpoint
  3, none of these have been touched — production is running exactly as described elsewhere in
  this file, unaffected by any of the CMS work.
le changes over large rewrites.
- Do not deploy or modify production automatically unless specifically instructed.
- When adding new functionality, preserve backward compatibility where practical.
- If an existing URL must change, create a redirect rather than breaking links.
- Keep secrets out of source code and client-side files. Use environment variables.
- Before finishing a significant development session, update the relevant project documentation
  and `CHANGELOG.md`.
- If documentation conflicts with current code, report the discrepancy rather than silently
  changing the code.
- AI-generated content or code changes should be treated as drafts until verified.

Current major priority: build a secure browser-based admin/content-management system so a
non-technical user can manage products, images, blog posts, guides, downloads, and affiliate
links without manually editing GitHub or redeploying the website.
