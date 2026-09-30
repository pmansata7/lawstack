"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FolderOpen,
  Gavel,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  PlayCircle,
  SquareCheck,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,88,232,0.18),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_78%_22%,rgba(0,88,232,0.09),transparent_70%)]"
        aria-hidden
      />

      <div className="container-x relative grid items-center gap-14 pt-12 pb-4 lg:grid-cols-[minmax(0,47fr)_minmax(0,53fr)] lg:gap-8 lg:pt-16 lg:pb-6">
        <div>
          <p className="eyebrow text-brand-600">AI for real-world litigation</p>
          <h1 className="heading-serif mt-4 text-[40px] leading-[1.05] sm:text-[48px] lg:text-[50px]">
            Stronger cases
            <br className="hidden sm:block" />
            start with better facts.
          </h1>
          <p className="mt-5 max-w-[560px] text-pretty text-[16px] leading-[1.65] text-ink-600 lg:text-[17px]">
            Lawstack helps lawyers, law firms, and courts turn facts into
            evidence-backed pleadings that survive motions to dismiss and
            demurrers.
          </p>
          <ul className="mt-6 space-y-2.5 text-[15px] text-ink-700">
            {[
              "Organize facts and evidence from day one",
              "Generate complaint drafts with legal precision",
              "Strengthen claims with precedent and procedural guidance",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <SquareCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              className="h-11 rounded-lg bg-brand-600 px-6 text-[13.5px] font-semibold shadow-[0_8px_20px_-10px_rgba(0,88,232,0.7)] hover:bg-brand-700"
              asChild
            >
              <Link href="/signup">Request a Demo</Link>
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-lg border-line bg-white px-6 text-[13.5px] font-semibold text-brand-600 hover:bg-brand-50 hover:text-brand-700"
              asChild
            >
              <Link href="/login?demo=1">
                <PlayCircle className="mr-2 h-[18px] w-[18px] text-brand-600" />
                Watch 1-Minute Video
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <p
            className="absolute -left-2 top-8 z-20 hidden max-w-[140px] -rotate-[9deg] font-[family-name:var(--font-hand)] text-[21px] leading-[1.02] font-medium text-navy-950 sm:block sm:text-[23px] lg:-left-10"
          >
            From facts to a stronger filing.
          </p>

          <div className="flex overflow-hidden rounded-xl bg-white shadow-float ring-1 ring-navy-950/10">
            <aside
              className="hidden w-[150px] shrink-0 flex-col bg-[linear-gradient(180deg,#132a56_0%,#0b1d45_100%)] px-3 pt-4 pb-5 text-white sm:flex"
            >
              <div className="flex items-center gap-2 px-1">
                <FileText className="h-4 w-4 text-white/80" />
                <span className="text-[11px] font-bold tracking-[0.22em] text-white/90">
                  COMPLAINT
                </span>
              </div>
              <p className="mt-3 px-1 font-serif text-[13px] font-bold tracking-[-0.01em]">
                Smith v. Acme Corp.
              </p>
              <span className="mx-1 mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/12 px-2 py-[3px] text-[9.5px] font-semibold ring-1 ring-white/10">
                Federal Court
              </span>
              <nav className="mt-4 space-y-1">
                {[
                  { label: "Facts", active: true },
                  { label: "Evidence", active: false },
                  { label: "Legal Analysis", active: false },
                  { label: "Draft", active: false },
                ].map((tab) => (
                  <div
                    key={tab.label}
                    className={
                      tab.active
                        ? "flex items-center gap-2 rounded-md bg-white/12 px-2 py-[6px] text-[9.5px] font-medium ring-1 ring-white/10"
                        : "flex items-center gap-2 rounded-md px-2 py-[6px] text-[9.5px] font-medium text-white/70"
                    }
                  >
                    {tab.label}
                  </div>
                ))}
              </nav>
            </aside>

            <div className="min-w-0 flex-1 bg-white p-4 sm:p-5">
              <div className="sm:hidden">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
                  Complaint
                </p>
                <p className="mt-1 font-serif text-[19px] font-semibold text-navy-950">
                  Smith v. Acme Corp.
                </p>
              </div>

              <p className="mt-4 text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
                Key Facts
              </p>
              <div className="mt-2 space-y-1.5">
                <FactRow icon={<FolderOpen className="h-3.5 w-3.5" />} label="Incident timeline" meta="12 items" />
                <FactRow icon={<FileText className="h-3.5 w-3.5" />} label="Documents" meta="8 files" />
                <FactRow icon={<FileText className="h-3.5 w-3.5" />} label="Witness information" meta="3 entries" />
                <FactRow icon={<TrendingUp className="h-3.5 w-3.5" />} label="Damages and losses" meta="Calculated" />
                <FactRow icon={<Gavel className="h-3.5 w-3.5" />} label="Legal elements" meta="Complete" />
              </div>

              <div className="mt-4 rounded-lg border border-brand-200/70 bg-[linear-gradient(180deg,#f3f7fe_0%,#eaf1fd_100%)] p-3">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-brand-700">
                  AI Insights
                </p>
                <div className="mt-2 space-y-1.5">
                  <InsightRow icon={<CheckCircle2 className="h-3 w-3 text-success-500" />} text="Strong claim for negligence" />
                  <InsightRow icon={<CheckCircle2 className="h-3 w-3 text-success-500" />} text="Support from 3 recent cases" />
                  <InsightRow icon={<CheckCircle2 className="h-3 w-3 text-success-500" />} text="Procedural requirements met" />
                  <InsightRow icon={<AlertCircle className="h-3 w-3 text-gold-400" />} text="Low risk of dismissal" />
                </div>
              </div>

              <Button
                className="mt-4 h-9 w-full rounded-lg bg-brand-600 text-[10.5px] font-semibold hover:bg-brand-700"
                type="button"
              >
                Generate Draft Complaint
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FactRow({
  icon,
  label,
  meta,
}: {
  icon: React.ReactNode;
  label: string;
  meta: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-line/80 px-2.5 py-2">
      <div className="flex items-center gap-2 text-[11px] font-medium text-navy-950">
        <span className="text-brand-600">{icon}</span>
        {label}
      </div>
      <span className="text-[10px] text-ink-500">{meta}</span>
    </div>
  );
}

function InsightRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-start gap-1.5 text-[9.5px] font-medium leading-[1.3] text-navy-900">
      {icon}
      {text}
    </div>
  );
}
