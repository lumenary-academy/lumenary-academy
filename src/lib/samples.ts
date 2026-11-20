import { LINGUA_URL, PREP_URL } from "./links";

/**
 * The front page's sample lessons from Lumenary Lingua and Lumenary Prep, whose content is in their
 * own repositories. Both lists are copied from the former main site's src/lib/sites.ts.
 */

/** A lesson of a Lumenary Lingua course. Each course exists only in the locale it is taught in. */
export interface LinguaLesson {
  /** The locale the course is taught in, which is also its titles' language. */
  locale: string;
  course: string;
  slug: string;
  title: string;
  courseTitle: string;
}

/** A Lingua lesson's address: https://lingua.lumenary.academy/<locale>/<course>/<slug>/. */
export const linguaLesson = (l: Pick<LinguaLesson, "locale" | "course" | "slug">) => `${LINGUA_URL}/${l.locale}/${l.course}/${l.slug}/`;

/**
 * The first lesson of each Lingua course, with its title and the course's title in the language the
 * course is taught in (from lumenary-lingua's content/lingua/<course>/course.json and the lesson's
 * lesson.mdx, as of 19 November 2026).
 */
export const LINGUA_SAMPLES: LinguaLesson[] = [
  { locale: "en", course: "spanish", slug: "sounds-and-greetings", title: "Sounds and greetings", courseTitle: "Spanish, taught in English" },
  { locale: "es", course: "ingles", slug: "sonidos-y-saludos", title: "Sonidos y saludos", courseTitle: "Inglés, enseñado en español" },
];

/** A lesson of a Lumenary Prep course (Prep's site is in English). */
export interface PrepLesson {
  course: string;
  /** The exam's name, as Prep's course is titled. */
  exam: string;
  slug: string;
  title: string;
}

/** A Prep lesson's address: https://prep.lumenary.academy/courses/<course>/lessons/<slug> (no trailing slash; Prep redirects one away). */
export const prepLesson = (l: Pick<PrepLesson, "course" | "slug">) => `${PREP_URL}/courses/${l.course}/lessons/${l.slug}`;

/**
 * Free sample lessons from Lumenary Prep: in each course, a free lesson that teaches a skill rather
 * than describing the exam, which anyone can open without buying the course. One exam from each of
 * the kinds Prep covers: admissions, graduate school, law school, English-language and a
 * professional licence.
 *
 * Prep's content is private, so tests cannot check these. Each address was checked with curl on
 * 19 November 2026 and returned HTTP 200 with the lesson itself (not the notice shown for a paid
 * lesson). Check again with curl before changing or adding one.
 */
export const PREP_SAMPLES: PrepLesson[] = [
  { course: "sat", exam: "SAT", slug: "words-in-context", title: "Words in context" },
  { course: "gre-general", exam: "GRE General Test", slug: "quantitative-comparison", title: "Quantitative Comparison" },
  { course: "lsat", exam: "LSAT", slug: "anatomy-of-an-argument", title: "The anatomy of an argument" },
  { course: "ielts", exam: "IELTS", slug: "reading-true-false-not-given", title: "True, False or Not Given (and Yes, No or Not Given)" },
  { course: "ea", exam: "Enrolled Agent (SEE)", slug: "p3-practice-before-irs", title: "Practice before the IRS and who may do it" },
];
