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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Witness {
  id: string;
  name: string;
  contact: string | null;
  statement: string | null;
  credibility: string | null;
}

const CREDIBILITY = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function WitnessesTab({
  caseId,
  initialWitnesses,
}: {
  caseId: string;
  initialWitnesses: Witness[];
}) {
  const router = useRouter();
  const [witnesses, setWitnesses] = useState(initialWitnesses);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newWitness, setNewWitness] = useState({
    name: "",
    contact: "",
    statement: "",
    credibility: "medium",
  });

  const handleAdd = async () => {
    if (!newWitness.name.trim()) {
      toast.error("Witness name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/witnesses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWitness),
      });
      if (!res.ok) throw new Error("Failed to add witness");
      const { witness } = await res.json();
      setWitnesses([witness, ...witnesses]);
      setNewWitness({ name: "", contact: "", statement: "", credibility: "medium" });
      setAdding(false);
      toast.success("Witness added");
      router.refresh();
    } catch {
      toast.error("Failed to add witness");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (witnessId: string) => {
    try {
      const res = await fetch(`/api/cases/${caseId}/witnesses?id=${witnessId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setWitnesses(witnesses.filter((w) => w.id !== witnessId));
      toast.success("Witness deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete witness");
    }
  };

  return (
    <div className="space-y-4">
      {!adding ? (
        <Button onClick={() => setAdding(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Witness
        </Button>
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="w-name">Name</Label>
                <Input
                  id="w-name"
                  placeholder="John Doe"
                  value={newWitness.name}
                  onChange={(e) =>
                    setNewWitness({ ...newWitness, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="w-contact">Contact (optional)</Label>
                <Input
                  id="w-contact"
                  placeholder="email / phone"
                  value={newWitness.contact}
                  onChange={(e) =>
                    setNewWitness({ ...newWitness, contact: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="w-statement">Statement / Testimony Summary</Label>
              <Textarea
                id="w-statement"
                placeholder="Witness observed the defendant..."
                value={newWitness.statement}
                onChange={(e) =>
                  setNewWitness({ ...newWitness, statement: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="w-credibility">Credibility Assessment</Label>
              <Select
                value={newWitness.credibility}
                onValueChange={(v: string | null) =>
                  setNewWitness({ ...newWitness, credibility: v ?? "medium" })
                }
              >
                <SelectTrigger id="w-credibility" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREDIBILITY.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Witness
              </Button>
              <Button variant="outline" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {witnesses.length === 0 && !adding && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No witnesses added yet.
          </p>
        )}
        {witnesses.map((w) => (
          <Card key={w.id}>
            <CardContent className="flex items-start justify-between gap-4 pt-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{w.name}</p>
                  {w.contact && (
                    <p className="text-xs text-muted-foreground">{w.contact}</p>
                  )}
                  {w.statement && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {w.statement}
                    </p>
                  )}
                  {w.credibility && (
                    <Badge
                      variant="outline"
                      className="mt-1 text-xs"
                    >
                      Credibility: {w.credibility}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(w.id)}
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
