import type { MetadataRoute } from "next";
import { LOCALES } from "@lumenary/core/i18n";
import { PAGE_SLUGS, href } from "@/lib/site";
import { SITE_URL } from "@/lib/links";

export const dynamic = "force-static";

/** Every page (static export writes this to /sitemap.xml): the front page and the prose pages, in every locale. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...PAGE_SLUGS];
  return LOCALES.flatMap((locale) => paths.map((p) => ({ url: `${SITE_URL}${href(locale, p)}` })));
}
