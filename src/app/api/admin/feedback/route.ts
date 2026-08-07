import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getFeedbackStats, listFeedback } from "@/lib/db";
import type { FeedbackCategory, FeedbackStatus } from "@/lib/types";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as FeedbackStatus | null;
  const category = searchParams.get("category") as FeedbackCategory | null;

  const [feedback, stats] = await Promise.all([
    listFeedback({
      status: status || undefined,
      category: category || undefined,
    }),
    getFeedbackStats(),
  ]);

  return NextResponse.json({ feedback, stats, admin: session });
}
