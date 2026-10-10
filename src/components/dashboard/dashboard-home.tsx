"use client";

import { Suspense } from "react";
import { GettingStartedPanel } from "@/components/dashboard/getting-started-panel";

export function DashboardHomeIntro() {
  return (
    <Suspense fallback={null}>
      <GettingStartedPanel />
    </Suspense>
  );
}
