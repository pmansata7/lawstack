import Link from "next/link";
import { Building2, Briefcase, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AUDIENCES = [
  {
    id: "law-firms",
    icon: Building2,
    title: "Law Firms",
    description:
      "Draft stronger pleadings, faster. Improve outcomes and client satisfaction.",
    cta: "Learn More",
  },
  {
    id: "in-house",
    icon: Briefcase,
    title: "In-House Legal",
    description:
      "Handle disputes efficiently with litigation-ready pleadings.",
    cta: "Learn More",
  },
  {
    id: "courts",
    icon: Landmark,
    title: "Courts",
    description:
      "Support clearer, better-organized filings and more efficient dockets.",
    cta: "Learn More",
  },
];

export function Audiences() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            A platform for every legal team.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Different users. A stronger justice system.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {AUDIENCES.map((aud) => (
            <Card key={aud.id} id={aud.id} className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <aud.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{aud.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between">
                <p className="text-sm text-muted-foreground">
                  {aud.description}
                </p>
                <Link
                  href={`/signup?type=${aud.id}`}
                  className="mt-4 text-sm font-medium text-primary hover:underline"
                >
                  {aud.cta} →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
