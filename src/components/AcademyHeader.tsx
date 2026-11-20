"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark, Wordmark } from "@lumenary/core/brand";
import { useI18n } from "@lumenary/core/i18n/client";
import { LanguageSelector, ThemeToggle } from "@lumenary/core/site";
import type { HeaderLink } from "@/lib/nav";

/**
 * The site header, built from @lumenary/core's chrome: its mark and wordmark, language menu and theme
 * switch, with the markup and classes of the core's `SiteHeader`. The core's `SiteHeader` (v0.1.0)
 * links every navigation item to a path on the same site, and this header must also link the three
 * divisions' own sites, marked as leaving this one; that is the only difference.
 */
export function AcademyHeader({ nav }: { nav: HeaderLink[] }) {
  const { locale, t } = useI18n();
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (item: HeaderLink) => item.path !== undefined && pathname.startsWith(`/${locale}/${item.path}`);

  /** A navigation link. The divisions' sites are plain links, marked as leaving this site. */
  const navLink = (item: HeaderLink, label: string, className: string) =>
    item.external ? (
      <a key={item.key} href={item.href} title={t(`nav.${item.key}`)} className={className}>
        {label}
        <ArrowUpRight size={13} className="opacity-60 rtl:-scale-x-100" aria-hidden="true" />
      </a>
    ) : (
      <Link key={item.key} href={item.href} aria-current={isActive(item) ? "page" : undefined} title={t(`nav.${item.key}`)} className={className}>
        {label}
      </Link>
    );

  return (
    <header
      data-site-header
      className={`sticky top-0 z-40 border-b transition-colors ${scrolled ? "border-line bg-paper/85 backdrop-blur-md" : "border-transparent bg-paper/60 backdrop-blur-sm"}`}
    >
      <div className="container-page flex h-16 items-center gap-4">
        <Link href={`/${locale}/`} className="flex shrink-0 items-center gap-2.5 text-ink" aria-label={`${t("meta.siteName")} — ${t("nav.home")}`}>
          <LogoMark size={30} />
          <Wordmark division="Academy" />
        </Link>
        <nav className="ms-2 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {nav.map((item) =>
            navLink(
              item,
              t(`nav.short.${item.key}`),
              `inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[0.9rem] font-medium transition-colors ${
                isActive(item) ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
              }`,
            ),
          )}
        </nav>
        <div className="ms-auto flex items-center gap-1">
          <LanguageSelector />
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("nav.close") : t("nav.menu")}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-paper lg:hidden" aria-label="Primary">
          <ul className="container-page grid grid-cols-2 gap-1 py-3 sm:grid-cols-3">
            {nav.map((item) => (
              <li key={item.key}>
                {navLink(item, t(`nav.${item.key}`), `flex items-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive(item) ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2"}`)}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
