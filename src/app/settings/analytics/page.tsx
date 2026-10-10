import { AnalyticsDashboard } from "@/components/settings/analytics-dashboard";

export default function AnalyticsSettingsPage() {
  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl font-semibold">Workspace analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Onboarding and activation metrics for the last 30 days.
      </p>
      <div className="mt-6">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
