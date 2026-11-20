/**
 * The rest of the site: the sitemap, the header's and footer's links, and the prose pages (About,
 * Divisions, Contribute), which render in every locale and link the divisions' sites correctly.
 */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LOCALES, makeT, type Locale } from "@lumenary/core/i18n";
import { PageFrontmatter } from "@lumenary/core/schema";
import sitemap from "@/app/sitemap";
import AboutPage from "@/app/[locale]/about/page";
import DivisionsPage from "@/app/[locale]/divisions/page";
import ContributePage from "@/app/[locale]/contribute/page";
import { PAGE_SLUGS, i18n, pages } from "@/lib/site";
import { footerColumns, headerNav } from "@/lib/nav";
import { CODE_LICENCE_URL, CONTENT_LICENCE_URL, SOURCE_URL } from "@/lib/links";
import { divisionLinkProblem, fm, hrefs, read, strayRelative } from "./helpers";

const DIVISION_SITE = /^https:\/\/(scientia|lingua|prep)\.lumenary\.academy/;
const REPOS = ["lumenary-academy", "lumenary-scientia", "lumenary-lingua", "lumenary-core"].map((r) => `https://github.com/lumenary-academy/${r}`);

describe("the sitemap", () => {
  const urls = sitemap().map((u) => u.url);
  it("lists the front page and the three prose pages in every locale, once each, on lumenary.academy", () => {
    expect(urls).toHaveLength(LOCALES.length * 4);
    expect(new Set(urls).size).toBe(urls.length);
    for (const u of urls) expect(u).toMatch(/^https:\/\/lumenary\.academy\/(en|es|ar|hi|sw|zh-Hans)\/((about|divisions|contribute)\/)?$/);
    expect(urls).toContain("https://lumenary.academy/zh-Hans/contribute/");
  });
});

describe("the header and footer", () => {
  it.each(LOCALES)("link the divisions' sites, then About, Divisions and Contribute (%s)", (locale) => {
    const nav = headerNav(locale);
    expect(nav.map((n) => n.key)).toEqual(["scientia", "lingua", "prep", "about", "divisions", "contribute"]);
    expect(nav.map((n) => n.href)).toEqual([
      `https://scientia.lumenary.academy/${locale}/`,
      `https://lingua.lumenary.academy/${locale}/`,
      "https://prep.lumenary.academy",
      `/${locale}/about/`,
      `/${locale}/divisions/`,
      `/${locale}/contribute/`,
    ]);
    for (const n of nav) expect(n.external === true, n.key).toBe(DIVISION_SITE.test(n.href));
  });

  it.each(LOCALES)("footer: the divisions, the project pages, the source and its licences (%s)", async (locale) => {
    const t = makeT(await i18n.getMessages(locale));
    const [divisions, project, open] = footerColumns(locale, t);
    expect(divisions!.title).toBe("Lumenary Academy");
    expect(divisions!.links.map((l) => l.label)).toEqual(["Lumenary Scientia", "Lumenary Lingua", "Lumenary Prep"]);
    for (const l of divisions!.links) expect(divisionLinkProblem(l.href), l.href).toBeNull();
    expect(project!.links.map((l) => l.href)).toEqual(["about", "divisions", "contribute"].map((p) => `/${locale}/${p}/`));
    expect(open!.links.map((l) => l.href)).toEqual([SOURCE_URL, CODE_LICENCE_URL, CONTENT_LICENCE_URL]);
    expect(SOURCE_URL).toBe("https://github.com/lumenary-academy/lumenary-academy");
  });

  it("points the licence links at files this repository has", () => {
    expect(read("LICENSE")).toContain("Apache License");
    expect(read("LICENSE-CONTENT")).toContain("Attribution-ShareAlike 4.0");
    expect(CODE_LICENCE_URL.endsWith("/LICENSE")).toBe(true);
    expect(CONTENT_LICENCE_URL.endsWith("/LICENSE-CONTENT")).toBe(true);
  });
});

/** A prose page rendered as the export would: its route element, then the core's async ProsePage inside it. */
async function renderProse(Page: (p: { params: Promise<{ locale: string }> }) => Promise<React.ReactElement>, locale: Locale): Promise<string> {
  const element = (await Page({ params: Promise.resolve({ locale }) })) as React.ReactElement<Record<string, unknown>>;
  const render = element.type as (props: Record<string, unknown>) => Promise<React.ReactElement>;
  return renderToStaticMarkup(await render(element.props));
}
const ROUTES = { about: AboutPage, divisions: DivisionsPage, contribute: ContributePage } as const;

