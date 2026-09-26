"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FolderOpen,
  Gavel,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  PlayCircle,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)_0%,_transparent_50%)] opacity-[0.03]" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Headline */}
          <div className="flex flex-col gap-6">
            <Badge variant="secondary" className="w-fit">
              AI for real-world litigation
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Stronger cases{" "}
              <span className="text-primary">start with better facts.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Lawstack helps lawyers, law firms, and courts turn facts into
              evidence-backed pleadings that survive motions to dismiss and
              demurrers.
            </p>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Organize facts and evidence from day one
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Generate complaint drafts with legal precision
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Strengthen claims with precedent and procedural guidance
              </li>
            </ul>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Request a Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login?demo=1">
                  <PlayCircle className="mr-2 h-4 w-4" /> Watch 1-Minute Video
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Interactive complaint demo card */}
          <div className="relative">
            <Card className="shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Complaint
                    </span>
                  </div>
                  <Badge variant="secondary">Federal Court</Badge>
                </div>
                <CardTitle className="text-xl">Smith v. Acme Corp.</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    1. Facts
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    2. Evidence
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    3. Legal Analysis
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    4. Draft
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Facts */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Key Facts
                  </p>
                  <div className="space-y-2">
                    <FactRow
                      icon={<FolderOpen className="h-4 w-4" />}
                      label="Incident timeline"
                      meta="12 items"
                    />
                    <FactRow
                      icon={<FileText className="h-4 w-4" />}
                      label="Documents"
                      meta="8 files"
                    />
                    <FactRow
                      icon={<FileText className="h-4 w-4" />}
                      label="Witness information"
                      meta="3 entries"
                    />
                    <FactRow
                      icon={<TrendingUp className="h-4 w-4" />}
                      label="Damages and losses"
                      meta="Calculated"
                    />
                    <FactRow
                      icon={<Gavel className="h-4 w-4" />}
                      label="Legal elements"
                      meta="Complete"
                    />
                  </div>
                </div>
                {/* AI Insights */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Insights
                  </p>
                  <div className="space-y-2">
                    <InsightRow
                      icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
                      text="Strong claim for negligence"
                    />
                    <InsightRow
                      icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
                      text="Support from 3 recent cases"
                    />
                    <InsightRow
                      icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
                      text="Procedural requirements met"
                    />
                    <InsightRow
                      icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
                      text="Low risk of dismissal"
                    />
                  </div>
                </div>
                <Button className="w-full">
                  Generate Draft Complaint
                </Button>
              </CardContent>
            </Card>
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
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </div>
      <span className="text-xs text-muted-foreground">{meta}</span>
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
    <div className="flex items-center gap-2 text-sm">
      {icon}
      {text}
    </div>
  );
}
