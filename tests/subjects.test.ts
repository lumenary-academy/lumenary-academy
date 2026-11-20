/**
 * The data pinned from the other divisions' repositories (src/lib/subjects.ts, src/lib/samples.ts),
 * which this site cannot read: it must hang together, since nothing else checks it here.
 */
import { describe, expect, it } from "vitest";
import { LOCALES, makeT } from "@lumenary/core/i18n";
import { i18n } from "@/lib/site";
import { SUBJECT_LOOK } from "@/components/subject-look";
import { LINGUA_SAMPLES, PREP_SAMPLES } from "@/lib/samples";
import { SCIENTIA_COURSES, SCIENTIA_LESSONS, SCIENTIA_PENDING, SCIENTIA_SUBJECTS, sampleLesson, scientiaHref, scientiaRouting } from "@/lib/subjects";

const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe("Lumenary Scientia's subjects", () => {
  it("lists the subjects in Scientia's order, with unique keys and paths", () => {
    expect(SCIENTIA_SUBJECTS.map((s) => s.key)).toEqual([
      "mathematics",
      "chemistry",
      "statistics",
      "computerScience",
      "programmingLanguages",
      "electricalEngineering",
      "robotics",
      "mechanicalEngineering",
      "materialsScience",
    ]);
    expect(new Set(SCIENTIA_SUBJECTS.map((s) => s.path)).size).toBe(SCIENTIA_SUBJECTS.length);
    expect(SCIENTIA_SUBJECTS.some((s) => (SCIENTIA_PENDING as readonly string[]).includes(s.key))).toBe(false);
  });

  it("gives every subject an icon, a name and a blurb, and every pending one a name, in every locale", async () => {
    for (const s of SCIENTIA_SUBJECTS) expect(SUBJECT_LOOK[s.key], s.key).toBeDefined();
    for (const locale of LOCALES) {
      const messages = await i18n.getMessages(locale);
      const t = makeT(messages);
      const divisions = messages.divisions as Record<string, unknown>;
      for (const s of SCIENTIA_SUBJECTS) {
        expect(typeof divisions[s.key], `${locale}: divisions.${s.key}`).toBe("string");
        expect(typeof divisions[`${s.key}Text`], `${locale}: divisions.${s.key}Text`).toBe("string");
        expect(t(`divisions.${s.key}Text`).length).toBeGreaterThan(10);
      }
      for (const k of SCIENTIA_PENDING) expect(typeof divisions[k], `${locale}: divisions.${k}`).toBe("string");
    }
  });

  it("puts every subject except Mathematics under one of Scientia's courses", () => {
    for (const s of SCIENTIA_SUBJECTS) {
      const course = s.path.split("/")[0]!;
      if (s.key === "mathematics") expect(s.path).toBe("math");
      else expect(SCIENTIA_COURSES as readonly string[], s.path).toContain(course);
    }
    expect([...SCIENTIA_COURSES].sort()).toEqual(["chemistry", "cs", "ee", "materials", "me", "robotics", "statistics"]);
  });
});

