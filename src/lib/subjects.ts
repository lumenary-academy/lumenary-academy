import { createRouting } from "@lumenary/core/routing";
import type { Locale } from "@lumenary/core/i18n";
import { SCIENTIA_URL } from "./links";

/**
 * Lumenary Scientia's subjects and the lessons the front page offers to try, pinned as data.
 *
 * Scientia's content lives in its own repository (lumenary-academy/lumenary-scientia), so this site
 * cannot read it. The list, order and sample lessons are copied from that repository's
 * src/lib/subjects.ts, and the titles from the lessons themselves (Math lessons from
 * content/math/lessons/<slug>/<locale>.mdx, course lessons from content/<course>/lessons/<slug>/lesson.mdx),
 * as of 19 November 2026. tests/subjects.test.ts checks that the data hangs together; when Scientia
 * opens a subject or renames a lesson, update it here.
 */

/** A subject with published content. Its name and blurb are the messages `divisions.<key>` and `divisions.<key>Text`. */
export interface ScientiaSubject {
  key: string;
  /** Its page on Scientia's site, without the locale ("math", "cs/languages"). */
  path: string;
  /** Lessons to try (Scientia site paths without the locale): each subject's first lesson. */
  samples: string[];
}

/**
 * The open subjects, in the order Scientia lists them. Mathematics also offers a lesson for older
 * learners (proof techniques, grades 9–12) beside its first, kindergarten lesson; the programming
 * languages offer the first lesson of Python and of JavaScript.
 */
export const SCIENTIA_SUBJECTS: ScientiaSubject[] = [
  { key: "mathematics", path: "math", samples: ["math/lessons/collections", "math/lessons/proof-techniques"] },
  { key: "chemistry", path: "chemistry", samples: ["chemistry/what-is-matter"] },
  { key: "statistics", path: "statistics", samples: ["statistics/what-is-statistics"] },
  { key: "computerScience", path: "cs", samples: ["cs/what-is-computing"] },
  { key: "programmingLanguages", path: "cs/languages", samples: ["cs/languages/python/the-python-way", "cs/languages/javascript/first-steps"] },
  { key: "electricalEngineering", path: "ee", samples: ["ee/what-is-electricity"] },
  { key: "robotics", path: "robotics", samples: ["robotics/what-is-a-robot"] },
  { key: "mechanicalEngineering", path: "me", samples: ["me/forces-and-motion"] },
  { key: "materialsScience", path: "materials", samples: ["materials/materials-around-us"] },
];

/** Subjects without content yet, listed as pending. */
export const SCIENTIA_PENDING = ["physics", "biology", "otherSciences"] as const;

/**
 * Scientia's courses outside Lumenary Math, by site path. Each course's pages (and those of the
 * courses nested under it, such as cs/languages/python) exist only in English.
 */
export const SCIENTIA_COURSES = ["chemistry", "statistics", "cs", "ee", "robotics", "me", "materials"] as const;

/** A sample lesson's titles: English always, plus each locale a Lumenary Math lesson is translated into. */
export interface PinnedLesson {
  titles: { en: string } & Partial<Record<Locale, string>>;
  /** For a lesson of a course in a collection (a programming language): the course's title. */
  course?: string;
}

export const SCIENTIA_LESSONS: Record<string, PinnedLesson> = {
  "math/lessons/collections": {
    titles: { en: "Collections", es: "Colecciones", ar: "التجمّعات", hi: "संग्रह", sw: "Mikusanyiko", "zh-Hans": "一组对象" },
  },
  "math/lessons/proof-techniques": { titles: { en: "Proof: direct, contrapositive, contradiction and induction" } },
  "chemistry/what-is-matter": { titles: { en: "What is matter?" } },
  "statistics/what-is-statistics": { titles: { en: "What is statistics?" } },
  "cs/what-is-computing": { titles: { en: "What a computer does" } },
  "cs/languages/python/the-python-way": { titles: { en: "The Python way" }, course: "Python" },
  "cs/languages/javascript/first-steps": { titles: { en: "First steps" }, course: "JavaScript" },
  "ee/what-is-electricity": { titles: { en: "What is electricity?" } },
  "robotics/what-is-a-robot": { titles: { en: "What is a robot?" } },
  "me/forces-and-motion": { titles: { en: "Forces and motion" } },
  "materials/materials-around-us": { titles: { en: "Materials around us" } },
};

/** Lumenary Math's lesson pages, generated in English and in each locale the lesson is translated into. */
const MATH_LESSON = /^math\/lessons\/([^/#]+)/;

/**
 * Which locale each Scientia page is generated in, as Scientia's own routing has it (its
 * src/lib/href.ts): courses in English only; a Math lesson in English and its translations; the
 * labs' detail pages in English only; everything else (the Math front page, for one) in every locale.
 */
export const scientiaRouting = createRouting({
  courses: Object.fromEntries(SCIENTIA_COURSES.map((c) => [c, "en"])),
  translated: {
    pattern: "^(math/lessons|practice|educators/worksheets)/([^/#]+)",
    locales: Object.fromEntries(
      Object.entries(SCIENTIA_LESSONS)
        .map(([path, l]) => [path.match(MATH_LESSON)?.[1], Object.keys(l.titles).filter((k) => k !== "en")] as const)
        .filter((e): e is [string, string[]] => e[0] !== undefined),
    ),
  },
  englishOnly: ["^(lab|formal)/[^/#]+"],
});

/** A page of Lumenary Scientia, in `locale` if it exists there, else in the locale it falls back to. */
export const scientiaHref = (locale: string, path = "") => `${SCIENTIA_URL}${scientiaRouting.href(locale, path)}`;

/** A sample lesson, linked and titled in the language of the page its link opens. */
export interface SampleLesson {
  href: string;
  title: string;
  /** The locale of the lesson's page, and so of its title. */
  lang: string;
  course?: string;
}

/** A sample lesson for a reader in `locale`. Throws if the lesson is not in SCIENTIA_LESSONS. */
export function sampleLesson(path: string, locale: Locale): SampleLesson {
  const lesson = SCIENTIA_LESSONS[path];
  if (!lesson) throw new Error(`Sample lesson ${path}: not pinned in SCIENTIA_LESSONS`);
  const lang = scientiaRouting.pageLocale(locale, path) as Locale;
  const title = lesson.titles[lang];
  if (!title) throw new Error(`Sample lesson ${path}: no ${lang} title`);
  return { href: scientiaHref(locale, path), title, lang, course: lesson.course };
}
