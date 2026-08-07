import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteFeedback, updateFeedbackStatus } from "@/lib/db";
import type { FeedbackStatus } from "@/lib/types";

const VALID_STATUS = new Set<FeedbackStatus>(["new", "reviewed", "resolved"]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const status = String(body.status ?? "") as FeedbackStatus;

  if (!VALID_STATUS.has(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await updateFeedbackStatus(id, status);
  if (!updated) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const ok = await deleteFeedback(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
