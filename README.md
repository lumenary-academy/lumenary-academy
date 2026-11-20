# Lumenary Academy

This repository holds the website at [lumenary.academy](https://lumenary.academy): the front page of Lumenary Academy, an education project in three divisions. Each division has its own site, built from its own repository:

| Division | What it is | Site | Repository |
| --- | --- | --- | --- |
| Lumenary Scientia | The sciences, free and open source | [scientia.lumenary.academy](https://scientia.lumenary.academy) | [lumenary-academy/lumenary-scientia](https://github.com/lumenary-academy/lumenary-scientia) |
| Lumenary Lingua | Languages, each taught through one the learner knows; free and open source | [lingua.lumenary.academy](https://lingua.lumenary.academy) | [lumenary-academy/lumenary-lingua](https://github.com/lumenary-academy/lumenary-lingua) |
| Lumenary Prep | Exam preparation, a paid service with free sample lessons | [prep.lumenary.academy](https://prep.lumenary.academy) | private |

This site is small. It has a front page listing the three divisions, Scientia's subjects, and sample lessons from all three divisions. It also has the academy's own About, Divisions and Contribute pages. Every link to a division goes to that division's site; the addresses are kept once, in `src/lib/links.ts`.

## Running it locally

Requirements: Node 22 or later (CI uses Node 24).

```bash
git clone https://github.com/lumenary-academy/lumenary-academy.git
cd lumenary-academy
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm test             # front page, links, pinned data, i18n, routes, redirects
npm run build        # static export to out/
npm start            # serve out/ at http://localhost:4173
```

## Pages

The site is a static export in the six interface languages (`en`, `es`, `ar`, `hi`, `sw`, `zh-Hans`): 24 pages, plus the language-picking root and the 404 page.

| Address | Page |
| --- | --- |
| `/` | Picks a language: a remembered choice, else the browser's preferences, else English |
| `/<locale>/` | The front page: the three divisions, Scientia's subjects with lessons to try, Lingua's and Prep's sample lessons |
| `/<locale>/about/` | About Lumenary Academy (`content/pages/about/en.mdx`) |
| `/<locale>/divisions/` | The three divisions (`content/pages/divisions/en.mdx`) |
| `/<locale>/contribute/` | How to help each division (`content/pages/contribute/en.mdx`) |
| `/sitemap.xml`, `/robots.txt` | On `https://lumenary.academy` |

The three prose pages are written in English. In every other locale they are shown in English, with the core's notice saying so and linking to the Contribute page.

## Structure

```
content/pages/<slug>/en.mdx       About, Divisions, Contribute (English; shown in every locale)
src/app/(root)/                   / : picks a language
src/app/[locale]/layout.tsx       the header, footer and fonts for every page
src/app/[locale]/page.tsx         /<locale>/ : the front page
src/app/[locale]/{about,divisions,contribute}/   the prose pages, rendered by the core's ProsePage
src/app/[locale]/not-found.tsx    the not-found message in the reader's language
src/app/global-not-found.tsx      404.html, for any address that matches no page
src/app/sitemap.ts                /sitemap.xml
src/components/AcademyHeader.tsx  the header (see below)
src/lib/links.ts                  SCIENTIA_URL, LINGUA_URL, PREP_URL, this site's URL, repositories and licences
src/lib/subjects.ts               Scientia's subjects and sample lessons, pinned, and Scientia's routing
src/lib/samples.ts                Lingua's and Prep's sample lessons, pinned
src/lib/nav.ts                    the header's and footer's links
src/lib/site.ts                   the site put together from @lumenary/core: strings, prose pages, routing
src/i18n/messages/<locale>.json   the site's own interface strings
vercel.json                       redirects from the old addresses of lumenary.academy
tests/                            vitest suites
```

### Pinned data

Scientia's, Lingua's and Prep's content lives in their repositories, so this site cannot read it. The front page's data is pinned instead. `src/lib/subjects.ts` copies Scientia's subject list, order and sample lessons from its `src/lib/subjects.ts`, and the lesson titles from the lessons themselves. `src/lib/samples.ts` copies Lingua's and Prep's samples. The data dates from 19 November 2026. `tests/subjects.test.ts` checks that the data is consistent, but it cannot check it against the other repositories. When Scientia opens a subject or retitles a sample lesson, update the pinned data here. The front page does not show lesson counts, because a pinned count would go out of date without any test noticing.

Scientia's course pages (Chemistry, CS and the rest) exist only in English, so the front page links them at `/en/…`. Lumenary Math's front page and the lessons translated into the reader's language are linked in that language. `Collections`, Math's first lesson, exists in all six languages. All other sample lessons are linked in English. `scientiaRouting` in `src/lib/subjects.ts` describes this with the core's `createRouting`.

## How it uses @lumenary/core

The site is built on [@lumenary/core](https://github.com/lumenary-academy/lumenary-core) in the same way as [lumenary-lingua](https://github.com/lumenary-academy/lumenary-lingua). The core is installed from its release tarball (`v0.1.0`, see `package.json`):

- **Design and chrome**: `@lumenary/core/styles.css` and `/fonts`. `LogoMark`, `Wordmark` (division "Academy"), `LanguageSelector`, `ThemeToggle` and `SiteFooter` come from `/site` and `/brand`. `RootLocalePage` provides `/`.
- **The header**: in v0.1.0, the core's `SiteHeader` can only link pages of the same site. This header must also link the three divisions' sites, marked ↗. `src/components/AcademyHeader.tsx` therefore assembles the header from the core's pieces, using the markup and classes of the core's `SiteHeader`. If a later core release lets `SiteHeader` take external links, replace this file with it.
- **Languages**: the six locales and the shared interface strings come from `/i18n`. `src/lib/site.ts` lays the site's own strings over them with `createI18n`.
- **Prose pages**: `createPageLoader` and `ProsePage` from `/pages`, with English fallback.

`next.config.ts` lists the core in `transpilePackages` and, while it is linked from a sibling checkout (`"file:../lumenary-core"`), lets Turbopack read it. To update the core, change the tarball's tag in `package.json` and run `npm install`.

## Redirects

Until this site, lumenary.academy served Lumenary Scientia and, before that, Lumenary Lingua. `vercel.json` sends their old addresses on, all with permanent (308) redirects:

1. `www.lumenary.academy/<path>` → `https://lumenary.academy/<path>`.
2. `/<locale>/lingua/…` → Lingua's site. These are the three rules of the former main site, unchanged.
3. `/<locale>/<segment>` and `/<locale>/<segment>/<rest>` → `https://scientia.lumenary.academy/<locale>/<segment>/<rest>`. This applies to every top-level page Scientia serves: `math`, `cs`, `ee`, `robotics`, `chemistry`, `me`, `materials`, `statistics`, `lab`, `formal`, `practice`, `progress`, `educators`, `verification` and `languages`.

The front page and the About, Divisions and Contribute pages stay on this site. `tests/redirects.test.ts` compiles the rules with `@vercel/routing-utils` (the copy bundled in Next.js). It then tries them against old Math, CS, EE and lesson addresses, the Lingua addresses, this site's own pages, an unknown locale and the www host.

## Translations needing native review

Every non-English interface string is an unreviewed machine draft. Most were copied unchanged from the main Lumenary site's catalogues (now Lumenary Scientia's `src/i18n/messages`): the navigation, the division and subject names and blurbs, "Try a lesson", the Prep sample notes and "Project". The following strings are new to this site and have had no review at all. Please check them in `src/i18n/messages/{es,ar,hi,sw,zh-Hans}.json`:

- `academy.visitScientia` ("Visit Lumenary Scientia"): written for this site from the existing translation of "Visit Lumenary Prep" (`divisions.prepCta`), with the division's name changed.
- `academy.notFound.title`, `academy.notFound.text` (the not-found message): copied from Lumenary Lingua's `lingua.notFound.*`, which are also awaiting review there.

The 404 page and the language-picking root page are in English, because they cannot know the reader's language. They link to every locale's front page by its own name. The prose pages in `content/pages` are in English only.

## Licences

- Code (the website, scripts, tests, and the interface strings in `src/i18n/messages`, which are part of the software): [Apache-2.0](LICENSE).
- Content (the page text in `content/pages`): [CC BY-SA 4.0](LICENSE-CONTENT).

Lumenary Academy is an independent project. No institutional endorsement is implied.
