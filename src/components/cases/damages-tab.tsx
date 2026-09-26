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
import { Plus, Trash2, Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DAMAGE_CATEGORIES } from "@/lib/legal/claim-templates";

interface Damages {
  id: string;
  category: string;
  amount: number;
  description: string | null;
}

export function DamagesTab({
  caseId,
  initialDamages,
  total,
}: {
  caseId: string;
  initialDamages: Damages[];
  total: number;
}) {
  const router = useRouter();
  const [damages, setDamages] = useState(initialDamages);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newDamage, setNewDamage] = useState({
    category: "medical",
    amount: "",
    description: "",
  });

  const currentTotal = damages.reduce((sum, d) => sum + d.amount, 0);

  const handleAdd = async () => {
    if (!newDamage.amount || parseFloat(newDamage.amount) <= 0) {
      toast.error("Valid amount is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/damages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newDamage.category,
          amount: parseFloat(newDamage.amount),
          description: newDamage.description,
        }),
      });
      if (!res.ok) throw new Error("Failed to add damages");
      const { damages: newD } = await res.json();
      setDamages([...damages, newD]);
      setNewDamage({ category: "medical", amount: "", description: "" });
      setAdding(false);
      toast.success("Damages added");
      router.refresh();
    } catch {
      toast.error("Failed to add damages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (damageId: string) => {
    try {
      const res = await fetch(`/api/cases/${caseId}/damages?id=${damageId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setDamages(damages.filter((d) => d.id !== damageId));
      toast.success("Damages deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete damages");
    }
  };

  const getCategoryLabel = (value: string) =>
    DAMAGE_CATEGORIES.find((c) => c.value === value)?.label ?? value;

  return (
    <div className="space-y-4">
      {/* Total */}
      <Card className="bg-primary/5">
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Damages</p>
            <p className="text-3xl font-bold">
              ${currentTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>

      {!adding ? (
        <Button onClick={() => setAdding(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Damages
        </Button>
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="d-category">Category</Label>
                <Select
                  value={newDamage.category}
                  onValueChange={(v: string | null) =>
                    setNewDamage({ ...newDamage, category: v ?? "medical" })
                  }
                >
                  <SelectTrigger id="d-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAMAGE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-amount">Amount ($)</Label>
                <Input
                  id="d-amount"
                  type="number"
                  step="0.01"
                  placeholder="50000.00"
                  value={newDamage.amount}
                  onChange={(e) =>
                    setNewDamage({ ...newDamage, amount: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-desc">Description (optional)</Label>
              <Textarea
                id="d-desc"
                placeholder="Emergency room bills, surgery costs..."
                value={newDamage.description}
                onChange={(e) =>
                  setNewDamage({ ...newDamage, description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Damages
              </Button>
              <Button variant="outline" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {damages.length === 0 && !adding && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No damages recorded yet.
          </p>
        )}
        {damages.map((d) => (
          <Card key={d.id}>
            <CardContent className="flex items-center justify-between gap-4 pt-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getCategoryLabel(d.category)}</Badge>
                  <span className="text-lg font-semibold">
                    ${d.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {d.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {d.description}
                  </p>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(d.id)}
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
