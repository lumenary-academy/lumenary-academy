import { DIVISIONS } from "@lumenary/core/brand";
import type { TFunction } from "@lumenary/core/i18n";
import { href } from "@lumenary/core/routing";
import type { FooterColumn } from "@lumenary/core/site";
import { CODE_LICENCE_URL, CONTENT_LICENCE_URL, PREP_URL, SOURCE_URL, linguaHome, scientiaHome } from "./links";

/**
 * The header's and footer's links. Labels are the messages `nav.<key>` (and `nav.short.<key>` in
 * the header bar); the three divisions are brands, never translated.
 */

/** A header link: a page of this site (`path`) or a division's own site (`external`). */
export interface HeaderLink {
  key: string;
  href: string;
  /** The page's path on this site, for marking the link current. */
  path?: string;
  external?: boolean;
}

/** The academy's own pages, each in every locale. */
export const PROJECT_PAGES = ["about", "divisions", "contribute"] as const;

/** Each division's front page for a reader in `locale` (Prep's site is in English only). */
export function divisionLinks(locale: string) {
  return [
    { key: "scientia", label: DIVISIONS.scientia, href: scientiaHome(locale) },
    { key: "lingua", label: DIVISIONS.lingua, href: linguaHome(locale) },
    { key: "prep", label: DIVISIONS.prep, href: PREP_URL },
  ];
}

/** The header: the three divisions (leaving this site), then About, Divisions and Contribute. */
export function headerNav(locale: string): HeaderLink[] {
  return [
    ...divisionLinks(locale).map(({ key, href }) => ({ key, href, external: true })),
    ...PROJECT_PAGES.map((p) => ({ key: p, href: href(locale, p), path: p })),
  ];
}

/** The footer: the three divisions, the academy's pages, and the source code with its licences. */
export function footerColumns(locale: string, t: TFunction): FooterColumn[] {
  return [
    { title: DIVISIONS.academy, links: divisionLinks(locale).map(({ label, href }) => ({ label, href })) },
    { title: t("footer.project"), links: PROJECT_PAGES.map((p) => ({ label: t(`nav.${p}`), href: href(locale, p) })) },
    {
      title: t("footer.openSource"),
      links: [
        { label: t("footer.sourceCode"), href: SOURCE_URL },
        { label: t("footer.codeLicence"), href: CODE_LICENCE_URL },
        { label: t("footer.contentLicence"), href: CONTENT_LICENCE_URL },
      ],
    },
  ];
}
