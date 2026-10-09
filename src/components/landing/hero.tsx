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
} from "lucide-react";

export function Hero() {
  return (
    <section className="border-b border-navy-950/10 bg-ruled">
      <div className="container-x grid items-end gap-12 pt-16 pb-20 lg:grid-cols-[1fr_minmax(0,1.05fr)] lg:gap-16 lg:pt-20 lg:pb-24">
        <div className="max-w-xl">
          <p className="eyebrow">Litigation workspace</p>
          <h1 className="heading-serif mt-5 text-[42px] leading-[1.02] sm:text-[52px] lg:text-[58px]">
            Facts first.
            <br />
            Filings that hold up.
          </h1>
          <p className="mt-6 text-pretty text-[16px] leading-[1.7] text-ink-600">
            Lawstack ties evidence, elements, and draft pleadings in one
            thread—so your complaint reads like the record, not a template.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              className="h-11 rounded-md bg-navy-950 px-6 text-[13px] font-semibold hover:bg-navy-900"
              asChild
            >
              <Link href="/signup">Request access</Link>
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-md border-navy-950/20 bg-paper px-6 text-[13px] font-semibold text-navy-950 hover:bg-tint"
              asChild
            >
              <Link href="/login?demo=1">Sign in</Link>
            </Button>
          </div>
          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-navy-950/10 pt-8">
            {[
              { term: "Setup", detail: "Jurisdiction & claims" },
              { term: "Record", detail: "Facts linked to proof" },
              { term: "Draft", detail: "Court-ready output" },
            ].map((item) => (
              <div key={item.term}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  {item.term}
                </dt>
                <dd className="mt-1 text-[13px] font-medium text-navy-950">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative lg:mb-2">
          <p
            className="absolute -top-2 right-0 z-10 hidden max-w-[11rem] font-[family-name:var(--font-hand)] text-[22px] leading-tight text-navy-950 lg:block"
          >
            Smith v. Acme — docket preview
          </p>

          <div className="border-hard bg-white shadow-hard">
            <aside
              className="flex items-center justify-between border-b border-navy-950/10 bg-navy-950 px-4 py-3 text-white sm:hidden"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                Case file
              </span>
              <span className="font-serif text-sm font-semibold">
                Smith v. Acme Corp.
              </span>
            </aside>

            <div className="flex min-h-[320px]">
              <aside
                className="hidden w-[148px] shrink-0 flex-col border-r border-navy-950/10 bg-navy-950 px-3 py-4 text-white sm:flex"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-white/70" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/80">
                    Complaint
                  </span>
                </div>
                <p className="mt-3 font-serif text-[13px] font-semibold leading-snug">
                  Smith v. Acme Corp.
                </p>
                <span className="mt-2 inline-flex w-fit border border-white/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-white/90">
                  Federal
                </span>
                <nav className="mt-5 space-y-0.5">
                  {[
                    { label: "Facts", active: true },
                    { label: "Evidence", active: false },
                    { label: "Analysis", active: false },
                    { label: "Draft", active: false },
                  ].map((tab) => (
                    <div
                      key={tab.label}
                      className={
                        tab.active
                          ? "border-l-2 border-white bg-white/10 px-2 py-1.5 text-[10px] font-medium"
                          : "px-2 py-1.5 text-[10px] font-medium text-white/65"
                      }
                    >
                      {tab.label}
                    </div>
                  ))}
                </nav>
              </aside>

              <div className="min-w-0 flex-1 p-4 sm:p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Key facts
                </p>
                <div className="mt-3 space-y-0 border border-navy-950/10">
                  <FactRow icon={<FolderOpen className="h-3.5 w-3.5" />} label="Incident timeline" meta="12" />
                  <FactRow icon={<FileText className="h-3.5 w-3.5" />} label="Documents" meta="8" border />
                  <FactRow icon={<FileText className="h-3.5 w-3.5" />} label="Witnesses" meta="3" border />
                  <FactRow icon={<TrendingUp className="h-3.5 w-3.5" />} label="Damages" meta="Done" border />
                  <FactRow icon={<Gavel className="h-3.5 w-3.5" />} label="Elements" meta="Complete" border />
                </div>

                <div className="mt-4 border border-navy-950/10 bg-tint p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600">
                    Review notes
                  </p>
                  <div className="mt-2 space-y-1.5">
                    <InsightRow icon={<CheckCircle2 className="h-3 w-3 text-success-500" />} text="Negligence elements covered" />
                    <InsightRow icon={<CheckCircle2 className="h-3 w-3 text-success-500" />} text="Three on-point authorities" />
                    <InsightRow icon={<AlertCircle className="h-3 w-3 text-gold-400" />} text="Dismissal risk: low" />
                  </div>
                </div>

                <Button
                  className="mt-4 h-9 w-full rounded-md bg-navy-950 text-[11px] font-semibold uppercase tracking-wide hover:bg-navy-900"
                  type="button"
                >
                  Generate draft
                </Button>
              </div>
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
  border,
}: {
  icon: React.ReactNode;
  label: string;
  meta: string;
  border?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2.5 ${border ? "border-t border-navy-950/10" : ""}`}
    >
      <div className="flex items-center gap-2 text-[11px] font-medium text-navy-950">
        <span className="text-navy-950/70">{icon}</span>
        {label}
      </div>
      <span className="font-mono text-[10px] text-ink-500">{meta}</span>
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
    <div className="flex items-start gap-1.5 text-[10px] font-medium leading-snug text-navy-950">
      {icon}
      {text}
    </div>
  );
}
