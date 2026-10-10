import { IntegrationsPanel } from "@/components/settings/integrations-panel";

export default function IntegrationsSettingsPage() {
  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl font-semibold">Integrations</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Transcripts, practice management, and export connectors.
      </p>
      <div className="mt-6 max-w-2xl">
        <IntegrationsPanel />
      </div>
    </div>
  );
}
