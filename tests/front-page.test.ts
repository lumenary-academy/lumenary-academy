/**
 * The front page in every locale: it renders, shows the three divisions, Scientia's subjects with their
 * sample lessons, and Lingua's and Prep's samples, and every link to a division's site is absolute,
 * well formed and in the right locale.
 */
import { describe, expect, it } from "vitest";
import { LOCALES, makeT } from "@lumenary/core/i18n";
import HomePage from "@/app/[locale]/page";
import { i18n } from "@/lib/site";
import { LINGUA_SAMPLES, PREP_SAMPLES, linguaLesson, prepLesson } from "@/lib/samples";
import { SCIENTIA_PENDING, SCIENTIA_SUBJECTS, sampleLesson, scientiaHref } from "@/lib/subjects";
import { divisionLinkProblem, hrefs, renderPage, strayRelative } from "./helpers";

const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

describe.each(LOCALES)("the front page in %s", (locale) => {
  it("renders the divisions, the subjects and every sample lesson", async () => {
    const html = decode(await renderPage(HomePage, locale));
    const t = makeT(await i18n.getMessages(locale));
    for (const name of ["Lumenary Scientia", "Lumenary Lingua", "Lumenary Prep"]) expect(html).toContain(name);
    for (const key of ["divisions.lead", "divisions.scientiaText", "divisions.linguaText", "divisions.prepText", "divisions.prepTryNote", "divisions.subjectsTitle", "academy.visitScientia"])
      expect(html, key).toContain(t(key));
    for (const s of SCIENTIA_SUBJECTS) {
      expect(html).toContain(t(`divisions.${s.key}`));
      expect(html).toContain(t(`divisions.${s.key}Text`));
      for (const p of s.samples) {
        const lesson = sampleLesson(p, locale);
        expect(html).toContain(`href="${lesson.href}"`);
        expect(html).toContain(lesson.title);
      }
    }
    for (const k of SCIENTIA_PENDING) expect(html).toContain(t(`divisions.${k}`));
    for (const l of LINGUA_SAMPLES) expect(html).toContain(`href="${linguaLesson(l)}"`);
    for (const l of PREP_SAMPLES) {
      expect(html).toContain(`href="${prepLesson(l)}"`);
      expect(html).toContain(l.title);
    }
    expect(html).not.toMatch(/The Lumenary/);
  });

  it("links every division absolutely, in a well-formed address", async () => {
    const links = hrefs(await renderPage(HomePage, locale));
    const external = links.filter((h) => /^https?:/.test(h));
    expect(external.length).toBeGreaterThan(20);
    for (const h of external) expect(divisionLinkProblem(h), h).toBeNull();
    // The only links that stay on this site: the subjects anchor and the divisions page.
    expect(links.filter((h) => !/^https:/.test(h)).sort()).toEqual(["#subjects", `/${locale}/divisions/`]);
    expect(links.filter(strayRelative)).toEqual([]);
  });

  it("links Scientia's subjects, its courses in English and Math in the reader's locale", async () => {
    const links = hrefs(await renderPage(HomePage, locale));
    expect(links).toContain(`https://scientia.lumenary.academy/${locale}/`);
    expect(links).toContain(`https://scientia.lumenary.academy/${locale}/math/`);
    expect(links).toContain("https://scientia.lumenary.academy/en/chemistry/");
    expect(links).toContain("https://scientia.lumenary.academy/en/cs/languages/");
    expect(links).toContain(`https://scientia.lumenary.academy/${locale}/math/lessons/collections/`);
    expect(links).toContain("https://scientia.lumenary.academy/en/math/lessons/proof-techniques/");
    expect(links).toContain("https://scientia.lumenary.academy/en/cs/languages/python/the-python-way/");
    expect(links).toContain(`https://lingua.lumenary.academy/${locale}/`);
    expect(links).toContain("https://lingua.lumenary.academy/es/ingles/sonidos-y-saludos/");
    expect(links).toContain("https://prep.lumenary.academy");
    expect(links).toContain("https://prep.lumenary.academy/courses/sat/lessons/words-in-context");
    for (const s of SCIENTIA_SUBJECTS) expect(links).toContain(scientiaHref(locale, s.path));
  });

  it("titles each sample lesson in the language of the page it opens", async () => {
    const html = await renderPage(HomePage, locale);
    const collections = sampleLesson("math/lessons/collections", locale);
    expect(collections.lang).toBe(locale);
    expect(html).toContain(`<li lang="${locale}"><a href="${collections.href}" class="link">`);
    expect(sampleLesson("cs/what-is-computing", locale).lang).toBe("en");
    expect(html).toContain('<li lang="es"><a href="https://lingua.lumenary.academy/es/ingles/sonidos-y-saludos/" class="link">Sonidos y saludos</a>');
  });
});
