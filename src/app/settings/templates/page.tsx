import { FirmTemplatesForm } from "@/components/settings/firm-templates-form";

export default function TemplatesSettingsPage() {
  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl font-semibold">Firm templates</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Approved caption, boilerplate, and section structure used during drafting.
      </p>
      <div className="mt-6 max-w-2xl">
        <FirmTemplatesForm />
      </div>
    </div>
  );
}
