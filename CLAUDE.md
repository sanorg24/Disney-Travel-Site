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
