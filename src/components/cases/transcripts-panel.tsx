"use client";

import { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Square,
  Upload,
  Loader2,
  Sparkles,
  Trash2,
  RefreshCw,
  CloudDownload,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthFetchHeaders } from "@/lib/auth/auth-fetch-headers";

export type CaseTranscriptSummary = {
  id: string;
  title: string;
  source: string;
  status: string;
  summary: string | null;
  recordedAt: string | null;
  externalId: string | null;
  createdAt: string;
  preview?: string;
};

type GranolaNote = {
  id: string;
  title: string;
  created_at?: string;
  summary_text?: string | null;
};

export function TranscriptsPanel({
  caseId,
  initialTranscripts,
}: {
  caseId: string;
  initialTranscripts: CaseTranscriptSummary[];
}) {
  const router = useRouter();
  const transcripts = initialTranscripts;
  const [selectedId, setSelectedId] = useState<string | null>(
    initialTranscripts[0]?.id ?? null,
  );
  const [recording, setRecording] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState("");
  const [importing, setImporting] = useState(false);
  const [granolaNotes, setGranolaNotes] = useState<GranolaNote[] | null>(null);
  const [granolaLoading, setGranolaLoading] = useState(false);
  const [granolaError, setGranolaError] = useState<string | null>(null);
  const [analyzeNotes, setAnalyzeNotes] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected =
    transcripts.find((t) => t.id === selectedId) ?? transcripts[0] ?? null;
  const effectiveSelectedId = selected?.id ?? null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadRecording(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      toast.message("Recording started");
    } catch {
      toast.error("Microphone access denied or unavailable");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const uploadRecording = async (blob: Blob) => {
    setImporting(true);
    try {
      const form = new FormData();
      form.append("mode", "recording");
      form.append("audio", blob, "recording.webm");
      if (recordingTitle.trim()) {
        form.append("title", recordingTitle.trim());
      }
      form.append("autoTranscribe", "true");

      const res = await fetch(`/api/cases/${caseId}/transcripts/import`, {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      toast.success("Recording saved", {
        description:
          data.transcript?.status === "READY"
            ? "Transcript generated with Whisper."
            : "Saved — add OpenAI key in Settings to auto-transcribe.",
      });
      setRecordingTitle("");
      router.refresh();
      if (data.transcript?.id) setSelectedId(data.transcript.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Recording upload failed");
    } finally {
      setImporting(false);
    }
  };

  const importFile = async (file: File) => {
    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/cases/${caseId}/transcripts/import`, {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      toast.success(`Imported “${data.transcript?.title ?? file.name}”`);
      router.refresh();
      if (data.transcript?.id) setSelectedId(data.transcript.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const loadGranolaNotes = async () => {
    setGranolaLoading(true);
    setGranolaError(null);
    try {
      const res = await fetch("/api/integrations/granola/notes");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGranolaNotes([]);
        setGranolaError(data.error ?? "Could not load Granola notes");
        return;
      }
      setGranolaNotes(data.notes ?? []);
    } catch {
      setGranolaError("Could not load Granola notes");
    } finally {
      setGranolaLoading(false);
    }
  };

  const importGranolaNote = async (noteId: string) => {
    setBusyId(noteId);
    try {
      const headers = await getAuthFetchHeaders();
      const res = await fetch(`/api/cases/${caseId}/transcripts/import`, {
        method: "POST",
        headers,
        body: JSON.stringify({ granolaNoteId: noteId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      toast.success(
        data.duplicate
          ? "This Granola note is already on the case"
          : `Imported “${data.transcript?.title}”`,
      );
      router.refresh();
      if (data.transcript?.id) setSelectedId(data.transcript.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Granola import failed");
    } finally {
      setBusyId(null);
    }
  };

  const transcribe = async (transcriptId: string) => {
    setBusyId(transcriptId);
    try {
      const res = await fetch(
        `/api/cases/${caseId}/transcripts/${transcriptId}/transcribe`,
        { method: "POST" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Transcription failed");
      toast.success("Transcript ready");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transcription failed");
    } finally {
      setBusyId(null);
    }
  };

  const analyzeSelected = async () => {
    if (!effectiveSelectedId) {
      toast.error("Select a transcript to analyze");
      return;
    }
    const selectedTranscript = transcripts.find(
      (t) => t.id === effectiveSelectedId,
    );
    if (selectedTranscript?.status !== "READY") {
      toast.error("Transcribe this recording before analyzing");
      return;
    }

    setBusyId(effectiveSelectedId);
    try {
      const headers = await getAuthFetchHeaders();
      const res = await fetch(
        `/api/cases/${caseId}/transcripts/${effectiveSelectedId}/analyze`,
        {
          method: "POST",
          credentials: "same-origin",
          headers,
          body: JSON.stringify({
            narrative: analyzeNotes.trim(),
            apply: true,
            includeDocuments: true,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");

      const applied = data.applied as {
        facts: number;
        timeline: number;
        witnesses: number;
        damages: number;
      };
      toast.success("Transcript analyzed", {
        description: `${applied.facts} facts, ${applied.timeline} timeline, ${applied.witnesses} witnesses, ${applied.damages} damages added.`,
      });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setBusyId(null);
    }
  };

  const deleteTranscript = async (transcriptId: string) => {
    try {
      const res = await fetch(
        `/api/cases/${caseId}/transcripts?transcriptId=${transcriptId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Delete failed");
      if (selectedId === transcriptId) {
        setSelectedId(null);
      }
      toast.success("Transcript removed");
      router.refresh();
    } catch {
      toast.error("Failed to delete transcript");
    }
  };

  const selectedForAnalyze = selected;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recordings & transcripts</CardTitle>
          <CardDescription>
            Record calls, import Granola or other transcript files, then analyze
            a chosen transcript into case facts. Configure{" "}
            <Link
              href="/settings/ai"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              AI & Granola API keys
            </Link>{" "}
            in Settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mic className="h-4 w-4 text-primary" />
                Record audio
              </div>
              <Input
                placeholder="Optional title (e.g. Client intake call)"
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
                disabled={recording || importing}
              />
              <div className="flex gap-2">
                {!recording ? (
                  <Button
                    type="button"
                    onClick={() => void startRecording()}
                    disabled={importing}
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    Start recording
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={stopRecording}
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Stop & save
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Uses your browser microphone. OpenAI (Whisper) in Settings
                transcribes after save.
              </p>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Upload className="h-4 w-4 text-primary" />
                Import file
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.txt,.md,.markdown,text/*,application/json"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void importFile(file);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={importing}
                onClick={() => fileInputRef.current?.click()}
              >
                {importing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Choose transcript file
              </Button>
              <p className="text-xs text-muted-foreground">
                Supports Granola JSON exports, plain text, and markdown
                transcripts.
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CloudDownload className="h-4 w-4 text-primary" />
                Import from Granola
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={granolaLoading}
                onClick={() => void loadGranolaNotes()}
              >
                {granolaLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Load notes
              </Button>
            </div>
            {granolaError && (
              <p className="text-sm text-destructive">{granolaError}</p>
            )}
            {granolaNotes && granolaNotes.length === 0 && !granolaError && (
              <p className="text-sm text-muted-foreground">No notes returned.</p>
            )}
            {granolaNotes && granolaNotes.length > 0 && (
              <ul className="max-h-48 space-y-2 overflow-y-auto">
                {granolaNotes.map((note) => (
                  <li
                    key={note.id}
                    className="flex items-start justify-between gap-2 rounded-md bg-muted/40 p-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{note.title}</p>
                      {note.created_at && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(note.created_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={busyId === note.id}
                      onClick={() => void importGranolaNote(note.id)}
                    >
                      {busyId === note.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Import"
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Case transcripts ({transcripts.length})</CardTitle>
          <CardDescription>
            Select one, then run AI analysis to populate facts, timeline,
            witnesses, and damages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {transcripts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No transcripts yet. Record or import above.
            </p>
          ) : (
            <ul className="space-y-2">
              {transcripts.map((t) => (
                <li
                  key={t.id}
                  className={`flex cursor-pointer flex-col gap-2 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                    selectedId === t.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedId(t.id)}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{t.title}</p>
                      <Badge variant="outline">{t.source}</Badge>
                      <Badge
                        variant={
                          t.status === "READY"
                            ? "default"
                            : t.status === "FAILED"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {t.status.replace("_", " ")}
                      </Badge>
                    </div>
                    {(t.preview || t.summary) && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {t.preview ?? t.summary}
                      </p>
                    )}
                  </div>
                  <div
                    className="flex shrink-0 gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t.status === "PENDING_TRANSCRIPTION" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={busyId === t.id}
                        onClick={() => void transcribe(t.id)}
                      >
                        {busyId === t.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Transcribe"
                        )}
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => void deleteTranscript(t.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="analyze-notes">Optional notes for analysis</Label>
            <Textarea
              id="analyze-notes"
              rows={3}
              placeholder="e.g. Focus on payment disputes and dates mentioned."
              value={analyzeNotes}
              onChange={(e) => setAnalyzeNotes(e.target.value)}
            />
            <Button
              type="button"
              disabled={!selectedForAnalyze || busyId === effectiveSelectedId}
              onClick={() => void analyzeSelected()}
            >
              {busyId === effectiveSelectedId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Analyze selected transcript
              {selectedForAnalyze ? `: ${selectedForAnalyze.title}` : ""}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