describe("the prose pages", () => {
  it.each(PAGE_SLUGS)("%s has an English page with a title and lead, and no translations yet", (slug) => {
    const { data } = fm(`content/pages/${slug}/en.mdx`);
    const page = PageFrontmatter.parse(data);
    expect(page.title.length).toBeGreaterThan(0);
    expect(page.lead.length).toBeGreaterThan(20);
    expect(pages.getPage(slug, "es")).toMatchObject({ locale: "en", fallback: true });
  });

  describe.each(PAGE_SLUGS)("%s", (slug) => {
    it.each(LOCALES)("renders in %s, in English with a notice outside English", async (locale) => {
      const html = await renderProse(ROUTES[slug], locale);
      const t = makeT(await i18n.getMessages(locale));
      expect(html).toContain(`<div class="prose-ui mt-2" lang="en" dir="ltr">`);
      expect(html.includes(t("language.helpTranslate"))).toBe(locale !== "en");
      if (locale !== "en") expect(html).toContain(`href="/${locale}/contribute/"`);
    });

    it("links the divisions' sites absolutely and well formed, and this site's pages relatively", async () => {
      const links = hrefs(await renderProse(ROUTES[slug], "en"));
      expect(links.length).toBeGreaterThan(2);
      for (const h of links) {
        if (DIVISION_SITE.test(h)) expect(divisionLinkProblem(h), h).toBeNull();
        else if (h.startsWith("https://github.com/")) expect(REPOS.some((r) => h === r || h.startsWith(`${r}/`)), h).toBe(true);
        else if (h.startsWith("https://")) throw new Error(`${slug}: unexpected link ${h}`);
        else expect(["../", "../about/", "../divisions/", "../contribute/"], `${slug}: ${h}`).toContain(h);
      }
      expect(links.filter(strayRelative)).toEqual([]);
      expect(links.filter((h) => h.startsWith("https://lumenary.academy"))).toEqual([]);
    });
  });

  it("About covers the academy and links each division, leaving Scientia's detail to Scientia", () => {
    const about = read("content/pages/about/en.mdx");
    for (const url of ["https://scientia.lumenary.academy/en/", "https://lingua.lumenary.academy/en/", "https://prep.lumenary.academy", "https://scientia.lumenary.academy/en/about/"]) expect(about).toContain(`(${url})`);
    expect(about).toMatch(/drafted with AI assistance/);
    expect(about).toMatch(/none has yet been reviewed by a human expert/);
    expect(about).toMatch(/paid service/);
    expect(about).not.toMatch(/\bLean\b|verified|verification|\d+ lessons|Wonder Trails/i);
  });

  it("Divisions links each subject and course on its division's site", () => {
    const divisions = read("content/pages/divisions/en.mdx");
    for (const p of ["math", "chemistry", "statistics", "cs", "cs/languages", "cs/electives", "ee", "robotics", "me", "materials"])
      expect(divisions).toContain(`(https://scientia.lumenary.academy/en/${p}/)`);
    expect(divisions).toContain("(https://lingua.lumenary.academy/en/spanish/)");
    expect(divisions).toContain("(https://lingua.lumenary.academy/es/ingles/)");
    expect(divisions).toContain("(https://prep.lumenary.academy)");
    expect(divisions).not.toMatch(/\]\(\/(en|es|ar|hi|sw|zh-Hans)\//);
  });

  it("Contribute says how to help each division", () => {
    const contribute = read("content/pages/contribute/en.mdx");
    expect(contribute).toContain("(https://scientia.lumenary.academy/en/contribute/)");
    expect(contribute).toContain("(https://github.com/lumenary-academy/lumenary-scientia)");
    expect(contribute).toContain("(https://github.com/lumenary-academy/lumenary-lingua)");
    expect(contribute).toContain("(https://github.com/lumenary-academy/lumenary-lingua/blob/main/CONTRIBUTING.md)");
    expect(contribute).toMatch(/## Lumenary Prep\n\nLumenary Prep is a paid service\. Feedback on it is welcome\.\n/);
  });

  it("never calls the academy \"The Lumenary\"", () => {
    for (const slug of PAGE_SLUGS) expect(read(`content/pages/${slug}/en.mdx`)).not.toMatch(/\bThe Lumenary\b/);
  });
});
