"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAuthFetchHeaders } from "@/lib/auth/auth-fetch-headers";

type Template = {
  id: string;
  name: string;
  draftType: string;
  jurisdiction: string | null;
  boilerplate: string | null;
  isDefault: boolean;
};

export function FirmTemplatesForm() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [draftType, setDraftType] = useState("COMPLAINT");
  const [boilerplate, setBoilerplate] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const headers = await getAuthFetchHeaders();
      const res = await fetch("/api/firm-templates", { credentials: "same-origin", headers });
      const data = await res.json();
      setTemplates(data.templates ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const headers = await getAuthFetchHeaders();
      const res = await fetch("/api/firm-templates", {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({
          name,
          draftType,
          boilerplate,
          sections: [{ heading: "CAPTION", body: "" }],
          isDefault: templates.length === 0,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setName("");
      setBoilerplate("");
      await load();
      toast.success("Template saved");
    } catch {
      toast.error("Could not save template");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const headers = await getAuthFetchHeaders();
    await fetch(`/api/firm-templates/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
      headers,
    });
    await load();
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-md border p-4">
        <Label>New firm template</Label>
        <Input placeholder="Name (e.g. Firm complaint boilerplate)" value={name} onChange={(e) => setName(e.target.value)} />
        <Select value={draftType} onValueChange={(v) => setDraftType(v ?? "COMPLAINT")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="COMPLAINT">Complaint</SelectItem>
            <SelectItem value="ANSWER">Answer</SelectItem>
            <SelectItem value="MOTION">Motion</SelectItem>
            <SelectItem value="AMENDMENT">Amendment</SelectItem>
          </SelectContent>
        </Select>
        <Textarea
          rows={6}
          placeholder="Approved caption language, signature blocks, jury demand…"
          value={boilerplate}
          onChange={(e) => setBoilerplate(e.target.value)}
        />
        <Button type="button" onClick={create} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add template
        </Button>
      </div>

      <ul className="space-y-2">
        {templates.map((t) => (
          <li key={t.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.draftType}{t.isDefault ? " • default" : ""}</p>
            </div>
            <Button type="button" size="icon" variant="ghost" onClick={() => remove(t.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