describe("the sample lessons", () => {
  const samples = SCIENTIA_SUBJECTS.flatMap((s) => s.samples.map((p) => ({ subject: s, path: p })));

  it("gives every subject one or two samples, each inside the subject and pinned once", () => {
    for (const s of SCIENTIA_SUBJECTS) expect(s.samples.length, s.key).toBeGreaterThanOrEqual(1);
    for (const s of SCIENTIA_SUBJECTS) expect(s.samples.length, s.key).toBeLessThanOrEqual(2);
    for (const { subject, path } of samples) {
      expect(path.startsWith(`${subject.path}/`), path).toBe(true);
      expect(SCIENTIA_LESSONS[path], path).toBeDefined();
      for (const part of path.split("/")) expect(part).toMatch(slug);
    }
    expect(new Set(samples.map((s) => s.path)).size).toBe(samples.length);
    // Every pinned lesson is offered somewhere: no stale entries.
    expect(Object.keys(SCIENTIA_LESSONS).sort()).toEqual(samples.map((s) => s.path).sort());
  });

  it("titles a course lesson in English only, and a Math lesson in English and its translations", () => {
    for (const [path, lesson] of Object.entries(SCIENTIA_LESSONS)) {
      expect(lesson.titles.en.trim().length, path).toBeGreaterThan(0);
      const locales = Object.keys(lesson.titles);
      for (const l of locales) expect(LOCALES as readonly string[], `${path}: ${l}`).toContain(l);
      for (const title of Object.values(lesson.titles)) expect(title.trim()).toBe(title);
      if (!path.startsWith("math/lessons/")) expect(locales, path).toEqual(["en"]);
    }
    // Collections, Math's first lesson, is translated into all six locales.
    expect(Object.keys(SCIENTIA_LESSONS["math/lessons/collections"]!.titles).sort()).toEqual([...LOCALES].sort());
  });

  it("names the course only for a lesson of a programming language", () => {
    for (const [path, lesson] of Object.entries(SCIENTIA_LESSONS)) expect(lesson.course !== undefined, path).toBe(path.startsWith("cs/languages/"));
    expect(SCIENTIA_LESSONS["cs/languages/python/the-python-way"]!.course).toBe("Python");
    expect(SCIENTIA_LESSONS["cs/languages/javascript/first-steps"]!.course).toBe("JavaScript");
  });

  it("links each sample in a locale where its page exists, titled in that locale", () => {
    for (const locale of LOCALES)
      for (const { path } of samples) {
        const lesson = sampleLesson(path, locale);
        expect(lesson.title).toBe(SCIENTIA_LESSONS[path]!.titles[lesson.lang as keyof (typeof SCIENTIA_LESSONS)[string]["titles"]]);
        expect(lesson.href).toBe(`https://scientia.lumenary.academy/${lesson.lang}/${path}/`);
        expect(lesson.lang).toBe(path === "math/lessons/collections" ? locale : "en");
      }
    expect(() => sampleLesson("math/lessons/no-such-lesson", "en")).toThrow();
  });

  it("follows Scientia's routing: courses in English, Math and the project pages in every locale, labs' details in English", () => {
    expect(scientiaHref("es", "math")).toBe("https://scientia.lumenary.academy/es/math/");
    expect(scientiaHref("ar", "cs/languages")).toBe("https://scientia.lumenary.academy/en/cs/languages/");
    expect(scientiaHref("hi", "chemistry")).toBe("https://scientia.lumenary.academy/en/chemistry/");
    expect(scientiaHref("sw", "about")).toBe("https://scientia.lumenary.academy/sw/about/");
    expect(scientiaHref("zh-Hans")).toBe("https://scientia.lumenary.academy/zh-Hans/");
    expect(scientiaRouting.pageLocale("es", "lab/some-experiment")).toBe("en");
    expect(scientiaRouting.pageLocale("es", "math/lessons/proof-techniques")).toBe("en");
    expect(scientiaRouting.pageLocale("es", "math/lessons/collections")).toBe("es");
  });
});

describe("Lingua's and Prep's samples", () => {
  it("link the first lesson of each Lingua course in its teaching locale", () => {
    expect(LINGUA_SAMPLES.map((l) => `${l.locale}/${l.course}`)).toEqual(["en/spanish", "es/ingles"]);
    for (const l of LINGUA_SAMPLES) {
      expect(LOCALES as readonly string[]).toContain(l.locale);
      expect(l.course).toMatch(slug);
      expect(l.slug).toMatch(slug);
      expect(l.title.length).toBeGreaterThan(0);
      expect(l.courseTitle.length).toBeGreaterThan(0);
    }
  });

  it("offer one free lesson from each of five Prep courses", () => {
    expect(PREP_SAMPLES).toHaveLength(5);
    expect(new Set(PREP_SAMPLES.map((l) => l.course)).size).toBe(5);
    for (const l of PREP_SAMPLES) {
      expect(l.course).toMatch(slug);
      expect(l.slug).toMatch(slug);
      expect(l.exam.length).toBeGreaterThan(0);
      expect(l.title.length).toBeGreaterThan(0);
    }
  });
});
