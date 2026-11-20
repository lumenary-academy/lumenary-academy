import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderToStaticMarkup } from "react-dom/server";
import type { Locale } from "@lumenary/core/i18n";
import { SCIENTIA_COURSES, SCIENTIA_LESSONS } from "@/lib/subjects";

export const ROOT = path.resolve(import.meta.dirname, "..");
export const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");
export const json = <T = unknown>(p: string): T => JSON.parse(read(p)) as T;
export const fm = (p: string) => matter(read(p));

/** An async server component's page, rendered to HTML as the static export would (without the layout). */
export async function renderPage(Page: (props: { params: Promise<{ locale: string }> }) => Promise<React.ReactElement>, locale: Locale): Promise<string> {
  return renderToStaticMarkup(await Page({ params: Promise.resolve({ locale }) }));
}

/** Every href in a piece of HTML, with HTML entities in it decoded. */
export const hrefs = (html: string) => [...html.matchAll(/\shref="([^"]*)"/g)].map((m) => m[1]!.replace(/&amp;/g, "&"));

const LOCALE = "(en|es|ar|hi|sw|zh-Hans)";

/**
 * Whether a link to one of the three divisions' sites is well formed, and points where that site has
 * a page: Scientia and Lingua pages at /<locale>/…/ with a trailing slash (Scientia's courses only in
 * English, a Math lesson only in English and its translations); Prep's front page, or a Prep lesson
 * without a trailing slash. Returns the problem, or null for a good link.
 */
export function divisionLinkProblem(url: string): string | null {
  if (url.startsWith("https://scientia.lumenary.academy")) {
    const m = url.match(new RegExp(`^https://scientia\\.lumenary\\.academy/${LOCALE}/((?:[A-Za-z0-9-]+/)*)$`));
    if (!m) return "not https://scientia.lumenary.academy/<locale>/…/";
    const [, locale, rest] = m as unknown as [string, string, string];
    const first = rest.split("/")[0]!;
    if ((SCIENTIA_COURSES as readonly string[]).includes(first) && locale !== "en") return `course page outside English (${locale})`;
    const lesson = rest.match(/^math\/lessons\/([^/]+)\/$/);
    if (lesson) {
      const pinned = SCIENTIA_LESSONS[`math/lessons/${lesson[1]}`];
      if (pinned && !(locale in pinned.titles)) return `Math lesson ${lesson[1]} is not translated into ${locale}`;
    }
    return null;
  }
  if (url.startsWith("https://lingua.lumenary.academy")) {
    return new RegExp(`^https://lingua\\.lumenary\\.academy/${LOCALE}/(?:[a-z0-9-]+/)*$`).test(url) ? null : "not https://lingua.lumenary.academy/<locale>/…/";
  }
  if (url.startsWith("https://prep.lumenary.academy")) {
    return /^https:\/\/prep\.lumenary\.academy(?:\/courses\/[a-z0-9-]+\/lessons\/[a-z0-9-]+)?$/.test(url) ? null : "not https://prep.lumenary.academy[/courses/<course>/lessons/<slug>]";
  }
  return "not a division's site";
}

/** Links that should point at a division's site but are not absolute: a leftover Scientia path such as /en/math/. */
export const SCIENTIA_SEGMENTS = ["math", "cs", "ee", "robotics", "chemistry", "me", "materials", "statistics", "lab", "formal", "practice", "progress", "educators", "verification", "languages", "lingua"];
export const strayRelative = (url: string) => new RegExp(`^/${LOCALE}/(${SCIENTIA_SEGMENTS.join("|")})(/|$)`).test(url);
