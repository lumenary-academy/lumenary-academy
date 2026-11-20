/**
 * vercel.json's redirects, compiled with @vercel/routing-utils (the copy bundled in Next.js, which
 * turns `source`/`destination` patterns into the regular expressions Vercel matches) and tried
 * against old addresses of lumenary.academy. Before this site, lumenary.academy served Lumenary
 * Scientia and, earlier, Lumenary Lingua; their old addresses must reach the divisions' own sites,
 * while this site's own pages must never be redirected.
 */
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { LOCALES } from "@lumenary/core/i18n";
import sitemap from "@/app/sitemap";
import { json } from "./helpers";

interface Redirect {
  source: string;
  destination: string;
  permanent?: boolean;
  has?: { type: string; value: string }[];
}
interface Route {
  src: string;
  status: number;
  headers: { Location: string };
  has?: { type: string; value: string }[];
}

const require = createRequire(import.meta.url);
const { convertRedirects } = require("next/dist/compiled/@vercel/routing-utils") as { convertRedirects: (r: Redirect[]) => Route[] };

const { redirects } = json<{ redirects: Redirect[] }>("vercel.json");
const routes = convertRedirects(redirects);

/** Where Vercel sends a request: the first route whose host condition and pattern match, or null. */
function resolve(path: string, host = "lumenary.academy"): { status: number; location: string } | null {
  for (const r of routes) {
    if (r.has && !r.has.every((h) => h.type === "host" && h.value === host)) continue;
    const m = new RegExp(r.src).exec(path);
    if (!m) continue;
    return { status: r.status, location: r.headers.Location.replace(/\$(\d+)/g, (_, i: string) => m[Number(i)] ?? "") };
  }
  return null;
}
const to = (path: string, host?: string) => resolve(path, host)?.location ?? null;

/** Every top-level route of the old main site (lumenary-front's src/app/[locale]/) that Scientia now serves. */
const SCIENTIA_SEGMENTS = ["math", "cs", "ee", "robotics", "chemistry", "me", "materials", "statistics", "lab", "formal", "practice", "progress", "educators", "verification", "languages"];
const LOCALE_PATTERN = "(en|es|ar|hi|sw|zh-Hans)";

describe("vercel.json", () => {
  it("compiles every redirect, all permanent (308)", () => {
    expect(routes).toHaveLength(redirects.length);
    expect(redirects.every((r) => r.permanent === true)).toBe(true);
    expect(routes.every((r) => r.status === 308)).toBe(true);
  });

  it("keeps the www rule and the three Lingua rules first, then one rule per Scientia segment", () => {
    expect(redirects[0]).toEqual({ source: "/:path(.*)", has: [{ type: "host", value: "www.lumenary.academy" }], destination: "https://lumenary.academy/:path", permanent: true });
    expect(redirects.slice(1, 4).map((r) => r.source)).toEqual([
      `/:locale${LOCALE_PATTERN}/lingua/spanish/:path(.*)?`,
      `/:locale${LOCALE_PATTERN}/lingua/ingles/:path(.*)?`,
      `/:locale${LOCALE_PATTERN}/lingua/:path(.*)?`,
    ]);
    expect(redirects.slice(4)).toEqual(
      SCIENTIA_SEGMENTS.map((s) => ({ source: `/:locale${LOCALE_PATTERN}/${s}/:path(.*)?`, destination: `https://scientia.lumenary.academy/:locale/${s}/:path`, permanent: true })),
    );
    // The pattern names exactly the six locales.
    expect(LOCALE_PATTERN.slice(1, -1).split("|").sort()).toEqual([...LOCALES].sort());
  });
});

