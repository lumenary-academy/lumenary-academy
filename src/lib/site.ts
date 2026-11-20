import "server-only";
import path from "node:path";
import { createI18n } from "@lumenary/core/i18n/server";
import { createPageLoader } from "@lumenary/core/pages";
import { createRouting, type RoutingConfig } from "@lumenary/core/routing";
import en from "@/i18n/messages/en.json";

/**
 * Lumenary Academy's site, put together from @lumenary/core: its message catalogue (the shared
 * strings plus the site's own), its prose pages (content/pages/<slug>/<locale>.mdx, English with
 * fallback) and its routing.
 */

/** The site's strings (src/i18n/messages) laid over the strings every Lumenary site shares. */
export const i18n = createI18n({
  en,
  locales: {
    es: () => import("@/i18n/messages/es.json"),
    ar: () => import("@/i18n/messages/ar.json"),
    hi: () => import("@/i18n/messages/hi.json"),
    "zh-Hans": () => import("@/i18n/messages/zh-Hans.json"),
    sw: () => import("@/i18n/messages/sw.json"),
  },
});

/** About, Divisions and Contribute: written in English, shown in every locale with a notice saying so. */
export const pages = createPageLoader({ root: path.join(process.cwd(), "content/pages") });

/** The prose pages, each at /<locale>/<slug>/. */
export const PAGE_SLUGS = ["about", "divisions", "contribute"] as const;

/** Every page of this site exists in all six locales. */
export const routingConfig: RoutingConfig = {};
export const routing = createRouting(routingConfig);
export const { href } = routing;
