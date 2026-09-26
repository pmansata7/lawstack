"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TimelineEntry {
  id: string;
  date: Date;
  title: string;
  description: string | null;
}

export function TimelineTab({
  caseId,
  initialTimeline,
}: {
  caseId: string;
  initialTimeline: TimelineEntry[];
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialTimeline);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: "",
    title: "",
    description: "",
  });

  const handleAdd = async () => {
    if (!newEntry.date || !newEntry.title.trim()) {
      toast.error("Date and title are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEntry,
          date: new Date(newEntry.date),
        }),
      });
      if (!res.ok) throw new Error("Failed to add timeline entry");
      const { entry } = await res.json();
      setEntries([...entries, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setNewEntry({ date: "", title: "", description: "" });
      setAdding(false);
      toast.success("Timeline entry added");
      router.refresh();
    } catch {
      toast.error("Failed to add timeline entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      const res = await fetch(`/api/cases/${caseId}/timeline?id=${entryId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setEntries(entries.filter((e) => e.id !== entryId));
      toast.success("Timeline entry deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete timeline entry");
    }
  };

  return (
    <div className="space-y-4">
      {!adding ? (
        <Button onClick={() => setAdding(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Timeline Entry
        </Button>
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tl-date">Date</Label>
                <Input
                  id="tl-date"
                  type="date"
                  value={newEntry.date}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tl-title">Title</Label>
                <Input
                  id="tl-title"
                  placeholder="Incident occurred"
                  value={newEntry.title}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, title: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tl-desc">Description (optional)</Label>
              <Textarea
                id="tl-desc"
                placeholder="Details of what happened..."
                value={newEntry.description}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Entry
              </Button>
              <Button variant="outline" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {entries.length === 0 && !adding && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No timeline entries yet.
          </p>
        )}
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex items-start justify-between gap-4 pt-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                  {entry.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {entry.description}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(entry.id)}
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
