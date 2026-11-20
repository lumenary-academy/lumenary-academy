<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## This repository

Lumenary Academy's front page (lumenary.academy), a small static Next.js site: the three divisions, Lumenary Scientia's subjects with lessons to try, and the academy's About, Divisions and Contribute pages. Shared code (design system, mark and wordmark, footer, language menu, theme switch, i18n, prose pages) lives in `@lumenary/core` (github.com/lumenary-academy/lumenary-core); change it there, not by copying it here. The README describes the layout.

- The brand is "Lumenary Academy", never "The Lumenary"; the divisions are "Lumenary Scientia", "Lumenary Lingua" and "Lumenary Prep". Describe Prep plainly as a paid service with free samples.
- The divisions' content lives in their own repositories. Their addresses are in `src/lib/links.ts`; the subjects and sample lessons are pinned in `src/lib/subjects.ts` and `src/lib/samples.ts`. Every link to a division is absolute.
- Interface strings go in all six `src/i18n/messages/*.json`; never redefine a key `@lumenary/core` already has.
- `vercel.json` redirects the old Scientia and Lingua addresses of lumenary.academy; `tests/redirects.test.ts` checks them.
- Before a pull request: `npm run typecheck`, `npm test`, `npm run build`.
