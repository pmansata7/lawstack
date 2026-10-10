import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { execSync } from "node:child_process";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const output = execSync("npx tsx evals/run-eval.ts", {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, EVAL_LIVE: process.env.EVAL_LIVE ?? "0" },
    });
    return NextResponse.json({ ok: true, output });
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string };
    return NextResponse.json(
      {
        ok: false,
        output: err.stdout ?? "",
        error: err.stderr ?? "Eval failed",
      },
      { status: 500 },
    );
  }
}
