/**
 * Every address this site links to outside itself: the three divisions' sites, this repository and
 * its licences. Change a division's address here, once.
 *
 * @lumenary/core exports similar constants, but with a trailing slash; this site keeps its own, without
 * one, and builds its paths from them.
 */

/** The canonical origin of this site, for metadata and the sitemap. */
export const SITE_URL = "https://lumenary.academy";

/** Lumenary Scientia, the sciences (github.com/lumenary-academy/lumenary-scientia). */
export const SCIENTIA_URL = "https://scientia.lumenary.academy";

/** Lumenary Lingua, languages (github.com/lumenary-academy/lumenary-lingua). Its front page exists in every locale. */
export const LINGUA_URL = "https://lingua.lumenary.academy";

/** Lumenary Prep, exam preparation: a paid service, in English only. */
export const PREP_URL = "https://prep.lumenary.academy";

export const SOURCE_URL = "https://github.com/lumenary-academy/lumenary-academy";
export const CODE_LICENCE_URL = `${SOURCE_URL}/blob/main/LICENSE`;
export const CONTENT_LICENCE_URL = `${SOURCE_URL}/blob/main/LICENSE-CONTENT`;

export const SCIENTIA_SOURCE_URL = "https://github.com/lumenary-academy/lumenary-scientia";
export const LINGUA_SOURCE_URL = "https://github.com/lumenary-academy/lumenary-lingua";

/** Lumenary Scientia's front page in a locale (it exists in all six). */
export const scientiaHome = (locale: string) => `${SCIENTIA_URL}/${locale}/`;

/** Lumenary Lingua's front page in a locale: https://lingua.lumenary.academy/<locale>/. */
export const linguaHome = (locale: string) => `${LINGUA_URL}/${locale}/`;
