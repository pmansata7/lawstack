const GRANOLA_API_BASE = "https://api.granola.ai";

export type GranolaNoteListItem = {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
  summary_text?: string | null;
};

export type GranolaNoteDetail = GranolaNoteListItem & {
  summary_markdown?: string | null;
  transcript?: unknown;
};

type GranolaListResponse = {
  data?: GranolaNoteListItem[];
  has_more?: boolean;
  next_cursor?: string | null;
};

function authHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };
}

export async function listGranolaNotes(
  apiKey: string,
  options?: { limit?: number; cursor?: string | null },
): Promise<{ notes: GranolaNoteListItem[]; nextCursor: string | null }> {
  const limit = options?.limit ?? 50;
  const params = new URLSearchParams({ limit: String(limit) });
  if (options?.cursor) {
    params.set("cursor", options.cursor);
  }

  const res = await fetch(`${GRANOLA_API_BASE}/v1/notes?${params}`, {
    headers: authHeaders(apiKey),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Granola API error (${res.status}): ${body.slice(0, 200) || res.statusText}`,
    );
  }

  const json = (await res.json()) as GranolaListResponse;
  return {
    notes: json.data ?? [],
    nextCursor: json.next_cursor ?? null,
  };
}

export async function getGranolaNote(
  apiKey: string,
  noteId: string,
): Promise<GranolaNoteDetail> {
  const params = new URLSearchParams({ include: "transcript" });
  const res = await fetch(
    `${GRANOLA_API_BASE}/v1/notes/${encodeURIComponent(noteId)}?${params}`,
    {
      headers: authHeaders(apiKey),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Granola note fetch failed (${res.status}): ${body.slice(0, 200) || res.statusText}`,
    );
  }

  return (await res.json()) as GranolaNoteDetail;
}

export async function getGranolaTranscriptPages(
  apiKey: string,
  noteId: string,
): Promise<unknown[]> {
  const segments: unknown[] = [];
  let cursor: string | null = null;
  let guard = 0;

  while (guard < 50) {
    guard++;
    const params = new URLSearchParams({ limit: "500" });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(
      `${GRANOLA_API_BASE}/v1/notes/${encodeURIComponent(noteId)}/transcript?${params}`,
      {
        headers: authHeaders(apiKey),
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `Granola transcript fetch failed (${res.status}): ${body.slice(0, 200) || res.statusText}`,
      );
    }

    const json = (await res.json()) as {
      data?: unknown[];
      has_more?: boolean;
      next_cursor?: string | null;
    };
    if (json.data?.length) {
      segments.push(...json.data);
    }
    if (!json.has_more || !json.next_cursor) break;
    cursor = json.next_cursor;
  }

  return segments;
}
