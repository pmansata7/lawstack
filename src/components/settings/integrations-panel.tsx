"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function IntegrationsPanel() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Granola</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Connect Granola API keys in{" "}
          <Link href="/settings/ai" className="font-medium underline">AI Settings</Link>{" "}
          to import meeting transcripts into matters.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clio & MyCase</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          OAuth connectors are not live yet. From Review &amp; File, use{" "}
          <span className="font-medium">Push to Clio / MyCase</span> to preview the export payload Lawstack will send once connected.
        </CardContent>
      </Card>
    </div>
  );
}
