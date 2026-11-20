// No KaTeX stylesheet: the site's pages have no mathematics.
import "../globals.css";
import type { Metadata } from "next";
import { CORE_NAMESPACES, LOCALES, LOCALE_META, makeT, pickMessages } from "@lumenary/core/i18n";
import { I18nProvider } from "@lumenary/core/i18n/client";
import { resolveLocale } from "@lumenary/core/i18n/server";
import { DIVISIONS } from "@lumenary/core/brand";
import { fontVariables } from "@lumenary/core/fonts";
import { SiteFooter, initScript } from "@lumenary/core/site";
import { AcademyHeader } from "@/components/AcademyHeader";
import { i18n } from "@/lib/site";
import { footerColumns, headerNav } from "@/lib/nav";
import { SITE_URL } from "@/lib/links";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await i18n.getT(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: DIVISIONS.academy, template: `%s · ${DIVISIONS.academy}` },
    description: t("divisions.lead"),
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}/`])) },
    icons: { icon: "/favicon.svg" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const messages = await i18n.getMessages(locale);
  const t = makeT(messages);
  return (
    <html lang={locale} dir={LOCALE_META[locale].dir} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body className="min-h-screen">
        <I18nProvider locale={locale} messages={pickMessages(messages, [...CORE_NAMESPACES, "academy.notFound"])}>
          <a href="#main" className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:start-4 focus:top-3">
            {t("nav.skip")}
          </a>
          <AcademyHeader nav={headerNav(locale)} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter division="Academy" mission={t("footer.mission")} columns={footerColumns(locale, t)} license={t("footer.license")} note={t("footer.noEndorsement")} />
        </I18nProvider>
      </body>
    </html>
  );
}
