import type { Metadata } from "next";
import { DIVISIONS } from "@lumenary/core/brand";
import { resolveLocale } from "@lumenary/core/i18n/server";
import { ProsePage } from "@lumenary/core/pages";
import { href, i18n, pages } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { frontmatter } = pages.getPage("contribute", await resolveLocale(params));
  // A title that already names the academy is not followed by " · Lumenary Academy" again.
  return { title: frontmatter.title.includes(DIVISIONS.academy) ? { absolute: frontmatter.title } : frontmatter.title, description: frontmatter.lead };
}

/** content/pages/contribute/en.mdx, in every locale (a notice says when it is shown in English). */
export default async function ContributePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  return <ProsePage slug="contribute" locale={locale} t={await i18n.getT(locale)} eyebrow={DIVISIONS.academy} pages={pages} helpHref={href(locale, "contribute")} />;
}
