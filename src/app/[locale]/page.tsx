import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Atom, GraduationCap, Languages } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DIVISIONS } from "@lumenary/core/brand";
import { resolveLocale } from "@lumenary/core/i18n/server";
import { href, i18n } from "@/lib/site";
import { PREP_URL, linguaHome, scientiaHome } from "@/lib/links";
import { LINGUA_SAMPLES, PREP_SAMPLES, linguaLesson, prepLesson } from "@/lib/samples";
import { SCIENTIA_PENDING, SCIENTIA_SUBJECTS, sampleLesson, scientiaHref } from "@/lib/subjects";
import { SUBJECT_LOOK } from "@/components/subject-look";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = await i18n.getT(await resolveLocale(params));
  return { description: t("divisions.lead") };
}

const external = <ArrowUpRight size={16} className="rtl:-scale-x-100" aria-hidden="true" />;

function Division({ Icon, accent, name, what, badge, text, children, action }: { Icon: LucideIcon; accent: string; name: string; what: string; badge: string; text: string; children?: React.ReactNode; action: React.ReactNode }) {
  return (
    <article className="card relative flex h-full flex-col overflow-hidden p-6">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-paper-2 text-ink">
          <Icon size={22} aria-hidden="true" />
        </span>
        <span className="chip">{badge}</span>
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-ink" lang="en">
        {name}
      </h2>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-ink">{what}</p>
      <p className="mt-3 leading-relaxed text-ink-2">{text}</p>
      {children}
      <div className="mt-auto pt-6">{action}</div>
    </article>
  );
}

/** A lesson to try: its address on a division's site, its title (in the lesson's own language), and what it belongs to when the title alone does not say. */
interface Sample {
  href: string;
  title: string;
  lang: string;
  context?: string;
}

/** A short list of lessons to try, each on a division's own site. */
function TryLessons({ title, samples, note, className = "" }: { title: string; samples: Sample[]; note?: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold text-muted">{title}</p>
      <ul className="mt-1.5 space-y-1 text-sm leading-snug">
        {samples.map((s) => (
          <li key={s.href} lang={s.lang}>
            <a href={s.href} className="link">
              {s.title}
            </a>
            {s.context && <span className="text-muted"> · {s.context}</span>}
          </li>
        ))}
      </ul>
      {note && <p className="mt-2 text-xs leading-relaxed text-muted">{note}</p>}
    </div>
  );
}

/** Lumenary Academy's front page: its three divisions, Scientia's subjects, and lessons to try in each division. */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = await i18n.getT(locale);
  const arrow = <ArrowRight size={16} className="rtl:rotate-180" aria-hidden="true" />;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_70%_30%,black,transparent_70%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-40 end-[-10%] h-[36rem] w-[36rem] rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
        <div className="container-page relative py-14 sm:py-20">
          <p className="eyebrow">{t("divisions.eyebrow")}</p>
          <h1 className="mt-4 text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">{t("meta.siteName")}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">{t("divisions.lead")}</p>
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <ul className="grid gap-5 lg:grid-cols-3">
          <li>
            <Division
              Icon={Atom}
              accent="bg-gold"
              name={DIVISIONS.scientia}
              what={t("divisions.scientiaWhat")}
              badge={t("divisions.scientiaBadge")}
              text={t("divisions.scientiaText")}
              action={
                <a href="#subjects" className="btn btn-primary">
                  {t("divisions.scientiaCta")} {arrow}
                </a>
              }
            >
              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={t("divisions.available")}>
                {SCIENTIA_SUBJECTS.map((s) => (
                  <li key={s.key}>
                    <a href={scientiaHref(locale, s.path)} className="chip border-gold/50 bg-gold-soft text-gold-ink hover:border-gold">
                      {t(`divisions.${s.key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </Division>
          </li>
          <li>
            <Division
              Icon={Languages}
              accent="bg-sky"
              name={DIVISIONS.lingua}
              what={t("divisions.linguaWhat")}
              badge={t("divisions.available")}
              text={t("divisions.linguaText")}
              action={
                <a href={linguaHome(locale)} className="btn btn-primary">
                  {t("divisions.linguaCta")} {external}
                </a>
              }
            >
              <TryLessons
                className="mt-5 border-t border-line pt-4"
                title={t("divisions.tryLesson")}
                samples={LINGUA_SAMPLES.map((l) => ({ href: linguaLesson(l), title: l.title, lang: l.locale, context: l.courseTitle }))}
              />
            </Division>
          </li>
          <li>
            <Division
              Icon={GraduationCap}
              accent="bg-formal"
              name={DIVISIONS.prep}
              what={t("divisions.prepWhat")}
              badge={t("divisions.prepBadge")}
              text={t("divisions.prepText")}
              action={
                <a href={PREP_URL} className="btn btn-primary">
                  {t("divisions.prepCta")} {external}
                </a>
              }
            >
              <TryLessons
                className="mt-5 border-t border-line pt-4"
                title={t("divisions.prepTry")}
                note={t("divisions.prepTryNote")}
                samples={PREP_SAMPLES.map((l) => ({ href: prepLesson(l), title: l.title, lang: "en", context: l.exam }))}
              />
            </Division>
          </li>
        </ul>
      </section>

      <section id="subjects" className="scroll-mt-20 border-t border-line bg-paper-2/40" aria-labelledby="subjects-title">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow" lang="en">
            {DIVISIONS.scientia}
          </p>
          <h2 id="subjects-title" className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
            {t("divisions.subjectsTitle")}
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-ink-2">{t("divisions.subjectsLead")}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SCIENTIA_SUBJECTS.map((s) => {
              const look = SUBJECT_LOOK[s.key] ?? { Icon: Atom, accent: "bg-gold" };
              const samples = s.samples.map((p) => sampleLesson(p, locale)).map((l) => ({ href: l.href, title: l.title, lang: l.lang, context: l.course }));
              // The subject's name links its page on Scientia's site, and its link covers the card; the lessons to try sit above it.
              return (
                <li key={s.key} className="card group relative flex h-full flex-col overflow-hidden p-5 hover:shadow-[var(--shadow-lg)]">
                  <span className={`absolute inset-x-0 top-0 h-1 ${look.accent}`} aria-hidden="true" />
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-paper-2 text-ink">
                    <look.Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold text-ink">
                    <a href={scientiaHref(locale, s.path)} className="after:absolute after:inset-0">
                      {t(`divisions.${s.key}`)}
                    </a>
                  </h3>
                  <p className="mt-1.5 text-sm leading-snug text-ink-2">{t(`divisions.${s.key}Text`)}</p>
                  {samples.length > 0 && <TryLessons className="relative z-10 mt-4" title={t("divisions.tryLesson")} samples={samples} />}
                  <span className="mt-auto flex justify-end pt-4 text-muted">
                    <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 rtl:-scale-x-100" aria-hidden="true" />
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted">{t("divisions.pending")}:</span>
            {SCIENTIA_PENDING.map((k) => (
              <span key={k} className="chip">
                {t(`divisions.${k}`)}
              </span>
            ))}
          </div>
          <p className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            <a href={scientiaHome(locale)} className="link inline-flex items-center gap-1 font-semibold">
              {t("academy.visitScientia")} {external}
            </a>
            <Link href={href(locale, "divisions")} className="link font-semibold">
              {t("divisions.more")}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