describe("old addresses", () => {
  const cases: [path: string, expected: string | null, host?: string][] = [
    // Lumenary Math, in every form
    ["/en/math/", "https://scientia.lumenary.academy/en/math/"],
    ["/en/math", "https://scientia.lumenary.academy/en/math/"],
    ["/es/math/curriculum/", "https://scientia.lumenary.academy/es/math/curriculum/"],
    ["/en/math/lessons/proof-techniques/", "https://scientia.lumenary.academy/en/math/lessons/proof-techniques/"],
    ["/zh-Hans/math/lessons/collections/", "https://scientia.lumenary.academy/zh-Hans/math/lessons/collections/"],
    ["/ar/math/lessons/collections", "https://scientia.lumenary.academy/ar/math/lessons/collections"],
    ["/en/math/topics/sets/", "https://scientia.lumenary.academy/en/math/topics/sets/"],
    ["/hi/math/trails/towards-groups/", "https://scientia.lumenary.academy/hi/math/trails/towards-groups/"],
    // Lumenary CS, its languages and electives
    ["/en/cs/", "https://scientia.lumenary.academy/en/cs/"],
    ["/en/cs/what-is-computing/", "https://scientia.lumenary.academy/en/cs/what-is-computing/"],
    ["/en/cs/languages/python/the-python-way/", "https://scientia.lumenary.academy/en/cs/languages/python/the-python-way/"],
    ["/en/cs/electives/data-science/", "https://scientia.lumenary.academy/en/cs/electives/data-science/"],
    // Lumenary EE and the other subjects
    ["/en/ee/", "https://scientia.lumenary.academy/en/ee/"],
    ["/en/ee/what-is-electricity/", "https://scientia.lumenary.academy/en/ee/what-is-electricity/"],
    ["/en/robotics/what-is-a-robot/", "https://scientia.lumenary.academy/en/robotics/what-is-a-robot/"],
    ["/en/chemistry/what-is-matter/", "https://scientia.lumenary.academy/en/chemistry/what-is-matter/"],
    ["/en/me/forces-and-motion/", "https://scientia.lumenary.academy/en/me/forces-and-motion/"],
    ["/en/materials/materials-around-us/", "https://scientia.lumenary.academy/en/materials/materials-around-us/"],
    ["/en/statistics/", "https://scientia.lumenary.academy/en/statistics/"],
    // Math's tools and the project pages Scientia keeps
    ["/en/lab/", "https://scientia.lumenary.academy/en/lab/"],
    ["/en/formal/Sets/", "https://scientia.lumenary.academy/en/formal/Sets/"],
    ["/es/practice/collections/", "https://scientia.lumenary.academy/es/practice/collections/"],
    ["/sw/progress/", "https://scientia.lumenary.academy/sw/progress/"],
    ["/en/educators/worksheets/collections/", "https://scientia.lumenary.academy/en/educators/worksheets/collections/"],
    ["/en/verification/", "https://scientia.lumenary.academy/en/verification/"],
    ["/ar/languages/", "https://scientia.lumenary.academy/ar/languages/"],
    // Lumenary Lingua's old addresses (the rules from the main site, unchanged)
    ["/en/lingua/spanish/sounds-and-greetings/", "https://lingua.lumenary.academy/en/spanish/sounds-and-greetings/"],
    ["/hi/lingua/spanish/", "https://lingua.lumenary.academy/en/spanish/"],
    ["/en/lingua/ingles/sonidos-y-saludos", "https://lingua.lumenary.academy/es/ingles/sonidos-y-saludos"],
    ["/es/lingua/ingles", "https://lingua.lumenary.academy/es/ingles/"],
    ["/sw/lingua/", "https://lingua.lumenary.academy/sw/"],
    ["/zh-Hans/lingua", "https://lingua.lumenary.academy/zh-Hans/"],
    // This site's own pages stay
    ["/", null],
    ["/en/", null],
    ["/zh-Hans/", null],
    ["/en/about/", null],
    ["/es/divisions/", null],
    ["/ar/contribute/", null],
    ["/sitemap.xml", null],
    ["/favicon.svg", null],
    // An unknown locale, and words that merely start like a segment, are not Scientia's
    ["/fr/math/", null],
    ["/de/cs/what-is-computing/", null],
    ["/math/", null],
    ["/en/mathematics/", null],
    ["/en/memo/", null],
    ["/en/cs-notes/", null],
    ["/en/linguistics/", null],
    // www goes to the bare domain, keeping the path; the next request is redirected from there
    ["/", "https://lumenary.academy/", "www.lumenary.academy"],
    ["/en/about/", "https://lumenary.academy/en/about/", "www.lumenary.academy"],
    ["/en/math/lessons/collections/", "https://lumenary.academy/en/math/lessons/collections/", "www.lumenary.academy"],
  ];

  it.each(cases)("%s → %s %s", (path, expected, host) => {
    expect(to(path, host)).toBe(expected);
  });

  it("tries at least 25 addresses", () => {
    expect(cases.length).toBeGreaterThanOrEqual(25);
  });

  it("sends every old Scientia segment, in every locale, with or without a trailing slash, to the same place", () => {
    for (const locale of LOCALES)
      for (const s of SCIENTIA_SEGMENTS) {
        expect(to(`/${locale}/${s}`)).toBe(`https://scientia.lumenary.academy/${locale}/${s}/`);
        expect(to(`/${locale}/${s}/`)).toBe(`https://scientia.lumenary.academy/${locale}/${s}/`);
        expect(to(`/${locale}/${s}/a/b/`)).toBe(`https://scientia.lumenary.academy/${locale}/${s}/a/b/`);
      }
  });

  it("follows www to Scientia in two permanent hops", () => {
    const first = resolve("/es/cs/", "www.lumenary.academy")!;
    expect(first).toEqual({ status: 308, location: "https://lumenary.academy/es/cs/" });
    expect(resolve(new URL(first.location).pathname)).toEqual({ status: 308, location: "https://scientia.lumenary.academy/es/cs/" });
  });

  it("never redirects a page this site builds", () => {
    for (const { url } of sitemap()) expect(to(new URL(url).pathname), url).toBeNull();
  });
});
