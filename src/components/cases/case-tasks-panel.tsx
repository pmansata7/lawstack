"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

type Task = {
  id: string;
  title: string;
  assigneeEmail: string | null;
  claimElement: string | null;
  status: string;
};

export function CaseTasksPanel({ caseId }: { caseId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/cases/${caseId}/tasks`);
    if (!res.ok) return;
    const data = await res.json();
    setTasks(data.tasks ?? []);
  };

  useEffect(() => {
    void load();
  }, [caseId]);

  const addTask = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed");
      setTitle("");
      await load();
    } catch {
      toast.error("Could not create task");
    } finally {
      setLoading(false);
    }
  };

  const toggleDone = async (task: Task) => {
    const status = task.status === "DONE" ? "OPEN" : "DONE";
    await fetch(`/api/cases/${caseId}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  };

  return (
    <div className="border border-navy-950/10 bg-white p-4">
      <h3 className="font-serif text-base font-semibold">Matter tasks</h3>
      <p className="text-xs text-muted-foreground">
        Assign element gaps to paralegals or co-counsel.
      </p>
      <div className="mt-3 flex gap-2">
        <Input
          placeholder="e.g. Obtain medical records for causation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button type="button" size="icon" onClick={addTask} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
      <ul className="mt-3 space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between gap-2 rounded border px-2 py-2 text-sm"
          >
            <button type="button" className="text-left" onClick={() => toggleDone(task)}>
              {task.title}
            </button>
            <Badge variant={task.status === "DONE" ? "secondary" : "outline"}>
              {task.status}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
