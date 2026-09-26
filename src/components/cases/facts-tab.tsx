"use client";

import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Fact {
  id: string;
  statement: string;
  date: Date | null;
  category: string;
  source: string | null;
}

const CATEGORIES = [
  { value: "INCIDENT", label: "Incident" },
  { value: "BACKGROUND", label: "Background" },
  { value: "DAMAGES", label: "Damages" },
  { value: "PROCEDURAL", label: "Procedural" },
  { value: "WITNESS", label: "Witness" },
  { value: "DOCUMENT", label: "Document" },
  { value: "OTHER", label: "Other" },
];

export function FactsTab({
  caseId,
  initialFacts,
}: {
  caseId: string;
  initialFacts: Fact[];
}) {
  const router = useRouter();
  const [facts, setFacts] = useState(initialFacts);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newFact, setNewFact] = useState({
    statement: "",
    date: "",
    category: "INCIDENT",
    source: "",
  });

  const handleAdd = async () => {
    if (!newFact.statement.trim()) {
      toast.error("Fact statement is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/facts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newFact,
          date: newFact.date ? new Date(newFact.date) : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to add fact");
      const { fact } = await res.json();
      setFacts([fact, ...facts]);
      setNewFact({ statement: "", date: "", category: "INCIDENT", source: "" });
      setAdding(false);
      toast.success("Fact added");
      router.refresh();
    } catch {
      toast.error("Failed to add fact");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (factId: string) => {
    try {
      const res = await fetch(`/api/cases/${caseId}/facts?id=${factId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete fact");
      setFacts(facts.filter((f) => f.id !== factId));
      toast.success("Fact deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete fact");
    }
  };

  return (
    <div className="space-y-4">
      {!adding ? (
        <Button onClick={() => setAdding(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Fact
        </Button>
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="statement">Fact Statement</Label>
              <Textarea
                id="statement"
                placeholder="On January 15, 2024, defendant negligently operated..."
                value={newFact.statement}
                onChange={(e) =>
                  setNewFact({ ...newFact, statement: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="date">Date (optional)</Label>
                <Input
                  id="date"
                  type="date"
                  value={newFact.date}
                  onChange={(e) =>
                    setNewFact({ ...newFact, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newFact.category}
                  onValueChange={(v: string | null) =>
                    setNewFact({ ...newFact, category: v ?? "INCIDENT" })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source (optional)</Label>
                <Input
                  id="source"
                  placeholder="Medical records, witness..."
                  value={newFact.source}
                  onChange={(e) =>
                    setNewFact({ ...newFact, source: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Fact
              </Button>
              <Button variant="outline" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {facts.length === 0 && !adding && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No facts added yet. Click &quot;Add Fact&quot; to get started.
          </p>
        )}
        {facts.map((fact) => (
          <Card key={fact.id}>
            <CardContent className="flex items-start justify-between gap-4 pt-4">
              <div className="flex-1">
                <p className="text-sm">{fact.statement}</p>
                <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                  {fact.date && (
                    <span>
                      {new Date(fact.date).toLocaleDateString()}
                    </span>
                  )}
                  <span className="rounded bg-muted px-2 py-0.5">
                    {fact.category}
                  </span>
                  {fact.source && <span>Source: {fact.source}</span>}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(fact.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
